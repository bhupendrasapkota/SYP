from django.contrib import admin
from .models import Download

@admin.register(Download)
class DownloadAdmin(admin.ModelAdmin):
    list_display = ("user", "photo", "downloaded_at")
    search_fields = ("user__username", "photo__title")
    ordering = ("-downloaded_at",)
    list_filter = ("downloaded_at",)