from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FollowerViewSet

app_name = "followers"

router = DefaultRouter()
router.register(r'', FollowerViewSet, basename='followers')

urlpatterns = [
    path("", include(router.urls)),
]
