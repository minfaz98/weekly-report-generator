from django.db.models import Prefetch
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Project
from .permissions import IsManagerOrAdmin
from .serializers import ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    """
    Project CRUD API

    Team Members
        - View projects only

    Managers/Admins
        - Full CRUD
    """

    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, IsManagerOrAdmin]

    queryset = (
        Project.objects
        .prefetch_related("assigned_members")
        .all()
    )

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "name",
        "description",
    ]

    ordering_fields = [
        "name",
        "created_at",
    ]

    ordering = ["name"]

    def get_queryset(self):

        queryset = (
            Project.objects
            .prefetch_related(
                Prefetch("assigned_members")
            )
            .all()
        )

        is_active = self.request.query_params.get("is_active")

        if is_active is not None:
            queryset = queryset.filter(
                is_active=is_active.lower() == "true"
            )

        return queryset