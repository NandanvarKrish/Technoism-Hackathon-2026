import sys
import json
import os
from dotenv import load_dotenv

load_dotenv()

def get_gemini_api_key():
    return os.getenv("GEMINI_API_KEY", "").strip()

def generate_ai_content(prompt, system_instruction=None, json_mode=True):
    """
    Invokes Gemini API securely from Python backend.
    Falls back gracefully if key is unconfigured or call fails.
    """
    api_key = get_gemini_api_key()
    
    if not api_key or api_key == "your_gemini_api_key_here":
        return {
            "success": False,
            "fallback": True,
            "message": "Gemini API key is unconfigured or using placeholder. Returning deterministic fallback."
        }

    try:
        # Attempting google.genai or google.generativeai call
        try:
            from google import genai
            from google.genai import types
            
            client = genai.Client(api_key=api_key)
            config = {}
            if json_mode:
                config["response_mime_type"] = "application/json"
            if system_instruction:
                config["system_instruction"] = system_instruction

            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(**config) if config else None
            )
            text_out = response.text
            if json_mode:
                return {
                    "success": True,
                    "fallback": False,
                    "data": json.loads(text_out)
                }
            return {
                "success": True,
                "fallback": False,
                "text": text_out
            }
        except ImportError:
            # Fallback to urllib / requests if google.genai is missing
            import urllib.request
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
            headers = {'Content-Type': 'application/json'}
            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }
            if json_mode:
                payload["generationConfig"] = {"responseMimeType": "application/json"}
            
            req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                result_json = json.loads(resp.read().decode('utf-8'))
                raw_text = result_json['candidates'][0]['content']['parts'][0]['text']
                if json_mode:
                    return {
                        "success": True,
                        "fallback": False,
                        "data": json.loads(raw_text)
                    }
                return {
                    "success": True,
                    "fallback": False,
                    "text": raw_text
                }
    except Exception as e:
        return {
            "success": False,
            "fallback": True,
            "error": str(e),
            "message": f"Gemini API call failed: {str(e)}"
        }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        try:
            input_json = json.loads(sys.argv[1])
            prompt = input_json.get("prompt", "Hello Gemini")
            res = generate_ai_content(prompt)
        except Exception as err:
            res = {"success": False, "error": str(err)}
    else:
        res = {
            "success": True,
            "status": "AI Engine module loaded.",
            "api_key_configured": bool(get_gemini_api_key() and get_gemini_api_key() != "your_gemini_api_key_here")
        }
    print(json.dumps(res, indent=2))
