from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.core.cache import cache
from django.db import transaction
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.conf import settings
import logging
from datetime import timedelta

from .models import Comment
from .serializers import CommentSerializer
from apps.features.photos.models import Photo
from apps.core.users.models import User

logger = logging.getLogger(__name__)

class CommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling photo comment operations.
    
    Supports:
    - Create, read, update, delete comments
    - List comments by photo
    - Get user's comment history
    - Get comment statistics
    - Recent comments
    - Comment moderation
    """
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    
    # Configure comment settings
    MAX_COMMENT_LENGTH = getattr(settings, 'MAX_COMMENT_LENGTH', 1000)
    COMMENTS_PER_PAGE = getattr(settings, 'COMMENTS_PER_PAGE', 20)
    COMMENT_RATE_LIMIT = getattr(settings, 'COMMENT_RATE_LIMIT', 5)  # comments per minute
    CACHE_TIMEOUT = 300  # 5 minutes

    def get_queryset(self):
        """Get comments queryset with optimized loading."""
        return Comment.objects.select_related('user', 'photo')

    def create(self, request, *args, **kwargs):
        """
        Create a new comment with rate limiting and validation.
        """
        try:
            # Validate required fields
            photo_id = request.data.get('photo_id')
            comment_text = request.data.get('comment_text')

            if not photo_id:
                raise ValidationError("photo_id is required")
            if not comment_text:
                raise ValidationError("comment_text is required")
            if len(comment_text) > self.MAX_COMMENT_LENGTH:
                raise ValidationError(f"Comment text cannot exceed {self.MAX_COMMENT_LENGTH} characters")

            # Check rate limiting
            recent_comments = Comment.objects.filter(
                user=request.user,
                created_at__gte=timezone.now() - timedelta(minutes=1)
            ).count()

            if recent_comments >= self.COMMENT_RATE_LIMIT:
                raise PermissionDenied(f"Maximum {self.COMMENT_RATE_LIMIT} comments per minute allowed")

            photo = get_object_or_404(Photo, id=photo_id)
            
            # Create comment
            with transaction.atomic():
                comment = Comment.objects.create(
                    user=request.user,
                    photo=photo,
                    comment_text=comment_text
                )

            # Clear relevant caches
            cache_keys = [
                f"photo_comments_{photo.id}",
                f"user_comments_{request.user.id}",
                f"comment_stats_{photo.id}",
                "recent_comments",
                f"user_comment_count_{request.user.id}"
            ]
            cache.delete_many(cache_keys)

            return Response(
                self.get_serializer(comment).data,
                status=status.HTTP_201_CREATED
            )

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            logger.error(f"Failed to create comment: {str(e)}")
            return Response(
                {"error": "Failed to create comment"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        """
        Update a comment if user is the owner.
        """
        try:
            comment = self.get_object()
            
            # Check ownership
            if comment.user != request.user:
                raise PermissionDenied("You can only edit your own comments")

            # Validate comment text
            comment_text = request.data.get('comment_text')
            if not comment_text:
                raise ValidationError("comment_text is required")
            if len(comment_text) > self.MAX_COMMENT_LENGTH:
                raise ValidationError(f"Comment text cannot exceed {self.MAX_COMMENT_LENGTH} characters")

            comment.comment_text = comment_text
            comment.save()

            # Clear relevant caches
            cache_keys = [
                f"photo_comments_{comment.photo.id}",
                f"user_comments_{request.user.id}",
                "recent_comments"
            ]
            cache.delete_many(cache_keys)

            return Response(self.get_serializer(comment).data)

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            logger.error(f"Failed to update comment: {str(e)}")
            return Response(
                {"error": "Failed to update comment"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, *args, **kwargs):
        """
        Delete a comment if user is the owner or has moderation permissions.
        """
        try:
            comment = self.get_object()
            
            # Check permissions
            if comment.user != request.user and not request.user.is_staff:
                raise PermissionDenied("You can only delete your own comments")

            photo_id = comment.photo.id
            user_id = comment.user.id
            
            comment.delete()

            # Clear relevant caches
            cache_keys = [
                f"photo_comments_{photo_id}",
                f"user_comments_{user_id}",
                f"comment_stats_{photo_id}",
                "recent_comments",
                f"user_comment_count_{user_id}"
            ]
            cache.delete_many(cache_keys)

            return Response(status=status.HTTP_204_NO_CONTENT)

        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            logger.error(f"Failed to delete comment: {str(e)}")
            return Response(
                {"error": "Failed to delete comment"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def photo_comments(self, request):
        """Get comments for a specific photo with caching."""
        try:
            photo_id = request.query_params.get('photo_id')
            if not photo_id:
                raise ValidationError("photo_id query parameter is required")

            cache_key = f"photo_comments_{photo_id}"
            cached_comments = cache.get(cache_key)

            if cached_comments:
                return Response(cached_comments)

            comments = Comment.objects.select_related('user').filter(
                photo_id=photo_id
            ).order_by('-created_at')

            serializer = self.get_serializer(comments, many=True)
            cache.set(cache_key, serializer.data, timeout=self.CACHE_TIMEOUT)
            
            return Response(serializer.data)

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to fetch photo comments: {str(e)}")
            return Response(
                {"error": "Failed to fetch photo comments"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def user_comments(self, request):
        """Get comment history for a user with caching."""
        try:
            user_id = request.query_params.get('user_id', request.user.id)
            cache_key = f"user_comments_{user_id}"
            cached_comments = cache.get(cache_key)

            if cached_comments:
                return Response(cached_comments)

            comments = Comment.objects.select_related('photo').filter(
                user_id=user_id
            ).order_by('-created_at')

            serializer = self.get_serializer(comments, many=True)
            cache.set(cache_key, serializer.data, timeout=self.CACHE_TIMEOUT)
            
            return Response(serializer.data)

        except Exception as e:
            logger.error(f"Failed to fetch user comments: {str(e)}")
            return Response(
                {"error": "Failed to fetch user comments"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get comment statistics for a photo."""
        try:
            photo_id = request.query_params.get('photo_id')
            if not photo_id:
                raise ValidationError("photo_id query parameter is required")

            cache_key = f"comment_stats_{photo_id}"
            cached_stats = cache.get(cache_key)

            if cached_stats:
                return Response(cached_stats)

            total_comments = Comment.objects.filter(photo_id=photo_id).count()
            recent_comments = Comment.objects.select_related('user').filter(
                photo_id=photo_id
            ).order_by('-created_at')[:5].values(
                'user__username',
                'comment_text',
                'created_at'
            )

            stats = {
                "total_comments": total_comments,
                "recent_comments": list(recent_comments)
            }

            cache.set(cache_key, stats, timeout=self.CACHE_TIMEOUT)
            return Response(stats)

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to get comment stats: {str(e)}")
            return Response(
                {"error": "Failed to retrieve comment statistics"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent comments across all photos."""
        try:
            cache_key = "recent_comments"
            cached_comments = cache.get(cache_key)

            if cached_comments:
                return Response(cached_comments)

            comments = Comment.objects.select_related('user', 'photo').order_by(
                '-created_at'
            )[:20].values(
                'user__username',
                'photo__title',
                'comment_text',
                'created_at'
            )

            cache.set(cache_key, list(comments), timeout=self.CACHE_TIMEOUT)
            return Response(comments)

        except Exception as e:
            logger.error(f"Failed to fetch recent comments: {str(e)}")
            return Response(
                {"error": "Failed to fetch recent comments"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def user_stats(self, request):
        """Get comment statistics for a user."""
        try:
            user_id = request.query_params.get('user_id', request.user.id)
            cache_key = f"user_comment_stats_{user_id}"
            cached_stats = cache.get(cache_key)

            if cached_stats:
                return Response(cached_stats)

            total_comments = Comment.objects.filter(user_id=user_id).count()
            today_comments = Comment.objects.filter(
                user_id=user_id,
                created_at__date=timezone.now().date()
            ).count()

            recent_comments = Comment.objects.select_related('photo').filter(
                user_id=user_id
            ).order_by('-created_at')[:5].values(
                'photo__title',
                'comment_text',
                'created_at'
            )

            stats = {
                "total_comments": total_comments,
                "today_comments": today_comments,
                "recent_comments": list(recent_comments)
            }

            cache.set(cache_key, stats, timeout=self.CACHE_TIMEOUT)
            return Response(stats)

        except Exception as e:
            logger.error(f"Failed to get user comment stats: {str(e)}")
            return Response(
                {"error": "Failed to retrieve user comment statistics"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def report(self, request, pk=None):
        """Report a comment for moderation."""
        try:
            comment = self.get_object()
            reason = request.data.get('reason')
            
            if not reason:
                raise ValidationError("reason is required")

            # Here you would typically create a CommentReport model instance
            # and notify moderators, but for now we'll just log it
            logger.info(f"Comment {comment.id} reported by {request.user.id}. Reason: {reason}")

            return Response({
                "message": "Comment reported successfully",
                "comment_id": comment.id
            })

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to report comment: {str(e)}")
            return Response(
                {"error": "Failed to report comment"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
