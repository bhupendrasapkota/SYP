from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from .models import Comment
from .serializers import CommentSerializer

class CommentViewSet(viewsets.ModelViewSet):
    """Handles CRUD operations for comments"""
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """Ensure the comment is linked to the user"""
        serializer.save(user=self.request.user)

    def get_queryset(self):
        """Allow users to only view their own comments"""
        if self.request.user.is_staff:
            return Comment.objects.all()
        return Comment.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        """Restrict editing to comment owner"""
        comment = self.get_object()
        if comment.user != request.user:
            raise PermissionDenied("You can only edit your own comments.")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Restrict deletion to comment owner"""
        comment = self.get_object()
        if comment.user != request.user:
            raise PermissionDenied("You can only delete your own comments.")
        return super().destroy(request, *args, **kwargs)
