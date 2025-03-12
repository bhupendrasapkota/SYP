from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly, BasePermission
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.filters import SearchFilter, OrderingFilter
from django.core.cache import cache
from django.shortcuts import get_object_or_404
from django.db.models import F, Q
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from cloudinary.uploader import upload, destroy
from datetime import datetime, timedelta
import logging
import re
from urllib.parse import urlparse

from .models import Photo
from .serializers import PhotoSerializer
from apps.core.users.security import validate_image

logger = logging.getLogger(__name__)

class IsOwnerOrAdminOrReadOnly(BasePermission):
    """
    Custom permission to only allow owners or admins to edit/delete photos.
    Anyone can view photos.
    """
    def has_permission(self, request, view):
        # Allow anyone to list and view photos
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        # Must be authenticated for other actions
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True

        # Write permissions are only allowed to the owner or admin
        return obj.user == request.user or request.user.is_staff

def get_cloudinary_public_id(cloudinary_url):
    """Extract Cloudinary public ID from the Cloudinary URL."""
    if not cloudinary_url:
        return None
    parsed_url = urlparse(cloudinary_url).path
    match = re.search(r"/upload/(?:v\d+/)?(.+)", parsed_url)
    return match.group(1) if match else None

def validate_and_upload_image(image_file, username):
    """
    Validate image type and upload to Cloudinary.
    Returns tuple of (success, result/error_message)
    """
    try:
        if not validate_image(image_file):
            return False, "Invalid image format. Allowed formats: JPG, JPEG, PNG."
        
        if image_file.size > 10 * 1024 * 1024:  # 10MB limit
            return False, "Image size should not exceed 10MB."
        
        upload_result = upload(
            image_file,
            folder=f"users/Photos/{username}",
            public_id=f"{username}_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            resource_type="image"
        )
        return True, upload_result.get("secure_url")
    except Exception as e:
        logger.error(f"Image upload failed: {str(e)}")
        return False, "Failed to upload image. Please try again."

class PhotoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling photo operations.
    
    Permissions:
    - Anyone can view photos
    - Only authenticated users can create photos
    - Only owner or admin can edit/delete photos
    
    Supports:
    - List/Create/Retrieve/Update/Delete operations
    - Photo upload with validation
    - Trending photos
    - User's photo gallery
    - Photo search and filtering
    - Like/Unlike photos
    - Download tracking
    """
    queryset = Photo.objects.select_related("user").defer("user__password", "user__email")
    serializer_class = PhotoSerializer
    permission_classes = [IsOwnerOrAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = {
        'user__username': ['exact'],
        'upload_date': ['gte', 'lte'],
        'likes_count': ['gte', 'lte'],
    }
    search_fields = ['title', 'description', 'ai_tags']
    ordering_fields = ['upload_date', 'likes_count', 'comments_count', 'downloads_count']
    ordering = ['-upload_date']

    def get_queryset(self):
        """
        Get the list of photos based on query parameters.
        Supports filtering by time period and popularity.
        """
        queryset = Photo.objects.select_related("user")
        
        # Time period filtering
        time_period = self.request.query_params.get('time_period', None)
        if time_period:
            now = timezone.now()
            if time_period == 'today':
                queryset = queryset.filter(upload_date__date=now.date())
            elif time_period == 'week':
                queryset = queryset.filter(upload_date__gte=now - timedelta(days=7))
            elif time_period == 'month':
                queryset = queryset.filter(upload_date__gte=now - timedelta(days=30))
        
        return queryset

    def list(self, request, *args, **kwargs):
        """List photos with caching for better performance."""
        cache_key = f"photos_list_{request.query_params}"
        cached_response = cache.get(cache_key)
        
        if cached_response:
            return Response(cached_response)
            
        response = super().list(request, *args, **kwargs)
        cache.set(cache_key, response.data, timeout=300)  # Cache for 5 minutes
        return response

    def retrieve(self, request, *args, **kwargs):
        """Retrieve a photo with caching and view count increment."""
        photo_id = kwargs.get("pk")
        cache_key = f"photo_{photo_id}"
        cached_photo = cache.get(cache_key)

        if cached_photo:
            return Response(cached_photo)

        response = super().retrieve(request, *args, **kwargs)
        cache.set(cache_key, response.data, timeout=3600)
        return response

    def perform_create(self, serializer):
        """Create a new photo with proper error handling."""
        try:
            if not self.request.user.is_authenticated:
                raise PermissionDenied("You must be authenticated to upload photos.")
            serializer.save(user=self.request.user)
        except Exception as e:
            logger.error(f"Failed to create photo: {str(e)}")
            raise ValidationError("Failed to create photo. Please try again.")

    def update(self, request, *args, **kwargs):
        """Update photo with ownership validation."""
        photo = self.get_object()
        if not request.user.is_authenticated:
            raise PermissionDenied("You must be authenticated to update photos.")
        if photo.user != request.user and not request.user.is_staff:
            raise PermissionDenied("You can only update your own photos.")
        
        response = super().update(request, *args, **kwargs)
        cache.delete(f"photo_{photo.id}")
        return response

    def destroy(self, request, *args, **kwargs):
        """Delete photo with Cloudinary cleanup."""
        photo = self.get_object()
        
        if not request.user.is_authenticated:
            raise PermissionDenied("You must be authenticated to delete photos.")
        if photo.user != request.user and not request.user.is_staff:
            raise PermissionDenied("You can only delete your own photos.")
        
        try:
            # Delete from Cloudinary
            cloudinary_url = getattr(photo.image, 'url', None)
            if cloudinary_url:
                public_id = get_cloudinary_public_id(cloudinary_url)
                if public_id:
                    destroy(public_id, invalidate=True)
            
            # Clear caches
            cache.delete(f"photo_{photo.id}")
            cache.delete("trending_photos")
            cache.delete(f"user_photos_{photo.user.id}")
            
            photo.delete()
            return Response(
                {"message": "Photo deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            logger.error(f"Failed to delete photo: {str(e)}")
            raise ValidationError("Failed to delete photo. Please try again.")

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticatedOrReadOnly])
    def upload(self, request):
        """
        Handle multiple photo uploads with proper validation and error handling.
        """
        try:
            user = request.user
            image_files = request.FILES.getlist("image")
            
            if not image_files:
                return Response(
                    {"error": "No images uploaded."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if len(image_files) > 10:  # Limit number of simultaneous uploads
                return Response(
                    {"error": "Maximum 10 images allowed per upload."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            uploaded_photos = []
            errors = []
            
            for image_file in image_files:
                success, result = validate_and_upload_image(image_file, user.username)
                if success:
                    try:
                        photo = Photo.objects.create(
                            user=user,
                            image=result,
                            title=request.data.get("title", ""),
                            description=request.data.get("description", ""),
                        )
                        uploaded_photos.append(PhotoSerializer(photo).data)
                    except Exception as e:
                        errors.append(f"Failed to save photo: {str(e)}")
                else:
                    errors.append(result)
            
            response_data = {
                "message": "Upload completed",
                "uploaded": uploaded_photos,
            }
            if errors:
                response_data["errors"] = errors
            
            status_code = status.HTTP_201_CREATED if uploaded_photos else status.HTTP_400_BAD_REQUEST
            return Response(response_data, status=status_code)
            
        except Exception as e:
            logger.error(f"Upload failed: {str(e)}")
            return Response(
                {"error": "Upload failed. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=["get"])
    def trending(self, request):
        """
        Fetch trending photos with customizable time period and category.
        Supports different trending algorithms based on likes, comments, and views.
        """
        try:
            cache_key = f"trending_photos_{request.query_params}"
            trending_photos = cache.get(cache_key)

            if not trending_photos:
                time_period = request.query_params.get('time_period', 'week')
                algorithm = request.query_params.get('algorithm', 'likes')
                
                # Calculate date range
                now = timezone.now()
                if time_period == 'day':
                    start_date = now - timedelta(days=1)
                elif time_period == 'week':
                    start_date = now - timedelta(weeks=1)
                elif time_period == 'month':
                    start_date = now - timedelta(days=30)
                else:
                    start_date = now - timedelta(weeks=1)  # Default to week

                # Base queryset
                queryset = Photo.objects.select_related("user").filter(
                    upload_date__gte=start_date
                )

                # Apply trending algorithm
                if algorithm == 'likes':
                    queryset = queryset.order_by('-likes_count', '-upload_date')
                elif algorithm == 'comments':
                    queryset = queryset.order_by('-comments_count', '-likes_count')
                elif algorithm == 'downloads':
                    queryset = queryset.order_by('-downloads_count', '-likes_count')
                else:  # Combined score
                    queryset = queryset.order_by(
                        F('likes_count') + F('comments_count') * 2 + F('downloads_count') * 3,
                        '-upload_date'
                    )

                trending_photos = PhotoSerializer(queryset[:20], many=True).data
                cache.set(cache_key, trending_photos, timeout=1800)  # Cache for 30 minutes

            return Response(trending_photos)
            
        except Exception as e:
            logger.error(f"Failed to fetch trending photos: {str(e)}")
            return Response(
                {"error": "Failed to fetch trending photos."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def user_gallery(self, request):
        """Get photos for a specific user with pagination."""
        username = request.query_params.get('username')
        if not username:
            return Response(
                {"error": "Username parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = self.get_queryset().filter(user__username=username)
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """Toggle like status for a photo."""
        photo = self.get_object()
        
        # This is a placeholder - implement actual like functionality
        # based on your likes app implementation
        photo.likes_count = F('likes_count') + 1
        photo.save()
        
        cache.delete(f"photo_{photo.id}")
        cache.delete("trending_photos")
        
        return Response({"message": "Photo liked successfully"})

    @action(detail=True, methods=['post'])
    def download(self, request, pk=None):
        """Track photo download."""
        photo = self.get_object()
        photo.downloads_count = F('downloads_count') + 1
        photo.save()
        
        return Response({
            "message": "Download tracked successfully",
            "download_url": photo.image.url
        })