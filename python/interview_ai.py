import sys
import json

def generate_interview_questions(target_role, count=3):
    return [
        {
            "id": f"py_q_1",
            "question": f"How do your technical projects prepare you for a {target_role} role?",
            "difficulty": "Easy",
            "focus": "Role Fit"
        },
        {
            "id": f"py_q_2",
            "question": "Describe how you optimize frontend performance and handle state management.",
            "difficulty": "Medium",
            "focus": "Technical Architecture"
        },
        {
            "id": f"py_q_3",
            "question": "How do you handle challenging API integration edge cases?",
            "difficulty": "Hard",
            "focus": "Problem Solving"
        }
    ][:count]

if __name__ == "__main__":
    try:
        raw_input = sys.stdin.read()
        payload = json.loads(raw_input) if raw_input else {}
        role = payload.get("target_role", "Software Engineer")
        count = payload.get("count", 3)
        questions = generate_interview_questions(role, count)
        print(json.dumps({"success": True, "questions": questions}))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
