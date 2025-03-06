from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from cloudinary.uploader import upload
from .models import Photo
from .serializers import PhotoSerializer
from apps.core.users.security import validate_image
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination

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

        upload_result = upload(
            image_file,
            folder=f"Users/Photos/{user.username}/",
            public_id=f"{user.username}",
            overwrite=True,
            invalidate=True,
            resource_type="image",
            transformation=[{"width": 1200, "quality": "auto"}]
        )

        photo = Photo.objects.create(
            user=user,
            image=upload_result["secure_url"],
            title=request.data.get("title", ""),
            description=request.data.get("description", ""),
        )

        return Response({"message": "Photo uploaded successfully", "photo": PhotoSerializer(photo).data}, status=status.HTTP_201_CREATED)
    
class PhotoPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "size"
    max_page_size = 50

class PhotoListView(ListAPIView):
    """Fetch all photos with pagination & optimization"""
    permission_classes = [IsAuthenticated]
    queryset = Photo.objects.select_related("user").defer("user__password").order_by("-upload_date")
    serializer_class = PhotoSerializer
    pagination_class = PhotoPagination
