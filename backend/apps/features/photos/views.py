from apps.features.photos.models import models
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from cloudinary.uploader import upload
from apps.features.photos.models import Photo
from .serializers import PhotoSerializer
from apps.core.users.security import validate_image
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.pagination import PageNumberPagination
from datetime import datetime
from django.core.cache import cache
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter

class PhotoUploadView(APIView):
    """Handles user photo uploads."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        image_file = request.FILES.get("image")

        if not image_file:
            return Response({"error": "No image uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        if not validate_image(image_file):
            return Response({"error": "Invalid image format. Allowed: JPG, PNG, GIF, WEBP"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            upload_result = upload(
                image_file,
                folder=f"Users/Photos/{user.username}/",
                public_id=f"{user.username}_{timestamp}",
                overwrite=False,
                invalidate=True,
                resource_type="auto",
                transformation=[{"width": 1200, "quality": "auto"}]
            )
        except Exception as e:
            return Response({"error": "Image upload failed. Please try again."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        photo = Photo.objects.create(
            user=user,
            image=upload_result["secure_url"],
            title=request.data.get("title", ""),
            description=request.data.get("description", ""),
        )
        try:
            ai_tags = photo.generate_ai_tags() or []
            photo.ai_tags = ai_tags
            photo.save(update_fields=["ai_tags"])
        except Exception as e:
            ai_tags = []

        return Response(
            {
                "message": "Photo uploaded successfully",
                "photo": PhotoSerializer(photo).data,
            },
            status=status.HTTP_201_CREATED,
        )

class PhotoPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "size"
    max_page_size = 50

class PhotoListView(ListAPIView):
    """Fetch all photos with pagination & optimization"""
    permission_classes = [IsAuthenticated]
    queryset = (
        Photo.objects
        .select_related("user")
        .only("user__username", "image", "title", "upload_date", "likes_count", "comments_count")
        .order_by("-upload_date")
    )
    serializer_class = PhotoSerializer
    pagination_class = PhotoPagination
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["user__username","upload_date"]
    search_fields = ["title","description"]
    
class TrendingPhotoPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "size"
    max_page_size = 50

class TrendingPhotosView(ListAPIView):
    """Fetch trending photos based on most likes"""
    permission_classes = [IsAuthenticated]
    queryset = (
        Photo.objects
        .select_related("user")
        .only("user__username", "image", "title", "upload_date", "likes_count", "comments_count")
        .order_by("-likes_count", "-upload_date")
    )
    serializer_class = PhotoSerializer
    pagination_class = TrendingPhotoPagination


class RetrievePhotoView(RetrieveAPIView):
    """Retrieve a single photo by ID."""
    permission_classes = [IsAuthenticated]
    queryset = Photo.objects.select_related("user").defer("user__password","user__email").only(
        "user__username", "image", "title", "description", "upload_date", "likes_count", "comments_count"
    )
    serializer_class = PhotoSerializer
    
    def get_object(self):
        
        photo_id = self.kwargs.get("pk") 
        cached_photo = cache.get(f"photo_{photo_id}")      
        if cached_photo:
            return cached_photo
        try:
            photo = super().get_object()
        except Photo.DoesNotExist:
            return Response({"error": "Photo not found"}, status=status.HTTP_404_NOT_FOUND)
        
        cache.set(f"photo_{photo_id}", photo, timeout=3600)
        return photo