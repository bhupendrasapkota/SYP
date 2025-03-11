from rest_framework import serializers
from .models import Download
from apps.features.photos.models import Photo

class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = ["id", "image", "title"]

class DownloadSerializer(serializers.ModelSerializer):
    photo = serializers.PrimaryKeyRelatedField(queryset=Photo.objects.all())

    class Meta:
        model = Download
        fields = ["id", "photo", "downloaded_at"]
