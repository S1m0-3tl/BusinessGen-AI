from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, GenerateIdeaView , UserHistoryView

urlpatterns = [
    # Auth Endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Logic Endpoints
    path('ideas/generate/', GenerateIdeaView.as_view(), name='generate-idea'),
    path('ideas/history/', UserHistoryView.as_view(), name='user-history'),
]