from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.core.cache import cache
from django.db import transaction
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.conf import settings
import logging

from .models import Category, photo_category
from .serializers import CategorySerializer, PhotoCategorySerializer
from apps.features.photos.models import Photo

logger = logging.getLogger(__name__)

class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling category operations.
    
    Supports:
    - Create, read, update, delete categories (admin only)
    - List and search categories
    - Add/remove photos to/from categories
    - Get category statistics
    - Get popular categories
    - Get photos by category
    """
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'photo_categories__count']
    ordering = ['name']
    
    # Configure category settings
    CACHE_TIMEOUT = 3600  # 1 hour for categories since they change less frequently
    MAX_PHOTOS_PER_BATCH = 100  # Maximum number of photos to add/remove in one request

    def get_permissions(self):
        """
        Admin-only permissions for create, update, delete.
        Read operations are public.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return []

    def get_queryset(self):
        """Get categories queryset with optimized loading."""
        return Category.objects.annotate(
            photos_count=Count('photo_categories')
        )

    def list(self, request, *args, **kwargs):
        """
        List all categories with caching.
        """
        try:
            cache_key = "all_categories"
            cached_categories = cache.get(cache_key)

            if cached_categories:
                return Response(cached_categories)

            queryset = self.filter_queryset(self.get_queryset())
            serializer = self.get_serializer(queryset, many=True)
            
            cache.set(cache_key, serializer.data, timeout=self.CACHE_TIMEOUT)
            return Response(serializer.data)

        except Exception as e:
            logger.error(f"Failed to fetch categories: {str(e)}")
            return Response(
                {"error": "Failed to fetch categories"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create(self, request, *args, **kwargs):
        """
        Create a new category (admin only).
        """
        try:
            name = request.data.get('name')
            if not name:
                raise ValidationError("name is required")

            # Check if category already exists
            if Category.objects.filter(name__iexact=name).exists():
                raise ValidationError("A category with this name already exists")

            response = super().create(request, *args, **kwargs)
            
            # Clear relevant caches
            cache_keys = [
                "all_categories",
                "popular_categories"
            ]
            cache.delete_many(cache_keys)

            return response

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to create category: {str(e)}")
            return Response(
                {"error": "Failed to create category"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        """
        Update a category (admin only).
        """
        try:
            category = self.get_object()
            
            # Check if new name already exists
            new_name = request.data.get('name')
            if new_name and Category.objects.filter(name__iexact=new_name).exclude(id=category.id).exists():
                raise ValidationError("A category with this name already exists")

            response = super().update(request, *args, **kwargs)

            # Clear relevant caches
            cache_keys = [
                "all_categories",
                "popular_categories",
                f"category_{category.id}",
                f"category_photos_{category.id}"
            ]
            cache.delete_many(cache_keys)

            return response

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to update category: {str(e)}")
            return Response(
                {"error": "Failed to update category"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, *args, **kwargs):
        """
        Delete a category (admin only).
        """
        try:
            category = self.get_object()
            category_id = category.id
            
            category.delete()

            # Clear relevant caches
            cache_keys = [
                "all_categories",
                "popular_categories",
                f"category_{category_id}",
                f"category_photos_{category_id}"
            ]
            cache.delete_many(cache_keys)

            return Response(status=status.HTTP_204_NO_CONTENT)

        except Exception as e:
            logger.error(f"Failed to delete category: {str(e)}")
            return Response(
                {"error": "Failed to delete category"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_photos(self, request, pk=None):
        """Add photos to a category."""
        try:
            category = self.get_object()
            photo_ids = request.data.get('photo_ids', [])

            if not photo_ids:
                raise ValidationError("photo_ids list is required")
            
            if len(photo_ids) > self.MAX_PHOTOS_PER_BATCH:
                raise ValidationError(f"Cannot add more than {self.MAX_PHOTOS_PER_BATCH} photos at once")

            # Add photos
            added_photos = []
            with transaction.atomic():
                for photo_id in photo_ids:
                    photo = get_object_or_404(Photo, id=photo_id)
                    
                    # Check if user owns the photo
                    if photo.user != request.user and not request.user.is_staff:
                        continue

                    photo_cat, created = photo_category.objects.get_or_create(
                        photo=photo,
                        category=category
                    )
                    if created:
                        added_photos.append(photo_id)

            # Clear relevant caches
            cache_keys = [
                f"category_photos_{category.id}",
                f"category_{category.id}",
                "popular_categories"
            ]
            cache.delete_many(cache_keys)

            return Response({
                "message": "Photos added successfully",
                "added_photos": added_photos
            })

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to add photos to category: {str(e)}")
            return Response(
                {"error": "Failed to add photos to category"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def remove_photos(self, request, pk=None):
        """Remove photos from a category."""
        try:
            category = self.get_object()
            photo_ids = request.data.get('photo_ids', [])

            if not photo_ids:
                raise ValidationError("photo_ids list is required")

            if len(photo_ids) > self.MAX_PHOTOS_PER_BATCH:
                raise ValidationError(f"Cannot remove more than {self.MAX_PHOTOS_PER_BATCH} photos at once")

            # Remove photos
            with transaction.atomic():
                # Only remove photos owned by the user unless staff
                if request.user.is_staff:
                    removed = photo_category.objects.filter(
                        category=category,
                        photo_id__in=photo_ids
                    ).delete()[0]
                else:
                    removed = photo_category.objects.filter(
                        category=category,
                        photo_id__in=photo_ids,
                        photo__user=request.user
                    ).delete()[0]

            # Clear relevant caches
            cache_keys = [
                f"category_photos_{category.id}",
                f"category_{category.id}",
                "popular_categories"
            ]
            cache.delete_many(cache_keys)

            return Response({
                "message": "Photos removed successfully",
                "removed_count": removed
            })

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to remove photos from category: {str(e)}")
            return Response(
                {"error": "Failed to remove photos from category"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def photos(self, request, pk=None):
        """Get photos in a category with pagination."""
        try:
            category = self.get_object()
            page = self.paginate_queryset(
                Photo.objects.filter(
                    photo_categories__category=category
                ).select_related('user').order_by('-created_at')
            )
            
            from apps.features.photos.serializers import PhotoSerializer
            serializer = PhotoSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        except Exception as e:
            logger.error(f"Failed to fetch category photos: {str(e)}")
            return Response(
                {"error": "Failed to fetch category photos"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get popular categories based on photo count."""
        try:
            cache_key = "popular_categories"
            cached_categories = cache.get(cache_key)

            if cached_categories:
                return Response(cached_categories)

            categories = Category.objects.annotate(
                photos_count=Count('photo_categories')
            ).filter(
                photos_count__gt=0
            ).order_by('-photos_count')[:10]

            serializer = self.get_serializer(categories, many=True)
            cache.set(cache_key, serializer.data, timeout=self.CACHE_TIMEOUT)
            
            return Response(serializer.data)

        except Exception as e:
            logger.error(f"Failed to fetch popular categories: {str(e)}")
            return Response(
                {"error": "Failed to fetch popular categories"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get statistics for a category."""
        try:
            category = self.get_object()
            cache_key = f"category_stats_{category.id}"
            cached_stats = cache.get(cache_key)

            if cached_stats:
                return Response(cached_stats)

            total_photos = photo_category.objects.filter(category=category).count()
            recent_photos = Photo.objects.filter(
                photo_categories__category=category
            ).order_by('-created_at')[:5].values(
                'id',
                'title',
                'user__username',
                'created_at'
            )

            stats = {
                "total_photos": total_photos,
                "recent_photos": list(recent_photos)
            }

            cache.set(cache_key, stats, timeout=self.CACHE_TIMEOUT)
            return Response(stats)

        except Exception as e:
            logger.error(f"Failed to get category stats: {str(e)}")
            return Response(
                {"error": "Failed to retrieve category statistics"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PhotoCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling photo-category relationships.
    Mainly used for bulk operations and direct access to relationships.
    """
    serializer_class = PhotoCategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter queryset based on user permissions."""
        if self.request.user.is_staff:
            return photo_category.objects.all()
        return photo_category.objects.filter(photo__user=self.request.user)

