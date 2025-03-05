from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from apps.core.users.models import User
from .serializers import ProfileSerializer

class ProfileView(APIView):
    """Handles retrieving and updating user profile."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Retrieve the logged-in user's profile."""
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        """Update user profile fields."""
        serializer = ProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully", "data": serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
