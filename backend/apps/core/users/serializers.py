from rest_framework import serializers
from apps.core.users.models import User

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email", "full_name", "bio", "profile_picture", "about", "contact","followers_count","following_count"]
