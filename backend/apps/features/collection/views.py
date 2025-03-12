from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.core.cache import cache
from django.db import transaction
from django.db.models import Count, Q, F
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.conf import settings
import logging
from datetime import timedelta

from .models import Collection, PhotoCollection, CollectionLike, CollectionFollower
from .serializers import CollectionSerializer, PhotoCollectionSerializer
from apps.features.photos.models import Photo
from apps.core.users.models import User

logger = logging.getLogger(__name__)

class CollectionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling collection operations.
    
    Supports:
    - Create, read, update, delete collections
    - Add/remove photos to/from collections
    - Like/unlike collections
    - Follow/unfollow collections
    - Collection statistics
    - Featured and trending collections
    - Collection search and filtering
    """
    serializer_class = CollectionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'likes_count', 'followers_count']
    ordering = ['-created_at']
    
    # Configure collection settings
    MAX_PHOTOS_PER_COLLECTION = getattr(settings, 'MAX_PHOTOS_PER_COLLECTION', 1000)
    CACHE_TIMEOUT = 300  # 5 minutes
    TRENDING_CACHE_TIMEOUT = 3600  # 1 hour

    def get_queryset(self):
        """Get collections queryset with optimized loading."""
        base_qs = Collection.objects.select_related('user')
        
        if self.action in ['list', 'retrieve']:
            # For public views, only show public collections
            if not self.request.user.is_staff:
                base_qs = base_qs.filter(
                    Q(is_public=True) | Q(user=self.request.user)
                )
        
        return base_qs

    def perform_create(self, serializer):
        """Create a new collection."""
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """
        Create a new collection with validation.
        """
        try:
            name = request.data.get('name')
            if not name:
                raise ValidationError("name is required")

            # Check if user already has a collection with this name
            if Collection.objects.filter(user=request.user, name=name).exists():
                raise ValidationError("You already have a collection with this name")

            response = super().create(request, *args, **kwargs)
            
            # Clear relevant caches
            cache_keys = [
                f"user_collections_{request.user.id}",
                "featured_collections",
                "trending_collections"
            ]
            cache.delete_many(cache_keys)

            return response

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to create collection: {str(e)}")
            return Response(
                {"error": "Failed to create collection"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        """
        Update a collection if user is the owner.
        """
        try:
            collection = self.get_object()
            
            # Check ownership
            if collection.user != request.user and not request.user.is_staff:
                raise PermissionDenied("You can only edit your own collections")

            response = super().update(request, *args, **kwargs)

            # Clear relevant caches
            cache_keys = [
                f"collection_{collection.id}",
                f"user_collections_{request.user.id}",
                "featured_collections",
                "trending_collections"
            ]
            cache.delete_many(cache_keys)

            return response

        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            logger.error(f"Failed to update collection: {str(e)}")
            return Response(
                {"error": "Failed to update collection"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, *args, **kwargs):
        """
        Delete a collection if user is the owner.
        """
        try:
            collection = self.get_object()
            
            # Check ownership
            if collection.user != request.user and not request.user.is_staff:
                raise PermissionDenied("You can only delete your own collections")

            user_id = collection.user.id
            collection_id = collection.id
            
            collection.delete()

            # Clear relevant caches
            cache_keys = [
                f"collection_{collection_id}",
                f"user_collections_{user_id}",
                "featured_collections",
                "trending_collections"
            ]
            cache.delete_many(cache_keys)

            return Response(status=status.HTTP_204_NO_CONTENT)

        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            logger.error(f"Failed to delete collection: {str(e)}")
            return Response(
                {"error": "Failed to delete collection"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def add_photos(self, request, pk=None):
        """Add photos to a collection."""
        try:
            collection = self.get_object()
            
            # Check ownership
            if collection.user != request.user:
                raise PermissionDenied("You can only add photos to your own collections")

            photo_ids = request.data.get('photo_ids', [])
            if not photo_ids:
                raise ValidationError("photo_ids list is required")

            # Check collection size limit
            current_size = PhotoCollection.objects.filter(collection=collection).count()
            if current_size + len(photo_ids) > self.MAX_PHOTOS_PER_COLLECTION:
                raise ValidationError(f"Collection cannot exceed {self.MAX_PHOTOS_PER_COLLECTION} photos")

            # Add photos
            added_photos = []
            with transaction.atomic():
                for photo_id in photo_ids:
                    photo = get_object_or_404(Photo, id=photo_id)
                    photo_collection, created = PhotoCollection.objects.get_or_create(
                        photo=photo,
                        collection=collection
                    )
                    if created:
                        added_photos.append(photo_id)

            # Clear relevant caches
            cache_keys = [
                f"collection_photos_{collection.id}",
                f"collection_{collection.id}",
                f"photo_collections_{','.join(map(str, photo_ids))}"
            ]
            cache.delete_many(cache_keys)

            return Response({
                "message": "Photos added successfully",
                "added_photos": added_photos
            })

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            logger.error(f"Failed to add photos to collection: {str(e)}")
            return Response(
                {"error": "Failed to add photos to collection"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def remove_photos(self, request, pk=None):
        """Remove photos from a collection."""
        try:
            collection = self.get_object()
            
            # Check ownership
            if collection.user != request.user:
                raise PermissionDenied("You can only remove photos from your own collections")

            photo_ids = request.data.get('photo_ids', [])
            if not photo_ids:
                raise ValidationError("photo_ids list is required")

            # Remove photos
            removed = PhotoCollection.objects.filter(
                collection=collection,
                photo_id__in=photo_ids
            ).delete()[0]

            # Clear relevant caches
            cache_keys = [
                f"collection_photos_{collection.id}",
                f"collection_{collection.id}",
                f"photo_collections_{','.join(map(str, photo_ids))}"
            ]
            cache.delete_many(cache_keys)

            return Response({
                "message": "Photos removed successfully",
                "removed_count": removed
            })

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            logger.error(f"Failed to remove photos from collection: {str(e)}")
            return Response(
                {"error": "Failed to remove photos from collection"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def toggle_like(self, request, pk=None):
        """Toggle like status for a collection."""
        try:
            collection = self.get_object()
            
            with transaction.atomic():
                like, created = CollectionLike.objects.get_or_create(
                    user=request.user,
                    collection=collection
                )
                
                if not created:
                    # User already likes, so unlike
                    like.delete()
                    collection.likes_count = F('likes_count') - 1
                else:
                    collection.likes_count = F('likes_count') + 1
                
                collection.save()

            # Clear relevant caches
            cache_keys = [
                f"collection_{collection.id}",
                f"user_liked_collections_{request.user.id}",
                "trending_collections"
            ]
            cache.delete_many(cache_keys)

            return Response({
                "message": f"Collection {'liked' if created else 'unliked'} successfully",
                "likes_count": Collection.objects.get(id=collection.id).likes_count
            })

        except Exception as e:
            logger.error(f"Failed to toggle collection like: {str(e)}")
            return Response(
                {"error": "Failed to toggle collection like"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def toggle_follow(self, request, pk=None):
        """Toggle follow status for a collection."""
        try:
            collection = self.get_object()
            
            with transaction.atomic():
                follow, created = CollectionFollower.objects.get_or_create(
                    user=request.user,
                    collection=collection
                )
                
                if not created:
                    # User already follows, so unfollow
                    follow.delete()
                    collection.followers_count = F('followers_count') - 1
                else:
                    collection.followers_count = F('followers_count') + 1
                
                collection.save()

            # Clear relevant caches
            cache_keys = [
                f"collection_{collection.id}",
                f"user_followed_collections_{request.user.id}",
                "trending_collections"
            ]
            cache.delete_many(cache_keys)

            return Response({
                "message": f"Collection {'followed' if created else 'unfollowed'} successfully",
                "followers_count": Collection.objects.get(id=collection.id).followers_count
            })

        except Exception as e:
            logger.error(f"Failed to toggle collection follow: {str(e)}")
            return Response(
                {"error": "Failed to toggle collection follow"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured collections."""
        try:
            cache_key = "featured_collections"
            cached_collections = cache.get(cache_key)

            if cached_collections:
                return Response(cached_collections)

            # Get collections with most likes and followers in the last 30 days
            thirty_days_ago = timezone.now() - timedelta(days=30)
            collections = Collection.objects.filter(
                is_public=True,
                created_at__gte=thirty_days_ago
            ).annotate(
                engagement_score=Count('likes') + Count('followers')
            ).order_by('-engagement_score')[:10]

            serializer = self.get_serializer(collections, many=True)
            cache.set(cache_key, serializer.data, timeout=self.TRENDING_CACHE_TIMEOUT)
            
            return Response(serializer.data)

        except Exception as e:
            logger.error(f"Failed to fetch featured collections: {str(e)}")
            return Response(
                {"error": "Failed to fetch featured collections"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def trending(self, request):
        """Get trending collections based on recent activity."""
        try:
            cache_key = "trending_collections"
            cached_collections = cache.get(cache_key)

            if cached_collections:
                return Response(cached_collections)

            # Get collections with most recent likes and follows
            seven_days_ago = timezone.now() - timedelta(days=7)
            collections = Collection.objects.filter(
                is_public=True
            ).annotate(
                recent_likes=Count('likes', filter=Q(likes__liked_at__gte=seven_days_ago)),
                recent_follows=Count('followers', filter=Q(followers__followed_at__gte=seven_days_ago))
            ).order_by('-recent_likes', '-recent_follows')[:10]

            serializer = self.get_serializer(collections, many=True)
            cache.set(cache_key, serializer.data, timeout=self.TRENDING_CACHE_TIMEOUT)
            
            return Response(serializer.data)

        except Exception as e:
            logger.error(f"Failed to fetch trending collections: {str(e)}")
            return Response(
                {"error": "Failed to fetch trending collections"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def user_collections(self, request):
        """Get collections for a specific user."""
        try:
            user_id = request.query_params.get('user_id', request.user.id)
            cache_key = f"user_collections_{user_id}"
            cached_collections = cache.get(cache_key)

            if cached_collections:
                return Response(cached_collections)

            collections = Collection.objects.filter(user_id=user_id)
            if user_id != str(request.user.id) and not request.user.is_staff:
                collections = collections.filter(is_public=True)

            serializer = self.get_serializer(collections, many=True)
            cache.set(cache_key, serializer.data, timeout=self.CACHE_TIMEOUT)
            
            return Response(serializer.data)

        except Exception as e:
            logger.error(f"Failed to fetch user collections: {str(e)}")
            return Response(
                {"error": "Failed to fetch user collections"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get statistics for a collection."""
        try:
            collection = self.get_object()
            cache_key = f"collection_stats_{collection.id}"
            cached_stats = cache.get(cache_key)

            if cached_stats:
                return Response(cached_stats)

            stats = {
                "total_photos": PhotoCollection.objects.filter(collection=collection).count(),
                "likes_count": collection.likes_count,
                "followers_count": collection.followers_count,
                "recent_likes": CollectionLike.objects.filter(
                    collection=collection
                ).order_by('-liked_at')[:5].values(
                    'user__username',
                    'liked_at'
                ),
                "recent_followers": CollectionFollower.objects.filter(
                    collection=collection
                ).order_by('-followed_at')[:5].values(
                    'user__username',
                    'followed_at'
                )
            }

            cache.set(cache_key, stats, timeout=self.CACHE_TIMEOUT)
            return Response(stats)

        except Exception as e:
            logger.error(f"Failed to get collection stats: {str(e)}")
            return Response(
                {"error": "Failed to retrieve collection statistics"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PhotoCollectionViewSet(viewsets.ModelViewSet):
    """Handles CRUD operations for Photos in Collections"""
    queryset = PhotoCollection.objects.all()
    serializer_class = PhotoCollectionSerializer
    permission_classes = [IsAuthenticated]
