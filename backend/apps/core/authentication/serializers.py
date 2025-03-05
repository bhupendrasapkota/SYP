from rest_framework import serializers
from apps.core.users.models import User
from django.contrib.auth.hashers import make_password


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]
    
    def create(self, validated_data):
        validated_data["password"] = make_password(validated_data["password"])  # Hash password
        return User.objects.create(**validated_data)


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
