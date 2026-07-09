from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from .models import WeeklyReport
from .serializers import WeeklyReportSerializer

class ReportListCreateView(generics.ListCreateAPIView):
    """
    GET: Returns report history records. Managers view global team listings,
         while standard members receive their own collections.
    POST: Formulates a fresh report entry block linked to the active profile.
    """
    serializer_class = WeeklyReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # 1. Capture dynamic URL queries for filtering matching your dashboard configurations
        queryset = WeeklyReport.objects.all().select_related("user", "project")
        
        project_id = self.request.query_params.get("project")
        status_param = self.request.query_params.get("status")
        
        if user.role != "MANAGER":
            queryset = queryset.filter(user=user)
            
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        return queryset

    def perform_create(self, serializer):
        # Attach the user context profile to the creation data payload
        status_choice = serializer.validated_data.get("status", "DRAFT")
        submitted_at_val = timezone.now() if status_choice == "SUBMITTED" else None
        
        serializer.save(user=self.request.user, submitted_at=submitted_at_val)


class ReportDetailUpdateView(generics.RetrieveUpdateDestroyAPIView):
    """
    Handles granular inspection parameters, update requests, and system removals.
    Implements security boundaries to prevent modifications across user accounts.
    """
    serializer_class = WeeklyReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "MANAGER":
            return WeeklyReport.objects.all()
        return WeeklyReport.objects.filter(user=user)

    def perform_update(self, serializer):
        report = self.get_object()
        
        # Regular users are restricted from editing another member's logs
        if self.request.user.role != "MANAGER" and report.user != self.request.user:
            raise PermissionDenied("Access Denied. You cannot modify records belonging to other users.")
            
        serializer.save()