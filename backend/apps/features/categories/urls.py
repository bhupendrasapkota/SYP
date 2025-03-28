from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet

app_name = "categories"

router = DefaultRouter()
router.register(r'', CategoryViewSet, basename='categories')

urlpatterns = [
    path("", include(router.urls)),  # Router-based URL management
]
