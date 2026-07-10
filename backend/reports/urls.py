from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WeeklyReportViewSet

router = DefaultRouter()
router.register(r'', WeeklyReportViewSet, basename='weekly-report')

urlpatterns = [
    path('', include(router.urls)),
]