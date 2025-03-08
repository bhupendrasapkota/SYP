from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsOwnerOrReadOnly(BasePermission):
    """
    Custom permission to allow only the owner of a collection to edit it.
    Others can only view if it's public.
    """

    def has_object_permission(self, request, view, obj):
        # Allow read-only access if the collection is public
        if request.method in SAFE_METHODS:
            return obj.is_public or obj.user == request.user

        return obj.user == request.user
