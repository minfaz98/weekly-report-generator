from rest_framework import serializers
from django.utils import timezone
from .models import WeeklyReport
from accounts.serializers import UserSerializer

class WeeklyReportSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source="user", read_only=True)
    project_name = serializers.CharField(source="project.name", read_only=True)

    class Meta:
        model = WeeklyReport
        fields = [
            "id",
            "user",
            "user_details",
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
        read_only_fields = ["user", "submitted_at", "created_at", "updated_at"]

    def validate(self, attrs):
        # Fallback check for instances where values are modified in segments
        week_start = attrs.get("week_start", self.instance.week_start if self.instance else None)
        week_end = attrs.get("week_end", self.instance.week_end if self.instance else None)

        if week_start and week_end and week_end < week_start:
            raise serializers.ValidationError(
                {"week_end": "The week ending date cannot occur prior to the week starting anchor date."}
            )
        return attrs

    def update(self, instance, validated_data):
        # Catch state transfers to drop a permanent submission date timestamp
        old_status = instance.status
        new_status = validated_data.get("status", old_status)

        if old_status == "DRAFT" and new_status == "SUBMITTED":
            instance.submitted_at = timezone.now()

        return super().update(instance, validated_data)