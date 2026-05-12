from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    CompetitorAnalysisView,
    DiscoveryFeedView,
    GenerateIdeaView,
    IdeaChatView,
    IdeaFeedbackView,
    MarketReportIngestView,
    MarketReportSearchView,
    RegisterView,
    UserHistoryView,
)

urlpatterns = [
    # Auth Endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Logic Endpoints
    path('ideas/generate/', GenerateIdeaView.as_view(), name='generate-idea'),
    path('ideas/history/', UserHistoryView.as_view(), name='user-history'),
    path('ideas/public/', DiscoveryFeedView.as_view(), name='public-feed'),
    path('ideas/<int:idea_id>/feedback/', IdeaFeedbackView.as_view(), name='idea-feedback'),
    path('ideas/<int:idea_id>/competitors/', CompetitorAnalysisView.as_view(), name='idea-competitors'),
    path('ideas/<int:idea_id>/chat/', IdeaChatView.as_view(), name='idea-chat'),
    path('market-reports/ingest/', MarketReportIngestView.as_view(), name='market-report-ingest'),
    path('market-reports/search/', MarketReportSearchView.as_view(), name='market-report-search'),
]
