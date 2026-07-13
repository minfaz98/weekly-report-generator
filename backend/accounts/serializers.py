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
            "first_name",
            "last_name",
            "contact_number",
        )

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.role = User.Role.TEAM_MEMBER
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id", 
            "username", 
            "email", 
            "first_name", 
            "last_name", 
            "contact_number", 
            "role"
        )
        read_only_fields = ("id", "role")


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Dedicated serializer handling standard profile fields alongside 
    an optional, secure old/new password rotation verification layout.
    """
    old_password = serializers.CharField(write_only=True, required=False)
    new_password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "contact_number",
            "role",
            "old_password",
            "new_password",
        )
        read_only_fields = ("id", "role")

    def validate(self, attrs):
        old_password = attrs.get("old_password")
        new_password = attrs.get("new_password")

        # Check password rotation pairs
        if old_password or new_password:
            if not old_password or not new_password:
                raise serializers.ValidationError(
                    {"password": "Both your old password and new password sequences are required for credential changes."}
                )
            
            # Verify match state against running session object
            if not self.instance.check_password(old_password):
                raise serializers.ValidationError(
                    {"old_password": "The current password provided is incorrect."}
                )

        return attrs

    def update(self, instance, validated_data):
        old_password = validated_data.pop("old_password", None)
        new_password = validated_data.pop("new_password", None)

        # Apply profile changes
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Apply password update if verification passed
        if new_password:
            instance.set_password(new_password)

        instance.save()
        return instance