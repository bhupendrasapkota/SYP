from rest_framework import serializers
from .models import Collection, PhotoCollection, CollectionLike, CollectionFollower
from apps.features.photos.serializers import PhotoSerializer

class CollectionSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    followers_count = serializers.IntegerField(read_only=True)
    photo_count = serializers.SerializerMethodField()

    class Meta:
        model = Collection
        fields = ['id', 'name', 'slug', 'description', 'is_public', 'created_at', 
                 'user', 'likes_count', 'followers_count', 'photo_count']

    def get_photo_count(self, obj):
        return obj.photo_collections.count()

    def validate_name(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Collection name must be at least 3 characters.")
        return value

    def validate_is_public(self, value):
        if not isinstance(value, bool):
            raise serializers.ValidationError("is_public must be a boolean.")
        return value

class PhotoCollectionSerializer(serializers.ModelSerializer):
    photo = PhotoSerializer(read_only=True)
    
    class Meta:
        model = PhotoCollection
        fields = ['id', 'photo', 'collection']

class CollectionLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CollectionLike
        fields = "__all__"

class CollectionFollowerSerializer(serializers.ModelSerializer):
    class Meta:
        model = CollectionFollower
        fields = "__all__"