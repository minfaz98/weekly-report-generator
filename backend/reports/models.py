from django.conf import settings
from django.db import models
from projects.models import Project


class WeeklyReport(models.Model):

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        SUBMITTED = "SUBMITTED", "Submitted"
        LATE = "LATE", "Late"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="weekly_reports",
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.PROTECT,
        related_name="weekly_reports",
    )

    week_start = models.DateField()
    week_end = models.DateField()

    tasks_completed = models.TextField()
    tasks_planned = models.TextField()
    blockers = models.TextField(blank=True)

    hours_worked = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        null=True,
        blank=True,
    )

    notes = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )

    submitted_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = [
            "-week_start",
            "-created_at",
        ]
        unique_together = [
            "user",
            "week_start",
            "week_end",
        ]

    def __str__(self):
        return f"{self.user.username} ({self.week_start})"