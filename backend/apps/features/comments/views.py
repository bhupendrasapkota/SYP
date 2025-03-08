from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from .models import Comment
from .serializers import CommentSerializer

class AddCommentView(generics.CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        photo_id = self.kwargs["photo_id"]

        if Comment.objects.filter(user=user, photo_id=photo_id, comment_text=self.request.data.get("comment_text")).exists():
            raise serializer.ValidationError("You already posted this comment.")
        
        serializer.save(user=user, photo_id=photo_id)

class UpdateCommentView(generics.UpdateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        obj = get_object_or_404(Comment, id=self.kwargs["pk"])
        if obj.user != self.request.user:
            raise PermissionDenied("You can only edit your own comments.")
        return obj

class DeleteCommentView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_object(self):
        obj = get_object_or_404(Comment, id=self.kwargs["pk"])
        if obj.user != self.request.user:
            raise PermissionDenied("You can only delete your own comments.")
        return obj
