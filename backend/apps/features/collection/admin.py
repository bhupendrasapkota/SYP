from django.contrib import admin
from .models import Collection, PhotoCollection, CollectionLike, CollectionFollower

@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "is_public", "likes_count", "followers_count", "created_at")
    list_filter = ("is_public", "created_at", "user")
    search_fields = ("name", "user__username")
    ordering = ("-created_at",)
    readonly_fields = ("likes_count", "followers_count", "created_at")  # Prevent manual edits of counts
    
    def has_change_permission(self, request, obj=None):
        return request.user.is_staff  # 🔥 Admins can edit
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_staff  # 🔥 Admins can delete
    
    def has_add_permission(self, request):
        return request.user.is_staff  # 🔥 Admins can add

@admin.register(PhotoCollection)
class PhotoCollectionAdmin(admin.ModelAdmin):
    list_display = ("id", "photo", "collection")
    search_fields = ("collection__name", "photo__id")
    ordering = ("collection",)

@admin.register(CollectionLike)
class CollectionLikeAdmin(admin.ModelAdmin):
    list_display = ("user", "collection", "liked_at")
    search_fields = ("user__username", "collection__name")
    ordering = ("-liked_at",)

@admin.register(CollectionFollower)
class CollectionFollowerAdmin(admin.ModelAdmin):
    list_display = ("user", "collection", "followed_at")
    search_fields = ("user__username", "collection__name")
    ordering = ("-followed_at",)
