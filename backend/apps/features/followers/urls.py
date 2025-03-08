from django.urls import path
from .views import FollowUserView, UnfollowUserView

urlpatterns = [
    path("users/<uuid:user_id>/follow/", FollowUserView.as_view(), name="follow_user"),
    path("users/<uuid:user_id>/unfollow/", UnfollowUserView.as_view(), name="unfollow_user"),
]
