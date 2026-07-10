from rest_framework import generics, permissions
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    # Explicitly enforce authorization requirements to prevent accidental exposure
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user