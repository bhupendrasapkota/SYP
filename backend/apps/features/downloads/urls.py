from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DownloadViewSet

app_name = "downloads"
router = DefaultRouter()
router.register(r'', DownloadViewSet, basename='downloads')

urlpatterns = [
    path("", include(router.urls)),
]
