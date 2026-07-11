import os
import requests
from dotenv import load_dotenv
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from reports.models import WeeklyReport

# Load active .env parameters automatically
load_dotenv()


class AIInsightsView(APIView):
    """
    Independent API View dedicated solely to the Gemini RAG Intelligence pipeline.
    Bypasses standard ViewSet Model serialization constraints completely.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user

        # 🛑 Strict Role-Based Access Control (RBAC) Guardrail
        if not user.is_superuser and getattr(user, "role", None) != "MANAGER":
            return Response(
                {"error": "Access Denied. AI Operational insights are strictly restricted to management accounts."},
                status=status.HTTP_403_FORBIDDEN
            )

        raw_prompt = request.data.get("prompt", "")
        manager_prompt = str(raw_prompt).strip() if raw_prompt else ""
        
        if not manager_prompt:
            return Response(
                {"error": "Please provide a valid query prompt context for analysis."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 🗃️ 1. Context Collection Layer
        try:
            reports_queryset = WeeklyReport.objects.select_related("user", "project").filter(
                status="SUBMITTED"
            ).order_by("-week_start")[:40]
            active_reports = list(reports_queryset)
        except Exception as e:
            return Response(
                {"error": f"Database Ingestion Layer Mismatch: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 🔒 2. Data Privacy & Null-Safety Layer
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

        # 🤖 3. System Instructions Context Formulation
        system_instruction = (
            "You are an elite operational AI management intelligence co-pilot. Your task is to analyze the "
            "provided real-time team report records and respond to the manager's inquiry accurately. "
            "Focus heavily on identifying recurring blocking points across the workforce.\n\n"
            f"### Real-time Team Activity Context Data:\n{db_context}"
        )

        # 🔑 4. Verify Gemini Key Environment Variables
        api_key = os.getenv("GEMINI_API_KEY")
        
        # 🌟 MANUAL KEY OVERRIDE SLOT: Fallback key if .env reading drops out
        BACKUP_GEMINI_KEY = "AIzaSyCICF2Ml0glPWthRAnRLkl1uv6maeGmfV8"  
        active_key = api_key if (api_key and api_key.strip() != "") else BACKUP_GEMINI_KEY

        if not active_key or active_key.strip() == "":
            return Response(
                {"error": "Gemini Execution Stopped: API key string context is completely missing."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 🚀 5. Direct High-Performance REST Network Extraction Engine
        try:
            clean_key = active_key.strip()
            url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
            
            headers = {
                "Content-Type": "application/json",
                "x-goog-api-key": clean_key
            }
            
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": f"System Guidelines: {system_instruction}"},
                            {"text": f"Manager Request Input: {manager_prompt}"}
                        ]
                    }
                ]
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response_data = response.json()
            
            if response.status_code != 200:
                error_msg = response_data.get("error", {}).get("message", "Unknown API error payload.")
                return Response(
                    {"error": f"Google Wire Server Rejection ({response.status_code}): {error_msg}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            ai_text = response_data["candidates"][0]["content"]["parts"][0]["text"]
            return Response({"insights": ai_text}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"Live Network Request Execution Failure: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )