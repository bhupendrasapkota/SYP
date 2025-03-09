from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from django.core.cache import cache
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from .models import Download
from .serializers import DownloadSerializer
from apps.features.photos.models import Photo

@method_decorator(ratelimit(key="user", rate="5/m", method="POST", block=True), name="dispatch")
class DownloadPhotoView(generics.CreateAPIView):
    serializer_class = DownloadSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        user = request.user
        photo_id = kwargs["photo_id"]

        # Get the photo
        photo = get_object_or_404(Photo, id=photo_id)

        try:
            # Create download entry
            download = Download.objects.create(user=user, photo=photo)

            # Increment download count
            photo.increment_downloads()

            # Clear cache for user downloads
            cache.delete(f"user_downloads_{user.id}")

            return Response(
                {"message": "Download recorded successfully.", "data": DownloadSerializer(download).data}, 
                status=status.HTTP_201_CREATED
            )
        except IntegrityError:
            return Response({"error": "You have already downloaded this photo."}, status=status.HTTP_400_BAD_REQUEST)

class DownloadListView(generics.ListAPIView):
    serializer_class = DownloadSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        cache_key = f"user_downloads_{user.id}"
        downloads = cache.get(cache_key)

        if not downloads:
            downloads = Download.objects.filter(user=user).select_related("photo")
            cache.set(cache_key, downloads, timeout=600)  # Cache for 10 minutes

        return downloads
