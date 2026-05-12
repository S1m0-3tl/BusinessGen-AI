# businessgenai/services.py
from google import genai
from google.genai import types
from django.conf import settings

from .rag import query_market_context


class GeminiServiceError(Exception):
    pass


def generate_with_fallback(prompt, config=None):
    if not settings.GEMINI_API_KEY:
        raise GeminiServiceError("GEMINI_API_KEY is not configured.")

    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    models_to_try = [settings.GEMINI_MODEL, *settings.GEMINI_FALLBACK_MODELS]
    last_error = None

    for model in dict.fromkeys(models_to_try):
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=config,
            )
            print(f"Reponse recue avec {model} : {response.text[:50]}...")
            return response.text
        except Exception as e:
            last_error = e
            print(f"ERREUR GEMINI avec {model} : {str(e)}")

    raise GeminiServiceError(str(last_error))


def get_highly_rated_idea_context(user, limit=3):
    if not user or not user.is_authenticated:
        return []

    from .models import BusinessIdea

    ideas = (
        BusinessIdea.objects
        .filter(user=user, feedback__rating__gte=4)
        .distinct()
        .order_by('-feedback__rating', '-created_at')[:limit]
    )

    return [
        {
            "name": idea.name,
            "slogan": idea.slogan,
            "description": idea.description,
            "analysis_summary": {
                "target_market": idea.analysis.get("target_market"),
                "revenue_model": idea.analysis.get("revenue_model"),
                "scores": idea.analysis.get("scores"),
            },
        }
        for idea in ideas
    ]


def generate_business_concept(data):
    print("--- Tentative de connexion a Gemini ---")
    user = data.get("user")
    query = f"{data.get('sector')} {data.get('budget')} 2026 market trends competitors growth"
    market_context = query_market_context(query)
    feedback_context = get_highly_rated_idea_context(user)

    try:
        prompt = f"""
        Act as a senior startup consultant. Generate a complete business blueprint as valid JSON only.

        User inputs:
        - Sector: {data.get('sector')}
        - Budget: {data.get('budget')} {data.get('currency') or ''}
        - Objectives: {data.get('objectives')}

        Retrieved 2026 market report context from RAG:
        {market_context}

        User preference context from previous highly-rated ideas:
        {feedback_context}

        Required JSON schema:
        {{
          "name": "short business name",
          "slogan": "short slogan",
          "description": "clear 2-3 sentence overview",
          "target_market": "specific target customers",
          "revenue_model": "how the business makes money",
          "currency_base": "USD",
          "startup_costs": [
            {{"category": "Equipment", "amount": 500}},
            {{"category": "Marketing", "amount": 250}}
          ],
          "financial_summary": {{
            "initial_investment": 1000,
            "break_even_month": 4,
            "projected_monthly_profit_m6": 1150,
            "gross_margin_percent": 68
          }},
          "swot": {{
            "strengths": ["item", "item", "item"],
            "weaknesses": ["item", "item", "item"],
            "opportunities": ["item", "item", "item"],
            "threats": ["item", "item", "item"]
          }},
          "bmc": {{
            "key_partners": ["item", "item"],
            "key_activities": ["item", "item"],
            "key_resources": ["item", "item"],
            "value_propositions": ["item", "item"],
            "customer_relationships": ["item", "item"],
            "channels": ["item", "item"],
            "customer_segments": ["item", "item"],
            "cost_structure": ["item", "item"],
            "revenue_streams": ["item", "item"]
          }},
          "scores": {{
            "market_potential": 75,
            "competition_level": 40,
            "startup_difficulty": 55,
            "profitability": 70,
            "scalability": 65
          }},
          "monthly_projection": [
            {{"month": "M1", "revenue": 200, "costs": 650, "profit": -450}},
            {{"month": "M2", "revenue": 400, "costs": 500, "profit": -100}},
            {{"month": "M3", "revenue": 700, "costs": 450, "profit": 250}},
            {{"month": "M4", "revenue": 1000, "costs": 450, "profit": 550}},
            {{"month": "M5", "revenue": 1300, "costs": 500, "profit": 800}},
            {{"month": "M6", "revenue": 1700, "costs": 550, "profit": 1150}}
          ],
          "competitors": [
            {{
              "name": "Local competitor name",
              "positioning": "how they compete",
              "price_level": 60,
              "market_share_estimate": 25,
              "digital_presence": 70,
              "strength": "main advantage",
              "weakness": "main weakness",
              "differentiation_strategy": "how this concept can win"
            }}
          ],
          "next_steps": ["item", "item", "item"]
        }}

        Rules:
        - Return only JSON, no markdown code block.
        - Ground assumptions in the retrieved 2026 market context when context is present.
        - If the RAG context is empty, clearly use cautious assumptions in the JSON fields.
        - Adapt tone and idea style toward the user's highly-rated previous ideas when present.
        - Use {data.get('currency') or 'USD'} as currency_base for all money values.
        - Include 3 realistic competitors in the same niche.
        - All numbers must be realistic for the provided budget.
        - Keep lists concise.
        """

        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.7,
        )
        return generate_with_fallback(prompt, config=config)
    except Exception as e:
        if isinstance(e, GeminiServiceError):
            raise
        raise GeminiServiceError(str(e)) from e
