from django.contrib import admin
from .models import Comment

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("user", "photo", "comment_text", "created_at")
    list_filter = ("created_at",)
    search_fields = ("user__username", "photo__title", "comment_text")
    ordering = ("-created_at",)
