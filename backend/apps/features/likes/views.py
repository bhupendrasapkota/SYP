from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Like
from .serializers import LikeSerializer

class LikeViewSet(viewsets.ModelViewSet):
    """Handles CRUD operations for likes"""
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """Ensure the like is linked to the user"""
        serializer.save(user=self.request.user)

    def get_queryset(self):
        """Users can only see their own likes"""
        return Like.objects.filter(user=self.request.user)

    @action(detail=True, methods=["delete"])
    def unlike(self, request, pk=None):
        """Allow users to unlike"""
        like = get_object_or_404(Like, id=pk, user=request.user)
        like.delete()
        return Response({"detail": "Unliked successfully."}, status=status.HTTP_204_NO_CONTENT)
