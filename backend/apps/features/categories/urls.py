from django.urls import path
from .views import CategoryListView, CategoryCreateView,CategoryUpdateView, CategoryDeleteView, photo_categoryListView

urlpatterns = [
    path("", CategoryListView.as_view(), name="category-list"),
    path("add/", CategoryCreateView.as_view(), name="category-add"),
    path("<int:pk>/update/", CategoryUpdateView.as_view(), name="category-update"),
    path("<int:pk>/delete/", CategoryDeleteView.as_view(), name="category-delete"),
    path("photo_categories/", photo_categoryListView.as_view(), name="photo_category-list"),
]