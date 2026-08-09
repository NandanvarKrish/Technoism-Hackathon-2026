import sys
import json

def parse_resume_payload(payload):
    resume_text = payload.get("resume_text", "")
    filename = payload.get("filename", "resume.pdf")

    char_count = len(resume_text)
    words = [w for w in resume_text.split() if w]
    word_count = len(words)

    return {
        "success": True,
        "filename": filename,
        "char_count": char_count,
        "word_count": word_count,
        "extracted_text": resume_text
    }

if __name__ == "__main__":
    try:
        raw_input = sys.stdin.read()
        if raw_input:
            payload = json.loads(raw_input)
        else:
            payload = {}
        result = parse_resume_payload(payload)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
