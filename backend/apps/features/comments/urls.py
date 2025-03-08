from django.urls import path
from .views import AddCommentView, UpdateCommentView, DeleteCommentView

urlpatterns = [
    path("photos/<uuid:photo_id>/comments/add/", AddCommentView.as_view(), name="add_comment"),
    path("comments/<uuid:pk>/edit/", UpdateCommentView.as_view(), name="edit_comment"),
    path("comments/<uuid:pk>/delete/", DeleteCommentView.as_view(), name="delete_comment"),
]