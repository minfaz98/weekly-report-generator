import os
from dotenv import load_dotenv
from google import genai
from django.db.models import Prefetch
from rest_framework import filters, viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from reports.models import WeeklyReport
from .models import Project
from .permissions import IsManagerOrAdmin
from .serializers import ProjectSerializer

# 1. Load active .env parameters from your backend root directory automatically
load_dotenv()

# 2. Initialize the Gemini API Client Engine
# The Google Gen AI SDK automatically hooks into os.environ["GEMINI_API_KEY"]
gemini_client = genai.Client()


class ProjectViewSet(viewsets.ModelViewSet):
    """
    Project Management & Operational AI Analytics ViewSet API

    Team Members:
        - View assigned active project directories only.
    Managers / Administrators:
        - Full CRUD privileges over project configuration mappings.
        - Executively restricted access to the cross-team AI Analysis Engine.
    """
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
        Restricted to Managers / Administrators for secure data governance.
        """
        user = request.user

        # 🛑 Role-Based Access Control Guardrail
        if not user.is_superuser and getattr(user, "role", None) != "MANAGER":
            return Response(
                {"error": "Access Denied. AI Operational insights are strictly restricted to management accounts."},
                status=status.HTTP_403_FORBIDDEN
            )

        manager_prompt = request.data.get("prompt", "").strip()
        if not manager_prompt:
            return Response(
                {"error": "Please provide a valid query prompt context for analysis."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 🗃️ 1. Context Collection Layer
        # Gather recent submitted operational documents to feed into the prompt engine window
        active_reports = WeeklyReport.objects.select_related("user", "project").filter(
            status=WeeklyReport.Status.SUBMITTED
        ).order_by("-week_start")[:40]

        # 🔒 2. Data Privacy & Anonymization Layer
        # We strip sensitive personal credentials (like hashes or emails) out of transmission entirely.
        context_lines = []
        for r in active_reports:
            context_lines.append(
                f"Team Member: {r.user.username} | Project Title: {r.project.name} | "
                f"Week Beginning: {r.week_start} | Completed Tasks: {r.tasks_completed} | "
                f"Reported Blockers: {r.blockers or 'None'} | Logged Work Hours: {r.hours_worked or 'N/A'}"
            )
        db_context = "\n".join(context_lines)

        # 🤖 3. System Instructions & Prompt Strategy Context
        system_instruction = (
            "You are an elite operational AI management intelligence co-pilot. Your task is to analyze the "
            "provided real-time team report records and respond to the manager's inquiry accurately. "
            "Focus heavily on identifying recurring blocking points across the workforce, cross-team workload "
            "distribution imbalances, and highlighting critical progress milestones. Keep insights completely "
            "objective, clear, actionable, and structured using clean Markdown headers.\n\n"
            f"### Real-time Team Activity Context Data:\n{db_context}"
        )

        # 🔑 4. Verify Gemini Key Environment Variables
        if not os.getenv("GEMINI_API_KEY"):
            return Response(
                {
                    "insights": "### 🤖 AI Assistant Pipeline Offline\n\n"
                                "Your local RAG compilation database context window built successfully! "
                                "To enable live generative analysis with Gemini, please write your valid "
                                "`GEMINI_API_KEY` into your `backend/.env` configuration file.\n\n"
                                "**Extracted Context Parameters:**\n"
                                f"- Active records pulled from DB: `{len(context_lines)}` verified reports.\n"
                                f"- Received prompt text: *\"{manager_prompt}\"*"
                },
                status=status.HTTP_200_OK
            )

        # 🚀 5. Execute High-Performance Content Generation using gemini-2.5-flash
        try:
            interaction = gemini_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=manager_prompt,
                config={"system_instruction": system_instruction}
            )

            return Response({"insights": interaction.text}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"AI Engine Exception Exception: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )