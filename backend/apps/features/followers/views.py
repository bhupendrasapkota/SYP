from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Follower
from .serializers import FollowerSerializer

class FollowerViewSet(viewsets.ModelViewSet):
    """Handles CRUD operations for followers"""
    queryset = Follower.objects.all()
    serializer_class = FollowerSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """Ensure the follow relationship is linked to the user"""
        serializer.save(user=self.request.user)

    def get_queryset(self):
        """Users can only see who they follow"""
        return Follower.objects.filter(user=self.request.user)

    @action(detail=True, methods=["delete"])
    def unfollow(self, request, pk=None):
        """Allow users to unfollow"""
        follow = get_object_or_404(Follower, id=pk, user=request.user)
        follow.delete()
        return Response({"detail": "Unfollowed successfully."}, status=status.HTTP_204_NO_CONTENT)
