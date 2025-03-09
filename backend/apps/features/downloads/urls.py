from django.urls import path
from .views import DownloadPhotoView, DownloadListView

urlpatterns = [
    path("photos/<uuid:photo_id>/download/", DownloadPhotoView.as_view(), name="download-photo"),
    path("my-downloads/", DownloadListView.as_view(), name="download-list"),
]
