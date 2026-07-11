import os
from dotenv import load_dotenv
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from reports.models import WeeklyReport

# Using standard OpenAI SDK client mapping for Groq
from openai import OpenAI

load_dotenv()

class AIInsightsView(APIView):
    """
    Independent API View dedicated solely to the Groq RAG Intelligence pipeline.
    Utilizes active production reasoning models for real-time operational metrics.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user

        # 🛑 Strict Role-Based Access Control (RBAC) Guardrail
        if not user.is_superuser and getattr(user, "role", None) != "MANAGER":
            raise PermissionDenied("Access Denied. AI Operational insights are strictly restricted to management accounts.")

        raw_prompt = request.data.get("prompt", "")
        manager_prompt = str(raw_prompt).strip() if raw_prompt else ""
        
        if not manager_prompt:
            return Response(
                {"error": "Please provide a valid query prompt context for analysis."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Context Collection Layer (Safely bounded to 25 reports to manage content payload)
        try:
            reports_queryset = WeeklyReport.objects.select_related("user", "project").filter(
                status="SUBMITTED"
            ).order_by("-week_start")[:25]
            active_reports = list(reports_queryset)
        except Exception as e:
            return Response(
                {"error": f"Database Ingestion Layer Mismatch: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Context Ingestion Normalization
        context_lines = []
        for r in active_reports:
            project_title = r.project.name if getattr(r, "project", None) else "General Bench Assignment"
            username_string = r.user.username if getattr(r, "user", None) else "Anonymous Collaborator"
            
            tasks = getattr(r, "tasks_completed", "N/A")
            blocker_info = getattr(r, "blockers", "None") or "None"
            hours = getattr(r, "hours_worked", "N/A")
            w_start = getattr(r, "week_start", "N/A")
            
            context_lines.append(
                f"Team Member: {username_string} | Project Title: {project_title} | "
                f"Week Beginning: {w_start} | Completed Tasks: {tasks} | "
                f"Reported Blockers: {blocker_info} | Logged Work Hours: {hours}"
            )
        
        db_context = "\n".join(context_lines) if context_lines else "No active team reports have been submitted for this cycle yet."

        # 3. System Instruction Strategy
      #  3. Strict Structural Layout Directives
        system_instruction = (
            "You are an elite operational AI management intelligence co-pilot. Your task is to analyze the "
            "provided real-time team report records and respond to the manager's inquiry accurately.\n\n"
            "CRITICAL FORMATTING RULES:\n"
            "1. Use structured markdown tables (with column headers separated by dashes and pipes like '|---|') "
            "to summarize numeric metrics, timelines, assignments, and logged hours allocations.\n"
            "2. Use bold bold tags ('**') for team member profiles, metrics numbers, or severe system errors.\n"
            "3. Organise your observations using clear hierarchical headings (###, ####) and clean bullet points.\n"
            "4. Focus heavily on identifying recurring blocker patterns across the work surface.\n"
            "5. If a table contains no values, output a clear, friendly markdown notice instead of leaving it empty.\n\n"
            f"### Real-time Team Activity Context Data:\n{db_context}"
        )

        # 4. Initialize Groq SDK Client
        groq_key = os.getenv("GROQ_API_KEY")

        if not groq_key or groq_key.strip() == "":
            return Response(
                {"error": "Groq Execution Stopped: GROQ_API_KEY environment variable context is missing."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        client = OpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=groq_key.strip()
        )

        # 🚀 5. Execute Cloud Model Processing Node using supported active hardware identifiers
        try:
            response = client.chat.completions.create(
                model="openai/gpt-oss-120b",  # 🌟 Updated to active production tier model setup
                messages=[
                    {
                        "role": "system",
                        "content": system_instruction
                    },
                    {
                        "role": "user",
                        "content": manager_prompt
                    }
                ],
                temperature=0.2,
                max_tokens=1500
            )
            
            ai_text = response.choices[0].message.content
            return Response({"insights": ai_text}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"Groq Engine Inference Request Failure: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )