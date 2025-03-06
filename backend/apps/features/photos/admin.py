from django.contrib import admin
from .models import Photo

class PhotoAdmin(admin.ModelAdmin):
    """Admin configuration for the Photo model."""
    list_display = ("title", "user", "upload_date", "likes_count", "comments_count", "format", "get_size")
    list_filter = ("upload_date", "format", "user")
    search_fields = ("title", "user__username", "description", "ai_tags")
    ordering = ("-upload_date",)

    readonly_fields = ("width", "height", "format", "upload_date", "likes_count", "comments_count")

    
    def get_size(self, obj):
        return f"{obj.width}x{obj.height}" if obj.width and obj.height else "Unknown"
    get_size.short_description = "Size (WxH)"

    
    fieldsets = (
        ("Basic Info", {
            "fields": ("user", "title", "description", "image", "ai_tags")
        }),
        ("Image Metadata", {
            "fields": ("width", "height", "format", "upload_date")
        }),
        ("Engagement", {
            "fields": ("likes_count", "comments_count")
        }),
    )

admin.site.register(Photo, PhotoAdmin)
