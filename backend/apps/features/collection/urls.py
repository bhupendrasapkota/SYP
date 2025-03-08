from django.urls import path
from .views import (
    CollectionListCreateView, CollectionDetailView, 
    AddPhotoToCollectionView, LikeCollectionView, FollowCollectionView, trending_collections, recommended_collections
)

urlpatterns = [
    path("", CollectionListCreateView.as_view(), name="collection-list"),
    path("<uuid:pk>/", CollectionDetailView.as_view(), name="collection-detail"),
    path("<uuid:collection_id>/add-photo/", AddPhotoToCollectionView.as_view(), name="add-photo-to-collection"),
    path("<uuid:collection_id>/like/", LikeCollectionView.as_view(), name="like-collection"),
    path("<uuid:collection_id>/follow/", FollowCollectionView.as_view(), name="follow-collection"),
    path("trending/", trending_collections, name="trending_collections"),
    path("recommended/", recommended_collections, name="recommended_collections"),
]