from rest_framework import serializers
from .models import User, BusinessIdea

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
            skills=validated_data.get('skills', [])
        )
        return user

class BusinessIdeaSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessIdea
        fields = '__all__'