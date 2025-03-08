from django.urls import path
from .views import LikePhotoView, UnlikePhotoView

urlpatterns = [
    path("photos/<uuid:photo_id>/like/", LikePhotoView.as_view(), name="like_photo"),
    path("photos/<uuid:photo_id>/unlike/", UnlikePhotoView.as_view(), name="unlike_photo"),
]
