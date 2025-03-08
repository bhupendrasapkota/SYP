from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.cache import cache
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from .models import Collection, PhotoCollection, CollectionLike, CollectionFollower
from .serializers import (
    CollectionSerializer, PhotoCollectionSerializer,
    CollectionLikeSerializer, CollectionFollowerSerializer
)
from .permissions import IsOwnerOrReadOnly
from django.db.models import Count, Q
from rest_framework.decorators import api_view



class CollectionPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class CollectionListCreateView(generics.ListCreateAPIView):
    queryset = Collection.objects.select_related("user").prefetch_related("photo_collections").all()
    serializer_class = CollectionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CollectionPagination
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


class CollectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CollectionSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
             return Collection.objects.all()

        return Collection.objects.select_related("user").prefetch_related("photo_collections").all()

    def retrieve(self, request, *args, **kwargs):
        collection_id = kwargs.get("pk")
        cache_key = f"collection_{collection_id}"
        cached_data = cache.get(cache_key)

        if cached_data:
            return Response(cached_data)

        response = super().retrieve(request, *args, **kwargs)
        cache.set(cache_key, response.data, timeout=3600)
        return response


class AddPhotoToCollectionView(generics.CreateAPIView):
    serializer_class = PhotoCollectionSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        collection_id = kwargs.get("collection_id")
        data["collection"] = collection_id

        if not Collection.objects.filter(id=collection_id).exists():
            return Response({"detail": "Collection not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            cache.delete(f"collection_{collection_id}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class LikeCollectionView(generics.CreateAPIView):
    serializer_class = CollectionLikeSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        collection_id = kwargs.get("collection_id")
        user = request.user

        if CollectionLike.objects.filter(user=user, collection_id=collection_id).exists():
            return Response({"detail": "You already liked this collection."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data={"user": user.id, "collection": collection_id})
        if serializer.is_valid():
            serializer.save()
            
            cache.delete(f"collection_{collection_id}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FollowCollectionView(generics.CreateAPIView):
    serializer_class = CollectionFollowerSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        collection_id = kwargs.get("collection_id")
        user = request.user

        if CollectionFollower.objects.filter(user=user, collection_id=collection_id).exists():
            return Response({"detail": "You already follow this collection."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data={"user": user.id, "collection": collection_id})
        if serializer.is_valid():
            serializer.save()
            # Update cache
            cache.delete(f"collection_{collection_id}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(["GET"])
def trending_collections(request):
    
    collections = Collection.objects.filter(is_public=True).annotate(
        total_score=Count("collectionlike") + Count("collectionfollower")
    ).order_by("-total_score")[:10]  # Top 10 trending collections

    serializer = CollectionSerializer(collections, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def recommended_collections(request):
    user = request.user
    if not user.is_authenticated:
        return Response({"detail": "Authentication required."}, status=401)

    
    liked_collections = Collection.objects.filter(collectionlike__user=user).values_list("id", flat=True)
    followed_collections = Collection.objects.filter(collectionfollower__user=user).values_list("id", flat=True)

    
    recommended = Collection.objects.filter(
        Q(collectionlike__user__collectionlike__collection__in=liked_collections) |
        Q(collectionfollower__user__collectionfollower__collection__in=followed_collections)
    ).exclude(id__in=liked_collections).exclude(id__in=followed_collections).distinct()[:10]

    serializer = CollectionSerializer(recommended, many=True)
    return Response(serializer.data)
