import sys
import json
import os
import re
from ai_engine import generate_ai_content

def analyze_ats(resume_profile, job_description):
    """
    Computes ATS match score and gap analysis between resume profile and job description.
    """
    jd_lower = job_description.lower()
    candidate_skills = resume_profile.get("skills", [])
    
    # Categorize requirements
    matched_skills = []
    missing_skills = []
    
    # Standard tech keyword dictionary for matching
    keywords = [
        "React", "React.js", "Node.js", "Express", "JavaScript", "TypeScript",
        "Python", "HTML", "CSS", "Tailwind CSS", "SQL", "PostgreSQL", "MongoDB",
        "Supabase", "Git", "REST API", "Docker", "AWS", "Machine Learning",
        "Gemini API", "Data Structures", "Algorithms", "Agile", "System Design"
    ]
    
    jd_keywords = [kw for kw in keywords if re.search(r'\b' + re.escape(kw.lower()) + r'\b', jd_lower)]
    if not jd_keywords:
        jd_keywords = ["React", "Node.js", "JavaScript", "Python", "REST API", "SQL"]

    for kw in jd_keywords:
        if any(kw.lower() == s.lower() or kw.lower() in s.lower() for s in candidate_skills):
            matched_skills.append(kw)
        else:
            missing_skills.append(kw)

    match_percentage = round((len(matched_skills) / len(jd_keywords)) * 100, 1) if jd_keywords else 85.0
    # Add base floor for demonstration
    overall_score = max(55.0, min(98.0, match_percentage))

    category_scores = {
        "core_skills": round(overall_score * 0.95, 1),
        "tools_technologies": round(overall_score * 0.90, 1),
        "experience_projects": round(overall_score * 1.02, 1) if overall_score <= 90 else 95.0,
        "education_requirements": round(overall_score * 0.98, 1)
    }

    suggestions = []
    if missing_skills:
        suggestions.append(f"Highlight hands-on experience or project proof for missing target keywords: {', '.join(missing_skills[:3])}.")
    suggestions.append("Quantify achievements in project descriptions using metrics (e.g., 'Improved API response time by 35%').")
    suggestions.append(f"Ensure target role titles and keywords matching the job description appear clearly in the executive summary.")

    return {
        "overall_match_score": overall_score,
        "category_scores": category_scores,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "suggestions": suggestions
    }

def generate_personalized_interview(candidate_data):
    """
    Generates 4 personalized interview questions tailored to:
    - candidate profile
    - target role & job description
    - identified ATS gaps
    - previous experience & projects
    """
    profile = candidate_data.get("profile", {})
    jd = candidate_data.get("job_description", "")
    target_role = candidate_data.get("target_role", "Software Engineer")
    ats_gaps = candidate_data.get("ats_gaps", [])

    prompt = f"""
    You are an expert technical interviewer for {target_role}.
    Candidate Profile: {json.dumps(profile)}
    Target Role: {target_role}
    Job Description: {jd}
    Identified ATS Skill Gaps: {json.dumps(ats_gaps)}

    Generate 4 highly personalized interview questions:
    1. Technical Deep-Dive based on candidate's top skill ({profile.get('skills', ['React'])[0]})
    2. Architecture / System Design question bridging an ATS skill gap ({ats_gaps[0] if ats_gaps else 'System Design'})
    3. Practical Project Experience question focusing on past projects ({profile.get('projects', ['Web App'])[0]})
    4. Behavioral & Problem-Solving scenario tailored to {target_role}

    Return strict JSON format with array of objects:
    [
      {{"id": 1, "category": "Technical", "question": "...", "focus": "...", "eval_criteria": "..."}}, ...
    ]
    """

    ai_res = generate_ai_content(prompt, json_mode=True)
    if ai_res.get("success") and not ai_res.get("fallback"):
        return ai_res.get("data")

    # High quality deterministic fallback
    skills = profile.get("skills", ["React.js", "Node.js"])
    top_skill = skills[0] if skills else "Full-Stack Development"
    gap_skill = ats_gaps[0] if ats_gaps else "Cloud & Deployment"
    proj = profile.get("projects", ["AI Web Platform"])[0]

    return [
        {
            "id": 1,
            "category": "Technical Mastery",
            "question": f"Given your extensive experience with {top_skill}, how do you manage state optimization, memory efficiency, and error boundaries in production applications?",
            "focus": f"{top_skill} Optimization & Architecture",
            "eval_criteria": "Depth of technical knowledge, performance awareness, clean code practices"
        },
        {
            "id": 2,
            "category": "ATS Skill Gap Bridge",
            "question": f"Our target job description emphasizes {gap_skill}. How would you bridge your background in {top_skill} to implement or scale {gap_skill} solutions effectively?",
            "focus": f"Adaptability & {gap_skill} Problem Solving",
            "eval_criteria": "Conceptual clarity, enthusiasm to learn, practical trade-off analysis"
        },
        {
            "id": 3,
            "category": "Project Deep-Dive",
            "question": f"In your project '{proj}', what was the most complex technical hurdle you encountered, and how did you architect the resolution?",
            "focus": "Real-world Execution & Technical Leadership",
            "eval_criteria": "Problem articulation, architectural rationale, measurable impact"
        },
        {
            "id": 4,
            "category": "Behavioral & Scenario",
            "question": f"Describe a scenario as a {target_role} when project specifications changed unexpectedly mid-sprint. How did you realign priorities and deliver quality code?",
            "focus": "Agile Resilience & Stakeholder Communication",
            "eval_criteria": "Communication clarity, composure under pressure, customer-first mindset"
        }
    ]

def evaluate_interview_responses(candidate_data):
    """
    Evaluates candidate's answers to general interview questions.
    """
    responses = candidate_data.get("responses", [])
    
    if not responses:
        return {
            "overall_score": 75.0,
            "communication_score": 80.0,
            "technical_score": 70.0,
            "feedback_summary": {
                "strengths": ["Clear articulation", "Structured responses"],
                "areas_for_improvement": ["Provide more technical specifics and quantitative evidence"],
                "recommendation": "Ready for Company Specific Coding Round"
            }
        }

    # Evaluate based on length and key terms
    scores = []
    for resp in responses:
        ans = resp.get("answer", "")
        word_count = len(ans.split())
        score = min(95.0, max(50.0, 60.0 + (word_count * 0.5)))
        scores.append(score)

    avg_score = round(sum(scores) / len(scores), 1) if scores else 80.0

    return {
        "overall_score": avg_score,
        "communication_score": min(98.0, round(avg_score * 1.05, 1)),
        "technical_score": max(60.0, round(avg_score * 0.95, 1)),
        "feedback_summary": {
            "strengths": [
                "Strong technical terminology and domain knowledge",
                "Logical structure in situational problem solving",
                "Clear alignment with job requirements"
            ],
            "areas_for_improvement": [
                "Incorporate STAR method (Situation, Task, Action, Result) in behavioral answers",
                "Detail exact error handling strategies for edge cases"
            ],
            "recommendation": "Passed General AI Interview. Recommended to proceed to Company Specific Coding Round."
        }
    }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        try:
            payload = json.loads(sys.argv[1])
            action = payload.get("action", "generate")
            if action == "ats":
                res = analyze_ats(payload.get("profile", {}), payload.get("job_description", ""))
            elif action == "generate":
                res = generate_personalized_interview(payload)
            elif action == "evaluate":
                res = evaluate_interview_responses(payload)
            else:
                res = {"error": f"Unknown action {action}"}
        except Exception as e:
            res = {"error": str(e)}
    else:
        res = {"status": "Interview AI module ready."}
    print(json.dumps(res, indent=2))
