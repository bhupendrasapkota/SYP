from django.contrib import admin
from django.urls import path,include
from django.http import JsonResponse
from django.conf.urls import handler404

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/users/", include("apps.core.users.urls", namespace="users")),  
    path("api/auth/", include("apps.core.authentication.urls", namespace="authentication")),  
    path("api/categories/", include("apps.features.categories.urls", namespace="categories")),  
    path("api/collections/", include("apps.features.collection.urls", namespace="collections")),  
    path("api/comments/", include("apps.features.comments.urls", namespace="comments")),  
    path("api/downloads/", include("apps.features.downloads.urls", namespace="downloads")),  
    path("api/followers/", include("apps.features.followers.urls", namespace="followers")),  
    path("api/likes/", include("apps.features.likes.urls", namespace="likes")),  
    path("api/photos/", include("apps.features.photos.urls", namespace="photos")),
]

def custom_404(request, exception=None):
    return JsonResponse({"detail": "The requested endpoint was not found."}, status=404)

handler404 = custom_404