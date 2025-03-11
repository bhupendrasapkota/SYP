import uuid
import requests
from io import BytesIO
from PIL import Image as PILImage
from django.db import models
from cloudinary.models import CloudinaryField
from . import signals
from django.core.cache import cache

class Photo(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="photos")
    image = CloudinaryField("image", folder="photos/")
    title = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)
    format = models.CharField(max_length=20, null=True, blank=True)
    ai_tags = models.JSONField(default=list, blank=True)
    upload_date = models.DateTimeField(auto_now_add=True)
    likes_count = models.IntegerField(default=0)
    comments_count = models.IntegerField(default=0)
    downloads_count = models.IntegerField(default=0)


    class Meta:
        db_table = "photos"

    def save(self, *args, **kwargs):
        """Auto-extract image metadata before saving."""
        if not self.width or not self.height or not self.format:
            try:
                response = requests.get(self.image, stream=True)
                if response.status_code == 200:
                    img = PILImage.open(BytesIO(response.content))
                    self.width, self.height = img.size
                    self.format = img.format.lower()
            except Exception as e:
                print(f"Failed to extract image metadata: {e}")
                self.width, self.height, self.format = None, None, None

        cache.delete(f"photo:{self.id}")
        cache.delete("trending_photos")
        super().save(*args, **kwargs)
        
    def generate_ai_tags(self):
        return signals.generate_ai_tags(self)

        

    def __str__(self):
        return f"Photo by {self.user.username} - {self.title if self.title else 'Untitled'}"
