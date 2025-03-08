from django.contrib import admin
from .models import Category, photo_category

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "image")
    search_fields = ("name",)
    ordering = ("name",)
    
@admin.register(photo_category)
class photo_categoryAdmin(admin.ModelAdmin):
    list_display = ("id", "photo", "category")
    search_fields = ("category__name", "photo__id")
    ordering = ("category",)
