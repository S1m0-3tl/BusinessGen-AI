import google.generativeai as genai
from django.conf import settings
import json

def generate_business_concept(user_params):
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-flash-latest')
    
    # Implementing the 'Chain-of-Thought' and 'Expert Role' from your spec
    prompt = f"""
    Role: Act as a Senior Startup Consultant.
    Context: A user wants a business idea with a budget of {user_params.get('budget')} 
    in the {user_params.get('sector')} sector.
    
    Task: 
    1. Brainstorm a niche problem and solution.
    2. Create a SWOT Analysis.
    3. Generate a full 9-block Business Model Canvas.
    
    Output: Return ONLY a JSON object with keys: name, slogan, description, swot, bmc.
    """
    
    response = model.generate_content(prompt)
    try:
        # Strip potential markdown code blocks (```json ... ```)
        clean_json = response.text.strip().replace('```json', '').replace('```', '')
        return json.loads(clean_json)
    except:
        return {"error": "AI response format was invalid. Try again."}