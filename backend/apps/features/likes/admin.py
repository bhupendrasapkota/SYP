from django.contrib import admin
from .models import Like

@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ("user", "photo", "liked_at")
    list_filter = ("liked_at",)
    search_fields = ("user__username", "photo__title")
    ordering = ("-liked_at",)
