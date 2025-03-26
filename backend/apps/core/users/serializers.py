from rest_framework import serializers
from apps.core.users.models import User

class ProfileSerializer(serializers.ModelSerializer):
    profile_picture = serializers.CharField(required=False)
    class Meta:
        model = User
        fields = ["id","username", "email", "full_name", "bio", "profile_picture", "about", "contact","followers_count","following_count","created_at"]
        read_only_fields = ["id","followers_count","following_count","created_at"]