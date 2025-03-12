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
import logging

from .models import Follower
from .serializers import FollowerSerializer
from apps.core.users.models import User

logger = logging.getLogger(__name__)

class FollowerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling follower operations.
    
    Supports:
    - Follow/Unfollow users
    - List followers/following
    - Get follower statistics
    - Check follow status
    - Suggest users to follow
    """
    serializer_class = FollowerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get followers queryset with optimized loading."""
        return Follower.objects.select_related('follower', 'following')

    @action(detail=False, methods=['post'])
    def toggle_follow(self, request):
        """
        Toggle follow status for a user.
        Requires user_id in request data.
        """
        try:
            user_to_follow_id = request.data.get('user_id')
            if not user_to_follow_id:
                raise ValidationError("user_id is required")

            # Prevent self-following
            if str(user_to_follow_id) == str(request.user.id):
                raise ValidationError("You cannot follow yourself")

            user_to_follow = get_object_or_404(User, id=user_to_follow_id)
            
            with transaction.atomic():
                follow_relation, created = Follower.objects.get_or_create(
                    follower=request.user,
                    following=user_to_follow
                )
                
                if not created:
                    # User already follows, so unfollow
                    follow_relation.delete()
                    action = "unfollowed"
                else:
                    action = "followed"

            # Clear relevant caches
            cache_keys = [
                f"user_followers_{user_to_follow.id}",
                f"user_following_{request.user.id}",
                f"follower_stats_{request.user.id}",
                f"follower_stats_{user_to_follow.id}",
                f"follow_status_{request.user.id}_{user_to_follow.id}",
                "suggested_users"
            ]
            cache.delete_many(cache_keys)

            return Response({
                "message": f"Successfully {action} the user",
                "following": created
            })

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Follow toggle failed: {str(e)}")
            return Response(
                {"error": "Failed to process follow action"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def followers(self, request):
        """Get list of user's followers with caching."""
        try:
            user_id = request.query_params.get('user_id', request.user.id)
            cache_key = f"user_followers_{user_id}"
            cached_followers = cache.get(cache_key)

            if cached_followers:
                return Response(cached_followers)

            followers = Follower.objects.select_related('follower').filter(
                following_id=user_id
            ).order_by('-followed_at')

            serializer = self.get_serializer(followers, many=True)
            cache.set(cache_key, serializer.data, timeout=300)  # Cache for 5 minutes
            
            return Response(serializer.data)

        except Exception as e:
            logger.error(f"Failed to fetch followers: {str(e)}")
            return Response(
                {"error": "Failed to fetch followers"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def following(self, request):
        """Get list of users the current user is following."""
        try:
            user_id = request.query_params.get('user_id', request.user.id)
            cache_key = f"user_following_{user_id}"
            cached_following = cache.get(cache_key)

            if cached_following:
                return Response(cached_following)

            following = Follower.objects.select_related('following').filter(
                follower_id=user_id
            ).order_by('-followed_at')

            serializer = self.get_serializer(following, many=True)
            cache.set(cache_key, serializer.data, timeout=300)
            
            return Response(serializer.data)

        except Exception as e:
            logger.error(f"Failed to fetch following: {str(e)}")
            return Response(
                {"error": "Failed to fetch following users"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get follower statistics for a user."""
        try:
            user_id = request.query_params.get('user_id', request.user.id)
            cache_key = f"follower_stats_{user_id}"
            cached_stats = cache.get(cache_key)

            if cached_stats:
                return Response(cached_stats)

            stats = {
                "followers_count": Follower.objects.filter(following_id=user_id).count(),
                "following_count": Follower.objects.filter(follower_id=user_id).count(),
                "recent_followers": Follower.objects.select_related('follower')
                    .filter(following_id=user_id)
                    .order_by('-followed_at')[:5]
                    .values('follower__username', 'followed_at')
            }

            cache.set(cache_key, stats, timeout=3600)  # Cache for 1 hour
            return Response(stats)

        except Exception as e:
            logger.error(f"Failed to get follower stats: {str(e)}")
            return Response(
                {"error": "Failed to retrieve follower statistics"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def check_follow(self, request):
        """Check if the current user follows a specific user."""
        try:
            user_id = request.query_params.get('user_id')
            if not user_id:
                raise ValidationError("user_id query parameter is required")

            cache_key = f"follow_status_{request.user.id}_{user_id}"
            cached_status = cache.get(cache_key)

            if cached_status is not None:
                return Response({"following": cached_status})

            is_following = Follower.objects.filter(
                follower=request.user,
                following_id=user_id
            ).exists()

            cache.set(cache_key, is_following, timeout=3600)  # Cache for 1 hour
            return Response({"following": is_following})

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to check follow status: {str(e)}")
            return Response(
                {"error": "Failed to check follow status"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def suggest_users(self, request):
        """Suggest users to follow based on various criteria."""
        try:
            cache_key = f"suggested_users_{request.user.id}"
            cached_suggestions = cache.get(cache_key)

            if cached_suggestions:
                return Response(cached_suggestions)

            # Get users the current user is following
            following_ids = Follower.objects.filter(
                follower=request.user
            ).values_list('following_id', flat=True)

            # Find users that are followed by users the current user follows
            suggested_users = User.objects.filter(
                followers__follower_id__in=following_ids
            ).exclude(
                id__in=following_ids
            ).exclude(
                id=request.user.id
            ).annotate(
                follower_count=Count('followers')
            ).order_by('-follower_count')[:10]

            suggestions = [{
                'id': user.id,
                'username': user.username,
                'follower_count': user.follower_count
            } for user in suggested_users]

            cache.set(cache_key, suggestions, timeout=3600)  # Cache for 1 hour
            return Response(suggestions)

        except Exception as e:
            logger.error(f"Failed to get user suggestions: {str(e)}")
            return Response(
                {"error": "Failed to get user suggestions"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create(self, request, *args, **kwargs):
        """Disable direct POST method - use toggle_follow instead."""
        return Response(
            {"error": "Use /api/followers/toggle_follow/ endpoint to follow/unfollow users"},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    def update(self, request, *args, **kwargs):
        """Disable PUT/PATCH methods."""
        return Response(
            {"error": "Method not allowed"},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    def destroy(self, request, *args, **kwargs):
        """Disable DELETE method - use toggle_follow instead."""
        return Response(
            {"error": "Use /api/followers/toggle_follow/ endpoint to follow/unfollow users"},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
