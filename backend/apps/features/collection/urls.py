from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CollectionViewSet, PhotoCollectionViewSet

app_name = "collections"

router = DefaultRouter()
router.register(r'collections', CollectionViewSet, basename='collections')
router.register(r'photo-collections', PhotoCollectionViewSet, basename='photo-collections')

urlpatterns = [
    path("", include(router.urls)),
]
