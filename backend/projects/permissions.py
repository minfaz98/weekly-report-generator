from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsManagerOrAdmin(BasePermission):
    """
    Team Members:
        Can only view projects.

    Managers:
        Can create, update and delete projects.

    Superusers:
        Full access.
    """

    message = "Only managers or administrators can perform this action."

    def has_permission(self, request, view):

        # User must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        # Everyone can read
        if request.method in SAFE_METHODS:
            return True

        # Superuser
        if request.user.is_superuser:
            return True

        # Manager role
        return request.user.role == "MANAGER"