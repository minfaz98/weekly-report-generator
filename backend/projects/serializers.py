from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Project

User = get_user_model()


class AssignedMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]


class ProjectSerializer(serializers.ModelSerializer):
    assigned_members = AssignedMemberSerializer(
        many=True,
        read_only=True,
    )

    assigned_member_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role="TEAM_MEMBER"),
        many=True,
        write_only=True,
        required=False,
        source="assigned_members",
    )

    total_members = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "description",
            "is_active",
            "assigned_members",
            "assigned_member_ids",
            "total_members",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_total_members(self, obj):
        return obj.assigned_members.count()

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError(
                "Project name must contain at least 3 characters."
            )
        return value

    def create(self, validated_data):
        assigned_members = validated_data.pop("assigned_members", [])
        project = Project.objects.create(**validated_data)
        project.assigned_members.set(assigned_members)
        return project

    def update(self, instance, validated_data):
        assigned_members = validated_data.pop("assigned_members", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if assigned_members is not None:
            instance.assigned_members.set(assigned_members)
        return instance