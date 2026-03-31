from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import generate_business_concept
from .serializers import BusinessIdeaSerializer

from rest_framework.permissions import IsAuthenticated
from .models import BusinessIdea

class GenerateIdeaView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        sector = request.data.get('sector')
        budget = request.data.get('budget')
        
        # 1. Get the result from Gemini
        ai_result = generate_business_concept({'sector': sector, 'budget': budget})
        
        # 2. SAVE IT permanently for this user
        BusinessIdea.objects.create(
            user=request.user,
            name=ai_result['name'],
            slogan=ai_result['slogan'],
            description=ai_result['description'],
            full_analysis=ai_result # This stores the whole JSON object
        )
        
        return Response(ai_result)
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserSerializer # We will create this next

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            if user:
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class UserHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch ideas only for the current user, newest first
        ideas = BusinessIdea.objects.filter(user=request.user).order_by('-created_at')
        
        # Simple data return (or use a Serializer)
        data = [{
            "id": i.id,
            "name": i.name,
            "slogan": i.slogan,
            "description": i.description,
            "analysis": i.full_analysis,
            "date": i.created_at.strftime("%Y-%m-%d")
        } for i in ideas]
        
        return Response(data)