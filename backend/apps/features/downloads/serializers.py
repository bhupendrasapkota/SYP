from rest_framework import serializers
from .models import Download
from apps.features.photos.models import Photo

class PhotoSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Photo
        fields = ["id", "image", "title", "description", "width", "height", "upload_date", "likes_count", "comments_count", "downloads_count", "ai_tags", "username"]

    def get_image(self, obj):
        return obj.image.url if obj.image else None

class DownloadSerializer(serializers.ModelSerializer):
    photo = PhotoSerializer(read_only=True)

    class Meta:
        model = Download
        fields = ["id", "photo", "downloaded_at"]
