from rest_framework import serializers
from .models import Follower
from apps.core.users.serializers import ProfileSerializer

class FollowerSerializer(serializers.ModelSerializer):
    follower = ProfileSerializer(read_only=True)
    following = ProfileSerializer(read_only=True)
    
    class Meta:
        model = Follower
        fields = ["id", "follower", "following", "followed_at"]
        read_only_fields = ["id", "followed_at"]
