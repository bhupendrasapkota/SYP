from rest_framework import serializers
from .models import Category, photo_category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "image"]
        read_only_fields = ["id"]

class photo_categorySerializer(serializers.ModelSerializer):
    class Meta:
        model = photo_category
        fields = "__all__"