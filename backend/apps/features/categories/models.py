import uuid
from django.db import models
from apps.features.photos.models import Photo

class Category(models.Model):
    id = models.UUIDField(primary_key=True ,default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    image = models.ImageField(max_length=255)

    class Meta:
        db_table = "categories"    
        ordering = ["name"]

    def __str__(self):
        return self.name
    
class photo_category(models.Model):
    id = models.UUIDField(primary_key=True ,default=uuid.uuid4, editable=False)
    photo = models.ForeignKey(Photo, on_delete=models.CASCADE, related_name="photo_categories")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="photo_categories")

    class Meta:
        db_table = "photo_categories"
        constraints = [
            models.UniqueConstraint(fields=["photo", "category"], name="unique_photo_category")
        ]

    def __str__(self):
        return f"{self.photo} in {self.category}"
