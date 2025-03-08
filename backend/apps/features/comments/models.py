import uuid
from django.db import models

class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="comments")
    photo = models.ForeignKey("photos.Photo", on_delete=models.CASCADE, related_name="photo_comments")
    comment_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "comments"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Comment by {self.user} on {self.photo}"