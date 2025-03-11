from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Download
from .serializers import DownloadSerializer

class DownloadViewSet(viewsets.ModelViewSet):
    """Handles CRUD operations for downloads"""
    queryset = Download.objects.all()
    serializer_class = DownloadSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """Ensure the download is linked to the user"""
        serializer.save(user=self.request.user)

    def get_queryset(self):
        """Users can only view their own downloads"""
        return Download.objects.filter(user=self.request.user)

    @action(detail=True, methods=["delete"])
    def remove(self, request, pk=None):
        """Allow users to delete their downloaded photo"""
        download = get_object_or_404(Download, id=pk, user=request.user)
        download.delete()
        return Response({"detail": "Download deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
