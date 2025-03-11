from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response  # Import Response here
from .models import Category
from apps.features.photos.models import Photo
from .serializers import CategorySerializer
from apps.features.photos.serializers import PhotoSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    """Handles CRUD operations for Categories and includes related photos"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        """Allow anyone to list categories, but restrict modification to admins"""
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAdminUser()]

    def retrieve(self, request, *args, **kwargs):
        """Get a single category with its related photos"""
        try:
            category = self.get_object()
            # Get photos related to this category through the photo_category relationship
            photos = Photo.objects.filter(photo_categories__category=category)  # Adjusted filter
            category_data = self.get_serializer(category).data
            category_data["photos"] = PhotoSerializer(photos, many=True).data  # Include photos
            return Response(category_data)  # Ensure you're returning a Response object
        except Exception as e:
            return Response({"detail": f"Unexpected error occurred: {str(e)}"}, status=500)

