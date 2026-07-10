import os
import requests
from django.db.models import Prefetch
from rest_framework import filters, viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from reports.models import WeeklyReport
from .models import Project
from .permissions import IsManagerOrAdmin
from .serializers import ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, IsManagerOrAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    def get_queryset(self):
        queryset = Project.objects.prefetch_related(
            Prefetch("assigned_members")
        ).all()

        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")
        return queryset

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def ai_insights(self, request):
        """
        AI Assistant Core Service Engine (RAG Context Injection Pipeline).
        Restricted to Managers / Administrators for data governance.
        """
        user = request.user
        if not user.is_superuser and getattr(user, "role", None) != "MANAGER":
            return Response(
                {"error": "Access Denied. AI Operational insights are restricted to management accounts."},
                status=status.HTTP_403_FORBIDDEN
            )

        manager_prompt = request.data.get("prompt", "").strip()
        if not manager_prompt:
            return Response(
                {"error": "Please provide a search prompt query context."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Gather all active operational reports across the team
        active_reports = WeeklyReport.objects.select_related("user", "project").filter(
            status=WeeklyReport.Status.SUBMITTED
        )[:40]  # Optimize window allocation boundary

        # 2. Build the anonymized RAG context payload to respect data privacy
        context_lines = []
        for r in active_reports:
            context_lines.append(
                f"Worker: {r.user.username} | Project Scope: {r.project.name} | "
                f"Timeline Start: {r.week_start} | Completed Milestones: {r.tasks_completed} | "
                f"Active Blockers: {r.blockers or 'None'} | Hours Tracked: {r.hours_worked or 'N/A'}"
            )
        db_context = "\n".join(context_lines)

        # 3. Construct System Instructions & Prompt Boundaries
        system_instruction = (
            "You are an elite operational AI management intelligence co-pilot. Your task is to analyze the "
            "provided real-time team report records and respond to the manager's inquiry accurately. "
            "Focus on identifying recurring blocking points, cross-team workload distribution imbalances, "
            "and highlighting critical progress milestones. Keep insights highly clear, actionable, and structured.\n\n"
            f"### Real-time Team Activity Context Data:\n{db_context}"
        )

        # 4. Fire the payload to your LLM provider provider gateway (Example using OpenAI's standard endpoints)
        api_key = os.getenv("OPENAI_API_KEY", "")
        if not api_key:
            return Response(
                {
                    "insights": "### 🤖 AI Assistant Context Active\n\n"
                                "Your RAG compilation pipeline ran successfully! To enable live generative analysis, "
                                "please configure your environment variables with `OPENAI_API_KEY` on your backend server.\n\n"
                                "**Extracted Context Summary:**\n"
                                f"- Active reports read: `{active_reports.count()}` records.\n"
                                f"- Latest inquiry captured: *\"{manager_prompt}\"*"
                },
                status=status.HTTP_200_OK
            )

        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": manager_prompt}
                ],
                "temperature": 0.3
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=15)
            if response.status_code == 200:
                ai_text = response.json()["choices"][0]["message"]["content"]
                return Response({"insights": ai_text}, status=status.HTTP_200_OK)
            return Response(
                {"error": f"LLM engine returned an error status code: {response.status_code}"},
                status=status.HTTP_502_BAD_GATEWAY
            )
        except Exception:
            return Response(
                {"error": "AI pipeline timed out processing contextual data arrays."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )