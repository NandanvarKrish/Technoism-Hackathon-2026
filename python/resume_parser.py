import sys
import json
import re

# Comprehensive Technical Taxonomies for Categorization
PROGRAMMING_LANGUAGES = [
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "C", "Ruby", "Go", "Golang",
    "Rust", "PHP", "SQL", "HTML5", "HTML", "CSS3", "CSS", "Kotlin", "Swift", "R", "Scala", "Dart"
]

FRAMEWORKS = [
    "React.js", "React", "Vue.js", "Vue", "Angular", "Next.js", "Node.js", "Express.js", "Express",
    "Django", "Flask", "FastAPI", "Spring Boot", "Laravel", "Tailwind CSS", "Tailwind", "Bootstrap",
    "Redux", "jQuery", "Svelte"
]

DATABASES = [
    "PostgreSQL", "Postgres", "MongoDB", "MySQL", "Redis", "SQLite", "Supabase", "Firebase",
    "Oracle", "Cassandra", "DynamoDB", "MariaDB"
]

TOOLS = [
    "Git", "GitHub", "GitLab", "Docker", "Kubernetes", "VS Code", "Postman", "AWS", "Azure",
    "GCP", "Jira", "Figma", "Webpack", "Vite", "npm", "Linux", "Bash", "Agile", "Scrum"
]

def extract_name(text_lines):
    for line in text_lines[:5]:
        clean = line.strip()
        if not clean:
            continue
        if any(h in clean.upper() for h in ["RESUME", "CURRICULUM", "VITAE", "PAGE", "EMAIL", "PHONE", "HTTP"]):
            continue
        if re.search(r'[\w\.-]+@[\w\.-]+', clean):
            continue
        if len(clean.split()) <= 4 and re.match(r'^[A-Za-z\s\.-]+$', clean):
            return clean
    return "Candidate Name"

def extract_email(text):
    match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    return match.group(0) if match else ""

def extract_phone(text):
    match = re.search(r'(\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}', text)
    return match.group(0) if match else ""

