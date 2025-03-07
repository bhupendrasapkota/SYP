from rest_framework import serializers
from apps.features.photos.models import Photo

class PhotoSerializer(serializers.ModelSerializer):
    """Serializer for handling Photo API responses."""
    image = serializers.CharField(required=True)
    username = serializers.CharField(source="user.username", read_only=True)
    upload_date = serializers.DateTimeField(format="%Y-%m-%d", read_only=True)
    ai_tags = serializers.ListField(child=serializers.CharField(), read_only=True)
    class Meta:
        model = Photo
        fields = ["username","image", "title", "description", "width", "height", "upload_date", "likes_count", "comments_count","ai_tags"]
