from django.contrib.auth import get_user_model
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ManagementUserDirectoryView(generics.ListAPIView):
    """
    Returns a comprehensive list of all active registered platform users.
    Protected by RBAC to ensure access is restricted to Managerial accounts and Superusers.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # Strict authorization boundary check
        if not user.is_superuser and getattr(user, "role", None) != "MANAGER":
            raise PermissionDenied("Access Denied. You do not possess management clearances.")
            
        return User.objects.all().order_by("username")