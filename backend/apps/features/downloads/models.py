import uuid
from django.db import models
from apps.core.users.models import User
from apps.features.photos.models import Photo

class Download(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="downloads")
    photo = models.ForeignKey(Photo, on_delete=models.CASCADE, related_name="photo_downloads")
    downloaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "downloads"
        unique_together = ("user", "photo")
        ordering = ["-downloaded_at"]

    def __str__(self):
        return f"{self.user.username} downloaded {self.photo.title}"
