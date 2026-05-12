import json
import re

from django.conf import settings
from google import genai
from google.genai import types

from .services import GeminiServiceError, generate_with_fallback


def _extract_json(raw_text):
    match = re.search(r'\{.*\}', raw_text, re.DOTALL)
    if not match:
        raise ValueError("No JSON object returned by Gemini.")
    return json.loads(match.group())


def normalize_competitor(competitor):
    strengths = competitor.get("strengths") or []
    weaknesses = competitor.get("weaknesses") or []
    return {
        **competitor,
        "positioning": competitor.get("positioning") or competitor.get("website_or_channel") or "",
        "strength": competitor.get("strength") or (strengths[0] if strengths else ""),
        "weakness": competitor.get("weakness") or (weaknesses[0] if weaknesses else ""),
        "differentiation_strategy": (
            competitor.get("differentiation_strategy")
            or competitor.get("our_unfair_advantage")
            or ""
        ),
    }


def normalize_competitor_result(result):
    return {
        **result,
        "competitors": [normalize_competitor(item) for item in result.get("competitors", [])],
    }


def analyze_competitors(idea, sector=None):
    prompt = f"""
    Use current web-search grounding where available. Identify 3-5 real-world competitors
    in the same niche as this business idea.

    Idea JSON:
    {json.dumps(idea, ensure_ascii=False)}

    Sector: {sector or idea.get("target_market") or idea.get("name")}

    Return valid JSON only:
    {{
      "competitors": [
        {{
          "name": "real company or local competitor category",
          "website_or_channel": "website, app, marketplace, or social channel if known",
          "strengths": ["strength", "strength"],
          "weaknesses": ["weakness", "weakness"],
          "price_level": 60,
          "market_share_estimate": 25,
          "digital_presence": 70,
          "our_unfair_advantage": "specific advantage for our concept"
        }}
      ],
      "positioning_summary": "short competitive strategy"
    }}
    """

    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    models_to_try = [settings.GEMINI_MODEL, *settings.GEMINI_FALLBACK_MODELS]
    config = types.GenerateContentConfig(
        tools=[types.Tool(google_search=types.GoogleSearch())],
        response_mime_type="application/json",
    )
    last_error = None

    for model in dict.fromkeys(models_to_try):
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=config,
            )
            return normalize_competitor_result(_extract_json(response.text))
        except Exception as exc:
            last_error = exc

    try:
        config = types.GenerateContentConfig(response_mime_type="application/json")
        return normalize_competitor_result(_extract_json(generate_with_fallback(prompt, config=config)))
    except Exception as exc:
        raise GeminiServiceError(str(last_error or exc)) from exc
