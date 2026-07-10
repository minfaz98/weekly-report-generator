from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, AIInsightsView

router = DefaultRouter()
router.register(r"", ProjectViewSet, basename="projects")

urlpatterns = [
    # 🌟 Register the standalone endpoint route explicitly ahead of the router collection
    path("ai_insights/", AIInsightsView.as_view(), name="project-ai-insights"),
    path("", include(router.urls)),
]