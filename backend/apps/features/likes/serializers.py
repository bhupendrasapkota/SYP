from rest_framework import serializers
from .models import Like

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ["id", "user", "photo", "liked_at"]
        read_only_fields = ["id", "liked_at"]

    def validate(self, data):
        """Prevent duplicate likes"""
        user = data["user"]
        photo = data["photo"]

        if Like.objects.filter(user=user, photo=photo).exists():
            raise serializers.ValidationError("You have already liked this photo.")

        return data
