from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from accounts.models import User
from .models import WeeklyReport
from .serializers import WeeklyReportSerializer


class WeeklyReportViewSet(viewsets.ModelViewSet):
    serializer_class = WeeklyReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = WeeklyReport.objects.select_related("user", "project")

        # ===============================
        # Manager / Admin Filtering Logic
        # ===============================
        if user.is_superuser or user.role == "MANAGER":
            week = self.request.query_params.get("week")
            member = self.request.query_params.get("member")
            project = self.request.query_params.get("project")
            status_filter = self.request.query_params.get("status")
            
            # Date Range Parameters Expansion
            start_date = self.request.query_params.get("start_date")
            end_date = self.request.query_params.get("end_date")

            if week:
                queryset = queryset.filter(week_start=week)
            if member:
                queryset = queryset.filter(user_id=member)
            if project:
                queryset = queryset.filter(project_id=project)
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            if start_date:
                queryset = queryset.filter(week_start__gte=start_date)
            if end_date:
                queryset = queryset.filter(week_end__lte=end_date)

            return queryset.order_by("-week_start")

        # ===============================
        # Team Member Isolated View
        # ===============================
        return queryset.filter(user=user).order_by("-week_start")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Security Boundary: Enforce object ownership check before deletion
        if not request.user.is_superuser and request.user.role != "MANAGER" and instance.user != request.user:
            raise PermissionDenied("You do not have permission to delete this report.")
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        report = self.get_object()

        if report.user != request.user:
            return Response(
                {"error": "You cannot submit another user's report."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if report.status == WeeklyReport.Status.SUBMITTED:
            return Response({"message": "Report already submitted."}, status=status.HTTP_200_OK)

        report.status = WeeklyReport.Status.SUBMITTED
        report.submitted_at = timezone.now()
        report.save()

        serializer = self.get_serializer(report)
        return Response(serializer.data)