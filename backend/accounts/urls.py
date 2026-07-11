from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .token_views import CustomTokenObtainPairView
from .views import (
    RegisterView, 
    ProfileView, 
    ManagementUserDirectoryView,
    ManagementUserDetailView,          # 🌟 Added missing import link
    ManagementPasswordOverrideView     # 🌟 Added missing import link
)

urlpatterns = [
    # Core Authentication Routes
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("profile/", ProfileView.as_view(), name="profile"),
    
    # 🛑 Workforce Extraction & Directory Management
    path("users/", ManagementUserDirectoryView.as_view(), name="user-directory"),
    path("users/<int:id>/", ManagementUserDetailView.as_view(), name="management-user-detail"),
    path("users/<int:id>/override-password/", ManagementPasswordOverrideView.as_view(), name="management-password-override"),
]