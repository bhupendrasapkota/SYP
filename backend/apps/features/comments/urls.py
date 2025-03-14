from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CommentViewSet

app_name = "comments"

router = DefaultRouter()
router.register(r'', CommentViewSet, basename='comments')

urlpatterns = [
    path("", include(router.urls)),
]
