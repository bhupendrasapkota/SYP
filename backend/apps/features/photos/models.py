import uuid
from django.db import models
from django.db.models import JSONField
from cloudinary.models import CloudinaryField
from cloudinary.uploader import upload
from PIL import Image
import requests
from io import BytesIO

class Photo(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="photos")
    image = CloudinaryField("image", folder="photos/")
    title = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)
    format = models.CharField(max_length=20, null=True, blank=True)
    ai_tags = models.JSONField(blank=True, null=True)
    upload_date = models.DateTimeField(auto_now_add=True)
    likes_count = models.IntegerField(default=0)
    comments_count = models.IntegerField(default=0)

    class Meta:
        db_table = "photos"

    def save(self, *args, **kwargs):
        """Auto-extract image metadata before saving."""
        if not self.width or not self.height or not self.format:
            response = requests.get(self.image, stream=True)
            if response.status_code == 200:
                img = Image.open(BytesIO(response.content))
                self.width, self.height = img.size
                self.format = img.format.lower()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Photo by {self.user.username} - {self.title if self.title else 'Untitled'}"
