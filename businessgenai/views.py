import json
import re
from pathlib import Path

from django.conf import settings
from django.core.files.storage import FileSystemStorage
from rest_framework import generics, permissions, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .chat import generate_idea_chat_response
from .competitors import analyze_competitors
from .models import BusinessIdea, Feedback, IdeaChatMessage
from .rag import RagUnavailableError, ingest_market_report, query_market_context
from .serializers import (
    BusinessIdeaSerializer,
    FeedbackSerializer,
    IdeaChatMessageSerializer,
    UserSerializer,
)
from .services import GeminiServiceError, generate_business_concept


def extract_json_object(raw_result):
    if not isinstance(raw_result, str):
        return raw_result

    json_match = re.search(r'\{.*\}', raw_result, re.DOTALL)
    if not json_match:
        raise ValueError("Format JSON non trouve dans la reponse de l'IA")
    return json.loads(json_match.group())


class GenerateIdeaView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        sector = request.data.get('sector')
        budget = request.data.get('budget')
        currency = request.data.get('currency')
        objectives = request.data.get('objectives')

        try:
            ai_raw_result = generate_business_concept({
                'sector': sector,
                'budget': budget,
                'currency': currency,
                'objectives': objectives,
                'user': request.user,
            })
        except GeminiServiceError as e:
            return Response({
                "error": "Impossible de generer une idee avec Gemini.",
                "details": str(e),
            }, status=status.HTTP_502_BAD_GATEWAY)

        try:
            ai_result = extract_json_object(ai_raw_result)

            try:
                competitor_result = analyze_competitors(ai_result, sector=sector)
                ai_result["competitors"] = competitor_result.get("competitors", ai_result.get("competitors", []))
                positioning_summary = competitor_result.get("positioning_summary")
                if positioning_summary:
                    ai_result["positioning_summary"] = positioning_summary
            except Exception as exc:
                ai_result["competitor_analysis_error"] = str(exc)

            ai_result["input_summary"] = {
                "sector": sector or "",
                "budget": budget or "",
                "currency": currency or ai_result.get("currency_base") or "USD",
                "objectives": objectives or "",
            }
            ai_result.setdefault("currency_base", currency or "USD")
            ai_result.setdefault("positioning_summary", "Positioning details were not returned by the model.")

            new_idea = BusinessIdea.objects.create(
                user=request.user,
                name=ai_result.get('name', 'Nouveau Concept'),
                slogan=ai_result.get('slogan', 'Innover pour demain'),
                description=ai_result.get('description', 'Aucune description fournie.'),
                analysis=ai_result,
                is_public=False,
            )

            return Response(BusinessIdeaSerializer(new_idea).data)

        except (json.JSONDecodeError, ValueError, KeyError, AttributeError) as e:
            return Response({
                "error": "L'IA a genere un format invalide. Veuillez reessayer.",
                "details": str(e),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
        ideas = BusinessIdea.objects.filter(user=request.user).order_by('-created_at')
        data = [{
            "id": idea.id,
            "name": idea.name,
            "slogan": idea.slogan,
            "description": idea.description,
            "analysis": idea.analysis,
            "date": idea.created_at.strftime("%Y-%m-%d"),
        } for idea in ideas]
        return Response(data)


class DiscoveryFeedView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = BusinessIdeaSerializer

    def get_queryset(self):
        return BusinessIdea.objects.all()


class MarketReportIngestView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        upload = request.FILES.get("file")
        if not upload:
            return Response({"error": "Upload a file field named 'file'."}, status=status.HTTP_400_BAD_REQUEST)

        upload_dir = Path(settings.MARKET_REPORT_UPLOAD_DIR)
        upload_dir.mkdir(parents=True, exist_ok=True)
        storage = FileSystemStorage(location=str(upload_dir))
        saved_name = storage.save(upload.name, upload)
        saved_path = upload_dir / saved_name

        try:
            result = ingest_market_report(saved_path, source_name=request.data.get("source_name") or upload.name)
        except (RagUnavailableError, ValueError, FileNotFoundError) as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(result, status=status.HTTP_201_CREATED)


class MarketReportSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        query = request.data.get("query", "")
        if not query:
            return Response({"error": "query is required"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"results": query_market_context(query)})


class IdeaFeedbackView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, idea_id):
        idea = generics.get_object_or_404(BusinessIdea, id=idea_id, user=request.user)
        serializer = FeedbackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        feedback, _ = Feedback.objects.update_or_create(
            user=request.user,
            idea=idea,
            defaults={
                "rating": serializer.validated_data["rating"],
                "comment": serializer.validated_data.get("comment", ""),
            },
        )
        return Response(FeedbackSerializer(feedback).data)


class CompetitorAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, idea_id):
        idea = generics.get_object_or_404(BusinessIdea, id=idea_id, user=request.user)
        try:
            result = analyze_competitors(idea.analysis, sector=request.data.get("sector"))
        except GeminiServiceError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        idea.analysis["competitors"] = result.get("competitors", [])
        idea.analysis["positioning_summary"] = result.get("positioning_summary")
        idea.save(update_fields=["analysis"])
        return Response(idea.analysis)


class IdeaChatView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, idea_id):
        idea = generics.get_object_or_404(BusinessIdea, id=idea_id, user=request.user)
        messages = idea.chat_messages.filter(user=request.user)
        return Response(IdeaChatMessageSerializer(messages, many=True).data)

    def post(self, request, idea_id):
        idea = generics.get_object_or_404(BusinessIdea, id=idea_id, user=request.user)
        message = request.data.get("message")
        if not message:
            return Response({"error": "message is required"}, status=status.HTTP_400_BAD_REQUEST)

        previous_messages = list(idea.chat_messages.filter(user=request.user))
        user_message = IdeaChatMessage.objects.create(
            user=request.user,
            idea=idea,
            role="user",
            content=message,
        )

        try:
            answer = generate_idea_chat_response(idea, previous_messages, message)
        except GeminiServiceError as exc:
            user_message.delete()
            return Response({"error": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        assistant_message = IdeaChatMessage.objects.create(
            user=request.user,
            idea=idea,
            role="assistant",
            content=answer,
        )
        return Response({
            "user": IdeaChatMessageSerializer(user_message).data,
            "assistant": IdeaChatMessageSerializer(assistant_message).data,
        })
