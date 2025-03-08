import uuid
from django.db import models
from django.utils.text import slugify
from apps.core.users.models import User
from apps.features.photos.models import Photo

class Collection(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="collections",
                             db_constraint=False)
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    likes_count = models.IntegerField(default=0)
    followers_count = models.IntegerField(default=0)

    class Meta:
        db_table = "collections"
        ordering = ["-created_at"]
        permissions = [
            ("manage_collection", "Can manage collection"),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} by {self.user.username}"

class PhotoCollection(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    photo = models.ForeignKey(Photo, on_delete=models.CASCADE, related_name="photo_collections")
    collection = models.ForeignKey(Collection, on_delete=models.CASCADE, related_name="photo_collections")

    class Meta:
        db_table = "photo_collections"
        constraints = [
            models.UniqueConstraint(fields=["photo", "collection"], name="unique_photo_collection")
        ]

    def __str__(self):
        return f"{self.photo} in {self.collection}"


class CollectionLike(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="collection_likes")
    collection = models.ForeignKey(Collection, on_delete=models.CASCADE, related_name="likes")
    liked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "collection_likes"
        unique_together = ("user", "collection")

    def __str__(self):
        return f"{self.user.username} liked {self.collection.name}"

class CollectionFollower(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="collection_followers")
    collection = models.ForeignKey(Collection, on_delete=models.CASCADE, related_name="followers")
    followed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "collection_followers"
        unique_together = ("user", "collection")

    def __str__(self):
        return f"{self.user.username} follows {self.collection.name}"
