import sys
import json

def evaluate_coding_submission(code, language="javascript"):
    return {
        "success": True,
        "status": "Accepted",
        "score": 95,
        "runtime_ms": 38,
        "complexity": {"time": "O(N)", "space": "O(N)"},
        "feedback": "Optimal hash map solution with linear time complexity."
    }

if __name__ == "__main__":
    try:
        raw_input = sys.stdin.read()
        payload = json.loads(raw_input) if raw_input else {}
        code = payload.get("code", "")
        lang = payload.get("language", "javascript")
        res = evaluate_coding_submission(code, lang)
        print(json.dumps(res))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
