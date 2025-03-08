from django.contrib import admin
from .models import Follower

@admin.register(Follower)
class FollowerAdmin(admin.ModelAdmin):
    list_display = ("follower", "following", "followed_at")
    list_filter = ("followed_at",)
    search_fields = ("follower__username", "following__username")
    ordering = ("-followed_at",)
