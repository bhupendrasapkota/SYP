from django.contrib import admin
from django.urls import path,include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.core.authentication.urls')),
    path('api/users/', include('apps.core.users.urls')),
    path("api/photos/", include("apps.features.photos.urls")),
]
