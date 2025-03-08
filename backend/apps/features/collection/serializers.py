from rest_framework import serializers
from .models import Collection, PhotoCollection, CollectionLike, CollectionFollower

class CollectionSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    followers_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Collection
        fields = "__all__"

class PhotoCollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhotoCollection
        fields = "__all__"

class CollectionLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CollectionLike
        fields = "__all__"

class CollectionFollowerSerializer(serializers.ModelSerializer):
    class Meta:
        model = CollectionFollower
        fields = "__all__"

class CollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collection
        fields = "__all__"


    def validate_name(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Collection name must be at least 3 characters.")
        return value

    def validate_is_public(self, value):
        if not isinstance(value, bool):
            raise serializers.ValidationError("is_public must be a boolean.")
        return value