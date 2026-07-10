from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "password",
            # We remove "role" from the exposed fields matrix entirely to block public escalation inputs
        )

    def create(self, validated_data):
        password = validated_data.pop("password")
        
        # This guarantees that all public web signups default strictly to regular team members
        user = User(**validated_data)
        user.role = User.Role.TEAM_MEMBER
        user.set_password(password)
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "role")