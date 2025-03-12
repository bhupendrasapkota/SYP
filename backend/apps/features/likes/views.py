from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django.core.cache import cache
from django.db import transaction
from django.db.models import F
from django.shortcuts import get_object_or_404
import logging
from django.utils import timezone

from .models import Like
from .serializers import LikeSerializer
from apps.features.photos.models import Photo

logger = logging.getLogger(__name__)

class LikeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling like operations.
    
    Supports:
    - List user's likes
    - Toggle like status
    - Get like statistics
    - Check if user liked a photo
    """
    serializer_class = LikeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get likes queryset with optimized loading."""
        return Like.objects.select_related('user', 'photo').filter(user=self.request.user)

    def list(self, request):
        """List all likes for the current user with caching."""
        cache_key = f"user_likes_{request.user.id}"
        cached_likes = cache.get(cache_key)

        if cached_likes:
            return Response(cached_likes)

        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        cache.set(cache_key, serializer.data, timeout=300)  # Cache for 5 minutes
        
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        """
        Toggle like status for a photo.
        Requires photo_id in request data.
        """
        try:
            photo_id = request.data.get('photo_id')
            if not photo_id:
                raise ValidationError("photo_id is required")

            photo = get_object_or_404(Photo, id=photo_id)
            
            with transaction.atomic():
                like, created = Like.objects.get_or_create(
                    user=request.user,
                    photo=photo,
                    defaults={'liked_at': timezone.now()}
                )
                
                if not created:
                    # User already liked the photo, so unlike it
                    like.delete()
                    Photo.objects.filter(id=photo.id).update(likes_count=F('likes_count') - 1)
                    action = "unliked"
                else:
                    # New like
                    Photo.objects.filter(id=photo.id).update(likes_count=F('likes_count') + 1)
                    action = "liked"

            # Clear relevant caches
            cache.delete(f"user_likes_{request.user.id}")
            cache.delete(f"photo_{photo.id}")
            cache.delete("trending_photos")
            cache.delete(f"user_liked_photo_{request.user.id}_{photo.id}")

            return Response({
                "message": f"Successfully {action} the photo",
                "liked": created,
                "likes_count": Photo.objects.get(id=photo.id).likes_count
            })

        except Exception as e:
            logger.error(f"Like toggle failed: {str(e)}")
            return Response(
                {"error": "Failed to process like action"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def check_like(self, request):
        """
        Check if user has liked a specific photo.
        Requires photo_id query parameter.
        """
        try:
            photo_id = request.query_params.get('photo_id')
            if not photo_id:
                raise ValidationError("photo_id query parameter is required")

            cache_key = f"user_liked_photo_{request.user.id}_{photo_id}"
            cached_result = cache.get(cache_key)

            if cached_result is not None:
                return Response({"liked": cached_result})

            liked = Like.objects.filter(
                user=request.user,
                photo_id=photo_id
            ).exists()

            cache.set(cache_key, liked, timeout=3600)  # Cache for 1 hour
            return Response({"liked": liked})

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Check like failed: {str(e)}")
            return Response(
                {"error": "Failed to check like status"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get like statistics for the current user."""
        try:
            cache_key = f"user_like_stats_{request.user.id}"
            cached_stats = cache.get(cache_key)

            if cached_stats:
                return Response(cached_stats)

            stats = {
                "total_likes_given": Like.objects.filter(user=request.user).count(),
                "total_likes_received": Like.objects.filter(
                    photo__user=request.user
                ).count(),
                "most_liked_photos": Photo.objects.filter(
                    user=request.user
                ).order_by('-likes_count')[:5].values('id', 'title', 'likes_count')
            }

            cache.set(cache_key, stats, timeout=3600)  # Cache for 1 hour
            return Response(stats)

        except Exception as e:
            logger.error(f"Failed to get like stats: {str(e)}")
            return Response(
                {"error": "Failed to retrieve like statistics"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create(self, request, *args, **kwargs):
        """Disable direct POST method - use toggle instead."""
        return Response(
            {"error": "Use /api/likes/toggle/ endpoint to like/unlike photos"},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    def update(self, request, *args, **kwargs):
        """Disable PUT/PATCH methods."""
        return Response(
            {"error": "Method not allowed"},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    def destroy(self, request, *args, **kwargs):
        """Disable DELETE method - use toggle instead."""
        return Response(
            {"error": "Use /api/likes/toggle/ endpoint to like/unlike photos"},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
