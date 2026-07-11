from django.db.models import Prefetch
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Project
from .serializers import ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    """
    Project Management API. Handles CRUD operations for workspace projects cleanly.
    Allows Managers to see all items while filtering Team Members to their assigned allocations.
    """
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    def get_queryset(self):
        user = self.request.user
        
        # 🌟 Optimized Query Base with Many-to-Many Prefetching
        base_queryset = Project.objects.prefetch_related(
            Prefetch("assigned_members")
        )

        # 🛡️ Role Matrix Boundary Check
        # If the user is an admin/superuser or has a explicit MANAGER role string set:
        if user.is_superuser or getattr(user, "role", None) == "MANAGER":
            queryset = base_queryset.all()
        else:
            # Otherwise, filter down the relationships array to match the member's current ID token
            queryset = base_queryset.filter(assigned_members=user)

        # Apply existing is_active query param filters if present
        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")
            
        return queryset