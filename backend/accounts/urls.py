from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from .token_views import CustomTokenObtainPairView

from .views import RegisterView, ProfileView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),

    path("login/",CustomTokenObtainPairView.as_view(),name="login",),

    path("refresh/", TokenRefreshView.as_view(), name="refresh"),

    path("profile/", ProfileView.as_view(), name="profile"),
]