from django.db import models

class Like(models.Model):
    user = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="likes")
    photo = models.ForeignKey("photos.Photo", on_delete=models.CASCADE, related_name="photo_likes")
    liked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "likes"
        unique_together = ("user", "photo")

    def __str__(self):
        return f"{self.user} liked {self.photo}"
