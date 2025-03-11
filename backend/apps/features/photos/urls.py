from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PhotoViewSet

app_name = "photos"

router = DefaultRouter()
router.register(r'', PhotoViewSet, basename='photos')

urlpatterns = [
    path("", include(router.urls)),
]
