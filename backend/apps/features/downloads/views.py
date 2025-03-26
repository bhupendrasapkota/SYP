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

from .models import Download
from .serializers import DownloadSerializer
from apps.features.photos.models import Photo

logger = logging.getLogger(__name__)

class DownloadViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling photo download operations.
    
    Supports:
    - Track photo downloads
    - List user's download history
    - Get download statistics
    - Check download status
    - Get most downloaded photos
    - Manage download limits
    - Remove downloads
    """
    serializer_class = DownloadSerializer
    permission_classes = [IsAuthenticated]
    
    # Configure download limits
    DAILY_DOWNLOAD_LIMIT = getattr(settings, 'DAILY_DOWNLOAD_LIMIT', 50)
    MONTHLY_DOWNLOAD_LIMIT = getattr(settings, 'MONTHLY_DOWNLOAD_LIMIT', 1000)

    def get_queryset(self):
        """Get downloads queryset with optimized loading."""
        return Download.objects.select_related('user', 'photo').filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def track_download(self, request):
        """
        Track a photo download.
        Requires photo_id in request data.
        Enforces download limits and permissions.
        """
        try:
            photo_id = request.data.get('photo_id')
            if not photo_id:
                raise ValidationError("photo_id is required")

            # Check download limits
            today = timezone.now().date()
            daily_downloads = Download.objects.filter(
                user=request.user,
                downloaded_at__date=today
            ).count()

            if daily_downloads >= self.DAILY_DOWNLOAD_LIMIT:
                raise PermissionDenied("Daily download limit reached")

            this_month = timezone.now().replace(day=1)
            monthly_downloads = Download.objects.filter(
                user=request.user,
                downloaded_at__gte=this_month
            ).count()

            if monthly_downloads >= self.MONTHLY_DOWNLOAD_LIMIT:
                raise PermissionDenied("Monthly download limit reached")

            photo = get_object_or_404(Photo, id=photo_id)
            
            # Check if photo is downloadable
            if not photo.is_downloadable:
                raise PermissionDenied("This photo is not available for download")

            with transaction.atomic():
                download, created = Download.objects.get_or_create(
                    user=request.user,
                    photo=photo,
                    defaults={'downloaded_at': timezone.now()}
                )
                
                if not created:
                    # Update download timestamp if already exists
                    download.downloaded_at = timezone.now()
                    download.save()

            # Clear relevant caches
            cache_keys = [
                f"user_downloads_{request.user.id}",
                f"download_stats_{request.user.id}",
                f"photo_downloads_{photo.id}",
                "most_downloaded_photos",
                f"download_limits_{request.user.id}"
            ]
            cache.delete_many(cache_keys)

            return Response({
                "message": "Download tracked successfully",
                "download": self.get_serializer(download).data
            })

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            logger.error(f"Download tracking failed: {str(e)}")
            return Response(
                {"error": "Failed to track download"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def history(self, request):
        """Get user's download history with caching."""
        try:
            user_id = request.query_params.get('user_id', request.user.id)
            cache_key = f"user_downloads_{user_id}"
            cached_downloads = cache.get(cache_key)

            if cached_downloads:
                return Response(cached_downloads)

            downloads = self.get_queryset().order_by('-downloaded_at')
            serializer = self.get_serializer(downloads, many=True)
            cache.set(cache_key, serializer.data, timeout=300)  # Cache for 5 minutes
            
            return Response(serializer.data)

        except Exception as e:
            logger.error(f"Failed to fetch download history: {str(e)}")
            return Response(
                {"error": "Failed to fetch download history"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get download statistics for a user."""
        try:
            user_id = request.query_params.get('user_id', request.user.id)
            cache_key = f"download_stats_{user_id}"
            cached_stats = cache.get(cache_key)

            if cached_stats:
                return Response(cached_stats)

            today = timezone.now().date()
            this_month = timezone.now().replace(day=1)

            stats = {
                "total_downloads": self.get_queryset().count(),
                "today_downloads": self.get_queryset().filter(
                    downloaded_at__date=today
                ).count(),
                "month_downloads": self.get_queryset().filter(
                    downloaded_at__gte=this_month
                ).count(),
                "recent_downloads": self.get_queryset()
                    .order_by('-downloaded_at')[:5]
                    .values('photo__title', 'downloaded_at'),
                "remaining_daily_limit": self.DAILY_DOWNLOAD_LIMIT - self.get_queryset().filter(
                    downloaded_at__date=today
                ).count(),
                "remaining_monthly_limit": self.MONTHLY_DOWNLOAD_LIMIT - self.get_queryset().filter(
                    downloaded_at__gte=this_month
                ).count()
            }

            cache.set(cache_key, stats, timeout=300)  # Cache for 5 minutes
            return Response(stats)

        except Exception as e:
            logger.error(f"Failed to get download stats: {str(e)}")
            return Response(
                {"error": "Failed to retrieve download statistics"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def most_downloaded(self, request):
        """Get most downloaded photos."""
        try:
            cache_key = "most_downloaded_photos"
            cached_data = cache.get(cache_key)

            if cached_data:
                return Response(cached_data)

            most_downloaded = Photo.objects.annotate(
                download_count=Count('photo_downloads')
            ).filter(
                download_count__gt=0,
                is_downloadable=True
            ).order_by('-download_count')[:10].values(
                'id',
                'title',
                'download_count',
                'user__username'
            )

            cache.set(cache_key, list(most_downloaded), timeout=3600)  # Cache for 1 hour
            return Response(most_downloaded)

        except Exception as e:
            logger.error(f"Failed to get most downloaded photos: {str(e)}")
            return Response(
                {"error": "Failed to get most downloaded photos"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def check_limits(self, request):
        """Check user's download limits and remaining quota."""
        try:
            cache_key = f"download_limits_{request.user.id}"
            cached_limits = cache.get(cache_key)

            if cached_limits:
                return Response(cached_limits)

            today = timezone.now().date()
            this_month = timezone.now().replace(day=1)

            daily_downloads = self.get_queryset().filter(
                downloaded_at__date=today
            ).count()

            monthly_downloads = self.get_queryset().filter(
                downloaded_at__gte=this_month
            ).count()

            limits = {
                "daily_limit": self.DAILY_DOWNLOAD_LIMIT,
                "monthly_limit": self.MONTHLY_DOWNLOAD_LIMIT,
                "daily_downloads": daily_downloads,
                "monthly_downloads": monthly_downloads,
                "daily_remaining": self.DAILY_DOWNLOAD_LIMIT - daily_downloads,
                "monthly_remaining": self.MONTHLY_DOWNLOAD_LIMIT - monthly_downloads,
                "can_download": (daily_downloads < self.DAILY_DOWNLOAD_LIMIT and 
                               monthly_downloads < self.MONTHLY_DOWNLOAD_LIMIT)
            }

            cache.set(cache_key, limits, timeout=300)  # Cache for 5 minutes
            return Response(limits)

        except Exception as e:
            logger.error(f"Failed to check download limits: {str(e)}")
            return Response(
                {"error": "Failed to check download limits"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['delete'])
    def remove_by_photo(self, request):
        """Remove a download by photo ID."""
        try:
            photo_id = request.query_params.get('photo_id')
            if not photo_id:
                raise ValidationError("photo_id is required")

            # Get the download for this photo and user
            download = get_object_or_404(
                Download.objects.select_related('photo'),
                photo_id=photo_id,
                user=request.user
            )
            
            # Delete the download
            download.delete()
            
            # Clear relevant caches
            cache_keys = [
                f"user_downloads_{request.user.id}",
                f"download_stats_{request.user.id}",
                f"photo_downloads_{photo_id}",
                "most_downloaded_photos"
            ]
            cache.delete_many(cache_keys)
            
            return Response(
                {"message": "Download removed successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
            
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to remove download: {str(e)}")
            return Response(
                {"error": "Failed to remove download"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create(self, request, *args, **kwargs):
        """Disable direct POST method - use track_download instead."""
        return Response(
            {"error": "Use /api/downloads/track_download/ endpoint to track downloads"},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    def update(self, request, *args, **kwargs):
        """Disable PUT/PATCH methods."""
        return Response(
            {"error": "Method not allowed"},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    def destroy(self, request, *args, **kwargs):
        """Disable DELETE method - use remove_by_photo instead."""
        return Response(
            {"error": "Use /api/downloads/remove_by_photo/ endpoint to remove downloads"},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
