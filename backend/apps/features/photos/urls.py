from django.urls import path
from .views import PhotoUploadView, PhotoListView

urlpatterns = [
    path("upload/", PhotoUploadView.as_view(), name="photo-upload"),
    path("", PhotoListView.as_view(), name="photo-list"),
]
