from rest_framework import generics
from rest_framework.permissions import IsAdminUser, AllowAny
from .models import Category, photo_category
from apps.features.categories.serializers import CategorySerializer, photo_categorySerializer

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]  # Anyone can view categories

class CategoryCreateView(generics.CreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]  # Only admin can add categories

class CategoryUpdateView(generics.UpdateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]  # Only admin can update categories

class CategoryDeleteView(generics.DestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]  # Only admin can delete categories
    
class photo_categoryListView(generics.ListAPIView):
    queryset = photo_category.objects.all()
    serializer_class = photo_categorySerializer
    permission_classes = [IsAdminUser]
