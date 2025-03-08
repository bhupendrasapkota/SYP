from django.contrib import admin
from django.urls import path,include
from django.http import JsonResponse
from django.conf.urls import handler404

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.core.authentication.urls')),
    path('api/users/', include('apps.core.users.urls')),
    path("api/photos/", include("apps.features.photos.urls")),
    path("api/collections/", include("apps.features.collection.urls")),
    path("api/categories/", include("apps.features.categories.urls")),
    path("api/collections/", include("apps.features.collection.urls")),
    path("api/followers/", include("apps.features.followers.urls")),
    path("api/comments/", include("apps.features.comments.urls")),
    path("api/likes/", include("apps.features.likes.urls")),
]

def custom_404(request, exception=None):
    return JsonResponse({"detail": "The requested endpoint was not found."}, status=404)

handler404 = custom_404