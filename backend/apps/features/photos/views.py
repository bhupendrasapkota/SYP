from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.cache import cache
from django.shortcuts import get_object_or_404
from cloudinary.uploader import upload, destroy
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from rest_framework.pagination import PageNumberPagination
from urllib.parse import urlparse
import re
from datetime import datetime
from .models import Photo
from .serializers import PhotoSerializer
from apps.core.users.security import validate_image

class PhotoPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "size"
    max_page_size = 50

def get_cloudinary_public_id(cloudinary_url):
    """Extract Cloudinary public ID from the Cloudinary URL."""
    parsed_url = urlparse(cloudinary_url).path
    match = re.search(r"/upload/(?:v\d+/)?(.+)", parsed_url)
    return match.group(1) if match else None

def validate_and_upload_image(image_file, username):
    """Validate image type and upload to Cloudinary."""
    if not validate_image(image_file):
        return None
    
    upload_result = upload(
        image_file,
        folder=f"users/Photos/{username}",
        public_id=f"{username}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    )  
    return upload_result.get("secure_url") if upload_result else None

class PhotoViewSet(viewsets.ModelViewSet):
    """Handles CRUD operations and custom actions for photos"""
    queryset = Photo.objects.select_related("user").defer("user__password", "user__email").only(
        "user__username", "image", "title", "description", "upload_date", "likes_count", "comments_count"
    )
    serializer_class = PhotoSerializer
    pagination_class = PhotoPagination
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["user__username", "upload_date"]
    search_fields = ["title", "description"]

    def get_permissions(self):
        """Allow anyone to view photos, but restrict modification to authenticated users"""
        if self.action in ["list", "retrieve", "trending"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        """Ensure the photo is linked to the user"""
        serializer.save(user=self.request.user)

    def get_queryset(self):
        """Allow admins to see all photos, users only their own"""
        if self.request.user.is_staff:
            return Photo.objects.all()
        if self.request.user.is_authenticated:
            return Photo.objects.filter(user=self.request.user)
        return Photo.objects.none()

    def retrieve(self, request, *args, **kwargs):
        """Retrieve a photo with caching"""
        photo_id = kwargs.get("pk")
        cache_key = f"photo_{photo_id}"
        cached_photo = cache.get(cache_key)

        if cached_photo:
            return Response(cached_photo)

        response = super().retrieve(request, *args, **kwargs)
        cache.set(cache_key, response.data, timeout=3600)
        return response

    @action(detail=False, methods=["post"])
    def upload(self, request):
        """Handle photo uploads"""
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

                try:
                    ai_tags = photo.generate_ai_tags() or []
                    photo.ai_tags = ai_tags
                    photo.save(update_fields=["ai_tags"])
                except Exception:
                    pass

        return Response(
            {
                "message": "Photos uploaded successfully",
                "photos": uploaded_photos,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["get"])
    def trending(self, request):
        """Fetch trending photos based on most likes"""
        cache_key = "trending_photos"
        trending_photos = cache.get(cache_key)

        if not trending_photos:
            trending_photos = Photo.objects.select_related("user").only(
                "user__username", "image", "title", "upload_date", "likes_count", "comments_count"
            ).order_by("-likes_count", "-upload_date")[:10]
            
            trending_photos = PhotoSerializer(trending_photos, many=True).data  # Serialize before caching
            cache.set(cache_key, trending_photos, timeout=3600)

        return Response(trending_photos)

    @action(detail=True, methods=["delete"])
    def remove(self, request, pk=None):
        """Allow users to delete their own photos, also remove from Cloudinary"""
        photo = get_object_or_404(Photo, id=pk, user=request.user)
        
        cloudinary_url = getattr(photo.image, 'url', None)
        if cloudinary_url:
            public_id = get_cloudinary_public_id(cloudinary_url)
            if public_id:
                try:
                    destroy(public_id, invalidate=True)
                except Exception:
                    pass
        
        photo.delete()
        cache.delete(f"photo_{pk}")
        cache.delete("trending_photos")

        return Response({"message": "Photo deleted successfully"}, status=status.HTTP_204_NO_CONTENT)