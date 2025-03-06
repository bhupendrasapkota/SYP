from rest_framework import serializers
from apps.features.photos.models import Photo

class PhotoSerializer(serializers.ModelSerializer):
    """Serializer for handling Photo API responses."""
    image = serializers.CharField(required=True)
    class Meta:
        model = Photo
        fields = ["id", "user", "image", "title", "description", "width", "height", "format", "ai_tags", "upload_date", "likes_count", "comments_count"]
