from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.cache import cache
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from django.db.models import Count, Q
from .models import Collection, PhotoCollection, CollectionLike, CollectionFollower
from .serializers import (
    CollectionSerializer, PhotoCollectionSerializer,
    CollectionLikeSerializer, CollectionFollowerSerializer
)
from .permissions import IsOwnerOrReadOnly

class CollectionViewSet(viewsets.ModelViewSet):
    """Handles CRUD operations for Collections"""
    queryset = Collection.objects.select_related("user").prefetch_related("photo_collections").all()
    serializer_class = CollectionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["is_public", "user"]

    def get_queryset(self):
        queryset = super().get_queryset()
        sort_by = self.request.query_params.get("sort_by")
        if sort_by == "likes":
            queryset = queryset.order_by("-likes_count")
        elif sort_by == "followers":
            queryset = queryset.order_by("-followers_count")
        elif sort_by == "date":
            queryset = queryset.order_by("-created_at")
        return queryset

    def retrieve(self, request, *args, **kwargs):
        """Retrieve a collection with caching"""
        collection_id = kwargs.get("pk")
        cache_key = f"collection_{collection_id}"
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)

        response = super().retrieve(request, *args, **kwargs)
        cache.set(cache_key, response.data, timeout=3600)
        return response

    @action(detail=True, methods=["post"])
    def add_photo(self, request, pk=None):
        """Add a photo to a collection"""
        data = request.data.copy()
        data["collection"] = pk
        serializer = PhotoCollectionSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            cache.delete(f"collection_{pk}")  # Invalidate cache
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"])
    def like(self, request, pk=None):
        """Like a collection"""
        user = request.user
        if CollectionLike.objects.filter(user=user, collection_id=pk).exists():
            return Response({"detail": "You already liked this collection."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = CollectionLikeSerializer(data={"user": user.id, "collection": pk})
        if serializer.is_valid():
            serializer.save()
            cache.delete(f"collection_{pk}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"])
    def follow(self, request, pk=None):
        """Follow a collection"""
        user = request.user
        if CollectionFollower.objects.filter(user=user, collection_id=pk).exists():
            return Response({"detail": "You already follow this collection."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = CollectionFollowerSerializer(data={"user": user.id, "collection": pk})
        if serializer.is_valid():
            serializer.save()
            cache.delete(f"collection_{pk}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def trending(self, request):
        """Get trending collections"""
        collections = Collection.objects.filter(is_public=True).annotate(
            total_score=Count("collectionlike") + Count("collectionfollower")
        ).order_by("-total_score")[:10]
        return Response(CollectionSerializer(collections, many=True).data)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def recommended(self, request):
        """Get recommended collections for a user"""
        user = request.user
        liked_collections = CollectionLike.objects.filter(user=user).values_list("collection", flat=True)
        followed_collections = CollectionFollower.objects.filter(user=user).values_list("collection", flat=True)

        recommended = Collection.objects.filter(
            Q(collectionlike__user__collectionlike__collection__in=liked_collections) |
            Q(collectionfollower__user__collectionfollower__collection__in=followed_collections)
        ).exclude(id__in=liked_collections).exclude(id__in=followed_collections).distinct()[:10]

        return Response(CollectionSerializer(recommended, many=True).data)


class PhotoCollectionViewSet(viewsets.ModelViewSet):
    """Handles CRUD operations for Photos in Collections"""
    queryset = PhotoCollection.objects.all()
    serializer_class = PhotoCollectionSerializer
    permission_classes = [IsAuthenticated]
