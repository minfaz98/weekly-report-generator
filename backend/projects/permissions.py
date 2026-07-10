from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsManagerOrAdmin(BasePermission):
    """
    Team Members: Can only view projects.
    Managers/Superusers: Full CRUD capabilities.
    """
    message = "Only managers or administrators can perform this action."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return True

        if request.user.is_superuser:
            return True

        return getattr(request.user, "role", None) == "MANAGER"