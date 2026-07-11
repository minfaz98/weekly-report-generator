from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    
    # Core Application Endpoints Matrix
    path("api/auth/", include("accounts.urls")),          # E.g., /api/auth/login/
    path("api/projects/", include("projects.urls")),      # E.g., /api/projects/ (GET/POST/DELETE)
    path("api/reports/", include("reports.urls")),        # E.g., /api/reports/
    
    # Asynchronous Decoupled AI Operations Gateway
    path("api/chat/", include("chat.urls")),              # E.g., /api/chat/ai-insights/
]