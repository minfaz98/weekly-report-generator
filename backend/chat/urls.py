from django.urls import path
from .views import AIInsightsView

urlpatterns = [
    path("ai_insights/", AIInsightsView.as_view(), name="ai_insights"),
]