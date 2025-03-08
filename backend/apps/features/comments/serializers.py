from rest_framework import serializers
from .models import Comment

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ["id", "user", "photo", "comment_text", "created_at"]
        read_only_fields = ["id", "user", "created_at"]

    def validate_comment_text(self, value):
        """Ensure comment is not empty"""
        if not value.strip():
            raise serializers.ValidationError("Comment cannot be empty.")
        return value
