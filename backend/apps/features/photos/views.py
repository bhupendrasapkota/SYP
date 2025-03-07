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

def validate_and_upload_image(image_file, username):
    """Validate image type and upload to Cloudinary."""
    if not validate_image(image_file):
        print("Invalid image format.")
        return None
    
    upload_result = upload(image_file, folder=f"users/Photos/{username}")
    return upload_result.get("secure_url")


class PhotoUploadView(APIView):
    """Handles user photo uploads."""
    permission_classes = [IsAuthenticated]   
    def post(self, request):
        user = request.user
        image_files = request.FILES.getlist("image")
        
        if not image_files:
            return Response({"error": "Image is not uploaded."}, status=status.HTTP_400_BAD_REQUEST)
        
        uploaded_photos = []
        for image_file in image_files:
            if not validate_image(image_file):
                continue
            
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
        except Exception as e:
            ai_tags = []

        return Response(
            {
                "message": "Photo uploaded successfully",
                "photo": uploaded_photos,
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
    serializer_class = PhotoSerializer
    pagination_class = TrendingPhotoPagination
    
    def get_queryset(self):
        cache_key = "trending_photos"
        trending_photos = cache.get(cache_key)
        
        if not trending_photos:
            trending_photos = (
                Photo.objects
                .select_related("user")
                .only("user__username", "image", "title", "upload_date", "likes_count", "comments_count")
                .order_by("-likes_count","-upload_date")[:10]
            )
            cache.set(cache_key, trending_photos, timeout=3600)
        
        return trending_photos


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