def extract_categorized_skills(text):
    text_lower = text.lower()
    
    found_langs = []
    for lang in PROGRAMMING_LANGUAGES:
        pattern = r'\b' + re.escape(lang.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found_langs.append(lang)

    found_frameworks = []
    for fw in FRAMEWORKS:
        pattern = r'\b' + re.escape(fw.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found_frameworks.append(fw)

    found_dbs = []
    for db in DATABASES:
        pattern = r'\b' + re.escape(db.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found_dbs.append(db)

    found_tools = []
    for t in TOOLS:
        pattern = r'\b' + re.escape(t.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found_tools.append(t)

    all_skills = list(dict.fromkeys(found_langs + found_frameworks + found_dbs + found_tools))

    return {
        "skills": all_skills,
        "programmingLanguages": found_langs,
        "frameworks": found_frameworks,
        "databases": found_dbs,
        "tools": found_tools
    }

def extract_sections(text):
    sections = {}
    current_section = "GENERAL"
    sections[current_section] = []

    header_keywords = [
        "EDUCATION", "TECHNICAL SKILLS", "SKILLS", "EXPERIENCE", "WORK EXPERIENCE",
        "PROJECTS", "INTERNSHIPS", "CERTIFICATIONS", "ACHIEVEMENTS", "SUMMARY", "PROFILE"
    ]

    lines = text.split("\n")
    for line in lines:
        strip_line = line.strip()
        if not strip_line:
            continue
        
        is_header = False
        upper_line = strip_line.upper()
        for kw in header_keywords:
            if upper_line == kw or upper_line.startswith(kw + ":") or upper_line.startswith(kw + " "):
                if len(strip_line) < 35:
                    current_section = kw
                    sections[current_section] = []
                    is_header = True
                    break
        
        if not is_header:
            sections[current_section].append(strip_line)

    return sections

def extract_education(edu_lines):
    edu_list = []
    edu_text = " ".join(edu_lines)
    
    degree_match = re.search(r'(B\.Tech|Bachelor|M\.Tech|Master|B\.S\.|M\.S\.|Diploma|Degree)[^\n,]*', edu_text, re.IGNORECASE)
    inst_match = re.search(r'(College|University|Institute|School)[^\n,]*', edu_text, re.IGNORECASE)
    year_match = re.search(r'(20\d{2}\s*[\u2013-]\s*20\d{2}|20\d{2})', edu_text)
    gpa_match = re.search(r'(CGPA|GPA|Marks)?\s*:?\s*(\d\.\d+|\d{2}%)\s*(/\s*10\.0)?', edu_text, re.IGNORECASE)

    if degree_match or inst_match:
        edu_list.append({
            "degree": degree_match.group(0).strip() if degree_match else "Bachelor's Degree",
            "institution": inst_match.group(0).strip() if inst_match else "University / Institution",
            "year": year_match.group(0).strip() if year_match else "",
            "gpa": gpa_match.group(0).strip() if gpa_match else ""
        })

    return edu_list

def extract_projects(project_lines):
    projects = []
    current_proj = None

    for line in project_lines:
        if re.match(r'^\d+[\.\)]\s*', line) or re.match(r'^[A-Z][A-Za-z0-9\s-]{3,30}:', line):
            if current_proj:
                projects.append(current_proj)
            name_part = re.sub(r'^\d+[\.\)]\s*', '', line).strip()
            current_proj = {
                "name": name_part,
                "description": "",
                "technologies": [],
                "contribution": "",
                "measurableResults": ""
            }
        elif current_proj:
            if "%" in line or "improved" in line.lower() or "reduced" in line.lower() or "speed" in line.lower():
                current_proj["measurableResults"] += " " + line
            elif "built" in line.lower() or "developed" in line.lower() or "implemented" in line.lower() or "designed" in line.lower():
                current_proj["contribution"] += " " + line
            else:
                current_proj["description"] += " " + line

    if current_proj:
        projects.append(current_proj)

    for p in projects:
        p["description"] = p["description"].strip()
        p["contribution"] = p["contribution"].strip()
        p["measurableResults"] = p["measurableResults"].strip()
        # Find tech stack in project text
        proj_text = p["name"] + " " + p["description"] + " " + p["contribution"]
        cats = extract_categorized_skills(proj_text)
        p["technologies"] = cats["skills"][:5]

    return projects

def extract_experience(exp_lines):
    exp_list = []
    exp_text = "\n".join(exp_lines)

    for block in exp_text.split("\n\n"):
        b_lines = [l.strip() for l in block.split("\n") if l.strip()]
        if not b_lines:
            continue
        first_line = b_lines[0]
        exp_list.append({
            "title": first_line,
            "company": b_lines[1] if len(b_lines) > 1 else "",
            "duration": "",
            "responsibilities": b_lines[1:] if len(b_lines) > 1 else [first_line]
        })

    return exp_list

def extract_target_role_and_job_profile(raw_text, profile):
    lines = [l.strip() for l in raw_text.split("\n") if l.strip()]
    
    detected_title = ""
    confidence = 0.70
    evidence = []

    # Priority 1: Check headline / top 6 lines for explicit professional title
    for line in lines[:6]:
        if any(h in line.upper() for h in ["RESUME", "CURRICULUM", "EMAIL", "PHONE", "PAGE", "HTTP", "LOCATION", "SUMMARY"]):
            continue
        parts = re.split(r'[|•,]', line)
        for part in parts:
            p_clean = part.strip()
            if re.search(r'\b(Developer|Engineer|Analyst|Specialist|Architect|Scientist|Consultant|Designer|Lead)\b', p_clean, re.IGNORECASE):
                if not re.match(r'^(Student|Computer Science Student)$', p_clean, re.IGNORECASE):
                    detected_title = p_clean
                    confidence = 0.96
                    evidence.append(f"Resume headline explicitly states: '{p_clean}'")
                    break
        if detected_title:
            break

    # Priority 2: Check Summary or recent experience titles
    if not detected_title:
        exp_list = profile.get("experience", [])
        if exp_list and exp_list[0].get("title"):
            detected_title = exp_list[0]["title"]
            confidence = 0.85
            evidence.append(f"Most recent experience title: '{detected_title}'")

    # Priority 3: Skill & specialization consistency inference
    if not detected_title:
        skills_set = set([s.lower() for s in profile.get("skills", [])])
        if "react" in skills_set or "html5" in skills_set or "frontend" in skills_set:
            detected_title = "Frontend Developer"
            confidence = 0.75
            evidence.append("Inferred from frontend skills (React, HTML5, CSS3)")
        elif "pyspark" in skills_set or "pandas" in skills_set or "etl" in skills_set:
            detected_title = "Python Data Analyst"
            confidence = 0.75
            evidence.append("Inferred from data skills (Python, Pandas, SQL)")
        elif "java" in skills_set and "spring boot" in skills_set:
            detected_title = "Java Backend Developer"
            confidence = 0.75
            evidence.append("Inferred from Java & Spring Boot skills")
        else:
            detected_title = "Software Engineer"
            confidence = 0.60
            evidence.append("General software development skill set detected")

    # STRICT GROUNDING: Requirements contain ONLY technologies present in the resume
    langs = profile.get("programmingLanguages", [])
    frameworks = profile.get("frameworks", [])
    databases = profile.get("databases", [])
    tools = profile.get("tools", [])
    all_skills = profile.get("skills", [])

    tech_str = ", ".join(all_skills[:8]) if all_skills else "software development fundamentals"
    summary_desc = f"{detected_title} with experience in {tech_str}. Background in project implementation, problem solving, and version control workflows."

    job_profile = {
        "summary": summary_desc,
        "technicalRequirements": all_skills,
        "programmingLanguages": langs,
        "frameworks": frameworks,
        "databases": databases,
        "tools": tools,
        "developmentSkills": [s for s in all_skills if s not in langs and s not in frameworks and s not in databases and s not in tools],
        "softSkills": ["Problem Solving", "Teamwork", "Clean Code", "Communication"],
        "experienceRequirements": ["Hands-on project or internship experience"],
        "educationRequirements": [e.g.get("degree", "Degree in Computer Science or related field") for e.g in profile.get("education", [])] or ["Degree in Computer Science or related field"]
    }

    req_lines = [f"- {s}" for s in all_skills[:12]] if all_skills else ["- Software Engineering fundamentals"]
    formatted_desc = f"Role: {detected_title}\n\nResume-Derived Profile:\n{summary_desc}\n\nTechnical Requirements:\n" + "\n".join(req_lines)

    return {
        "targetRole": {
            "title": detected_title,
            "confidence": confidence,
            "evidence": evidence
        },
        "jobProfile": job_profile,
        "source": "resume-derived",
        "recommendedJobDescription": formatted_desc
    }

def parse_resume_to_candidate_profile(raw_text, filename="resume.pdf"):
    if not raw_text or len(raw_text.strip()) < 10:
        return {
            "success": False,
            "error": "Resume text is empty or too short."
        }

    lines = [l.strip() for l in raw_text.split("\n") if l.strip()]
    name = extract_name(lines)
    email = extract_email(raw_text)
    phone = extract_phone(raw_text)

    categorized_skills = extract_categorized_skills(raw_text)
    sections = extract_sections(raw_text)

    edu_lines = sections.get("EDUCATION", [])
    education = extract_education(edu_lines)

    proj_lines = sections.get("PROJECTS", [])
    projects = extract_projects(proj_lines)

    exp_lines = sections.get("EXPERIENCE", []) or sections.get("WORK EXPERIENCE", [])
    experience = extract_experience(exp_lines)

    intern_lines = sections.get("INTERNSHIPS", [])
    internships = extract_experience(intern_lines)

    cert_lines = sections.get("CERTIFICATIONS", [])
    certifications = [c for c in cert_lines if len(c) > 3]

    achieve_lines = sections.get("ACHIEVEMENTS", [])
    achievements = [a for a in achieve_lines if len(a) > 3]

    profile = {
        "name": name,
        "email": email,
        "phone": phone,
        "education": education,
        "skills": categorized_skills["skills"],
        "programmingLanguages": categorized_skills["programmingLanguages"],
        "frameworks": categorized_skills["frameworks"],
        "databases": categorized_skills["databases"],
        "tools": categorized_skills["tools"],
        "projects": projects,
        "experience": experience,
        "internships": internships,
        "certifications": certifications,
        "achievements": achievements
    }

    derived_data = extract_target_role_and_job_profile(raw_text, profile)
    profile["detectedRole"] = derived_data["targetRole"]["title"]
    profile["targetRoleObj"] = derived_data["targetRole"]
    profile["jobProfileObj"] = derived_data["jobProfile"]
    profile["recommendedJobDescription"] = derived_data["recommendedJobDescription"]
    profile["profileSource"] = "resume-derived"

    return {
        "success": True,
        "filename": filename,
        "profile": profile,
        "derived": derived_data,
        "extractedText": raw_text
    }

if __name__ == "__main__":
    try:
        raw_input = sys.stdin.read()
        payload = json.loads(raw_input) if raw_input else {}
        text = payload.get("resume_text", "") or payload.get("text", "")
        filename = payload.get("filename", "resume.pdf")
        
        result = parse_resume_to_candidate_profile(text, filename)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
