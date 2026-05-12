import json

from .services import generate_with_fallback


def generate_idea_chat_response(idea, previous_messages, user_message):
    context = {
        "name": idea.name,
        "slogan": idea.slogan,
        "description": idea.description,
        "analysis": idea.analysis,
    }
    history = [
        {"role": message.role, "content": message.content}
        for message in previous_messages
    ]

    prompt = f"""
    You are a contextual startup strategy chatbot. The user is discussing one saved
    business idea. Keep every answer grounded in this idea and help refine it.

    Business idea context:
    {json.dumps(context, ensure_ascii=False)}

    Conversation so far:
    {json.dumps(history[-12:], ensure_ascii=False)}

    New user message:
    {user_message}

    Answer with practical, concise advice. If the user asks for changes, propose
    concrete updates to the business model, financials, positioning, or next steps.
    """

    return generate_with_fallback(prompt)
