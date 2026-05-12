from rest_framework import serializers

from .models import BusinessIdea, Feedback, IdeaChatMessage, User


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'bio', 'skills')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            bio=validated_data.get('bio', ''),
            skills=validated_data.get('skills', []),
        )
        return user


class BusinessIdeaSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessIdea
        fields = ['id', 'name', 'slogan', 'description', 'analysis', 'is_public', 'created_at']


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['id', 'idea', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'idea', 'created_at']


class IdeaChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = IdeaChatMessage
        fields = ['id', 'idea', 'role', 'content', 'created_at']
        read_only_fields = ['id', 'idea', 'role', 'created_at']
