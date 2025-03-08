from rest_framework import serializers
from .models import Follower

class FollowerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follower
        fields = ["id", "follower", "following", "followed_at"]
        read_only_fields = ["id", "follower", "followed_at"]
