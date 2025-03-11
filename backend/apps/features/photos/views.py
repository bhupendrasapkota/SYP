from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.cache import cache
from django.shortcuts import get_object_or_404
from cloudinary.uploader import upload, destroy
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from rest_framework.exceptions import PermissionDenied, ValidationError
from .models import Photo
from .serializers import PhotoSerializer
from apps.core.users.security import validate_image
from urllib.parse import urlparse
import re
from datetime import datetime

def get_cloudinary_public_id(cloudinary_url):
    """Extract Cloudinary public ID from the Cloudinary URL."""
    parsed_url = urlparse(cloudinary_url).path
    match = re.search(r"/upload/(?:v\d+/)?(.+)", parsed_url)
    return match.group(1) if match else None

def validate_and_upload_image(image_file, username):
    """Validate image type and upload to Cloudinary."""
    if not validate_image(image_file):
        raise ValidationError("Invalid image format. Allowed formats: JPG, JPEG, PNG.")
    
    upload_result = upload(
        image_file,
        folder=f"users/Photos/{username}",
        public_id=f"{username}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    )  
    return upload_result.get("secure_url") if upload_result else None

class PhotoViewSet(viewsets.ModelViewSet):
    """Handles CRUD operations and custom actions for photos."""
    queryset = Photo.objects.select_related("user").defer("user__password", "user__email")
    serializer_class = PhotoSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["user__username", "upload_date"]
    search_fields = ["title", "description"]
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """Allow everyone to see photos, but only owners can modify theirs."""
        return Photo.objects.select_related("user")

    def perform_create(self, serializer):
        """Ensure the photo is linked to the user."""
        serializer.save(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        """Retrieve a photo with caching."""
        photo_id = kwargs.get("pk")
        cache_key = f"photo_{photo_id}"
        cached_photo = cache.get(cache_key)

        if cached_photo:
            return Response(cached_photo)

        response = super().retrieve(request, *args, **kwargs)
        cache.set(cache_key, response.data, timeout=3600)
        return response

    def update(self, request, *args, **kwargs):
        """Allow only the owner to update their photo."""
        photo = self.get_object()
        if photo.user != request.user:
            raise PermissionDenied("You can only update your own photos.")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Allow only the owner to delete their photo."""
        photo = self.get_object()
        if photo.user != request.user:
            raise PermissionDenied("You can only delete your own photos.")
        
        # Delete from Cloudinary
        cloudinary_url = getattr(photo.image, 'url', None)
        if cloudinary_url:
            public_id = get_cloudinary_public_id(cloudinary_url)
            if public_id:
                destroy(public_id, invalidate=True)
        
        cache.delete(f"photo_{photo.id}")
        photo.delete()
        return Response({"message": "Photo deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticatedOrReadOnly])
    def upload(self, request):
        """Handle photo uploads."""
        try:
            user = request.user
            image_files = request.FILES.getlist("image")
            
            if not image_files:
                return Response({"error": "No images uploaded."}, status=status.HTTP_400_BAD_REQUEST)
            
            uploaded_photos = []
            for image_file in image_files:
                image_url = validate_and_upload_image(image_file, user.username)
                if image_url:
                    photo = Photo.objects.create(
                        user=user,
                        image=image_url,
                        title=request.data.get("title", ""),
                        description=request.data.get("description", ""),
                    )
                    uploaded_photos.append(PhotoSerializer(photo).data)
            
            return Response(
                {"message": "Photos uploaded successfully", "photos": uploaded_photos},
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticatedOrReadOnly])
    def trending(self, request):
        """Fetch trending photos based on most likes."""
        try:
            cache_key = "trending_photos"
            trending_photos = cache.get(cache_key)

            if not trending_photos:
                trending_photos = Photo.objects.select_related("user").only(
                    "user__username", "image", "title", "upload_date", "likes_count", "comments_count"
                ).order_by("-likes_count", "-upload_date")[:10]

                trending_photos = PhotoSerializer(trending_photos, many=True).data
                cache.set(cache_key, trending_photos, timeout=3600)

            return Response(trending_photos)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)