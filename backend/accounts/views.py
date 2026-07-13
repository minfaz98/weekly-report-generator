from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RegisterSerializer, UserSerializer, UserUpdateSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    Handles user profile data extractions and mutations.
    Utilizes UserUpdateSerializer for safe credential configuration changes.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return UserUpdateSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user


class ManagementUserDirectoryView(generics.ListCreateAPIView):
    """
    Handles viewing and administrative addition of platform users.
    Restricted to Managerial accounts and Superusers.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def check_management_clearance(self, user):
        if not user.is_superuser and getattr(user, "role", None) != "MANAGER":
            raise PermissionDenied("Access Denied. You do not possess management clearances.")

    def get_queryset(self):
        self.check_management_clearance(self.request.user)
        return User.objects.all().order_by("username")

    def perform_create(self, serializer):
        self.check_management_clearance(self.request.user)
        serializer.save()


class ManagementUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Handles administrative detail retrieval, modification, and profile deletion.
    Restricted to Managerial accounts and Superusers.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"

    def check_management_clearance(self, user):
        if not user.is_superuser and getattr(user, "role", None) != "MANAGER":
            raise PermissionDenied("Access Denied. You do not possess management clearances.")

    def get_object(self):
        self.check_management_clearance(self.request.user)
        return super().get_object()

    def perform_destroy(self, instance):
        self.check_management_clearance(self.request.user)
        
        # 🔐 SAFETY GUARDRAIL: Prevent self-deletion loops
        if instance == self.request.user:
            raise PermissionDenied("Operational Failure: You cannot delete your own active running session account.")
            
        instance.delete()


class ManagementPasswordOverrideView(APIView):
    """
    Handles explicit manual password resets for team accounts by an administrator.
    Restricted to Managerial accounts and Superusers.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, id):
        operator = request.user
        if not operator.is_superuser and getattr(operator, "role", None) != "MANAGER":
            raise PermissionDenied("Access Denied. You do not possess management clearances.")

        try:
            target_user = User.objects.get(id=id)
        except User.DoesNotExist:
            return Response({"detail": "Target user profile not found."}, status=status.HTTP_404_NOT_FOUND)

        new_password = request.data.get("password")
        if not new_password or len(str(new_password)) < 8:
            return Response(
                {"password": ["Password must be at least 8 characters long."]},
                status=status.HTTP_400_BAD_REQUEST
            )

        target_user.set_password(new_password)
        target_user.save()
        return Response(
            {"detail": f"Password configuration for @{target_user.username} successfully modified."},
            status=status.HTTP_200_OK
        )