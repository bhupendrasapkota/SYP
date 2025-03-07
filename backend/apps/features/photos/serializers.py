from rest_framework import serializers
from apps.features.photos.models import Photo

class PhotoSerializer(serializers.ModelSerializer):
    """Serializer for handling Photo API responses."""
    image = serializers.CharField(required=True)
    username = serializers.CharField(source="user.username", read_only=True)
    class Meta:
        model = Photo
        fields = ["username","image", "title", "description", "width", "height", "upload_date", "likes_count", "comments_count"]
