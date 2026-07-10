from django.utils import timezone
from rest_framework import serializers
from .models import WeeklyReport


class WeeklyReportSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(
        source="user.username",
        read_only=True
    )
    project_name = serializers.CharField(
        source="project.name",
        read_only=True
    )

    class Meta:
        model = WeeklyReport
        fields = [
            "id",
            "user",
            "user_name",
            "project",
            "project_name",
            "week_start",
            "week_end",
            "tasks_completed",
            "tasks_planned",
            "blockers",
            "hours_worked",
            "notes",
            "status",
            "submitted_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = (
            "user",
            "submitted_at",
            "created_at",
            "updated_at",
        )

    def validate(self, attrs):
        week_start = attrs.get("week_start", getattr(self.instance, "week_start", None))
        week_end = attrs.get("week_end", getattr(self.instance, "week_end", None))

        if week_start and week_end and week_end < week_start:
            raise serializers.ValidationError(
                {"week_end": "Week end date cannot be before week start."}
            )
        return attrs

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        
        # Automatically set timestamp if created with SUBMITTED status
        if validated_data.get("status") == WeeklyReport.Status.SUBMITTED:
            validated_data["submitted_at"] = timezone.now()
            
        return super().create(validated_data)

    def update(self, instance, validated_data):
        new_status = validated_data.get("status", instance.status)
        
        # Automatically set timestamp on transition to SUBMITTED
        if instance.status != WeeklyReport.Status.SUBMITTED and new_status == WeeklyReport.Status.SUBMITTED:
            instance.submitted_at = timezone.now()
        # Clear timestamp if reverted to DRAFT
        elif instance.status == WeeklyReport.Status.SUBMITTED and new_status == WeeklyReport.Status.DRAFT:
            instance.submitted_at = None

        return super().update(instance, validated_data)