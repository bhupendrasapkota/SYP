from django.db import models

class Follower(models.Model):
    id = models.BigAutoField(primary_key=True)
    follower = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="following")
    following = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="followers")
    followed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "followers"
        unique_together = ("follower", "following")
        ordering = ["-followed_at"]

    def __str__(self):
        return f"{self.follower} follows {self.following}"
