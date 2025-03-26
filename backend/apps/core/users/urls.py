from django.urls import path
from .views import ProfileView

app_name = "users"

urlpatterns = [
    path("profile/", ProfileView.as_view(), name="profile"),
    path("profile/<uuid:id>/", ProfileView.as_view(), name="user-profile"),
]
