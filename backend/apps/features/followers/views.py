from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Follower
from .serializers import FollowerSerializer
from apps.core.users.models import User

class FollowUserView(generics.CreateAPIView):
    serializer_class = FollowerSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        follower = request.user
        following = get_object_or_404(User, id=kwargs["user_id"])

        if follower == following:
            return Response({"detail": "You cannot follow yourself."}, status=status.HTTP_400_BAD_REQUEST)

        follow, created = Follower.objects.get_or_create(follower=follower, following=following)

        if not created:
            return Response({"detail": "You are already following this user."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "Followed successfully."}, status=status.HTTP_201_CREATED)

class UnfollowUserView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        follower = request.user
        following = get_object_or_404(User, id=kwargs["user_id"])

        deleted, _ = Follower.objects.filter(follower=follower, following=following).delete()

        if deleted == 0:
            return Response({"detail": "You are not following this user."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "Unfollowed successfully."}, status=status.HTTP_200_OK)
