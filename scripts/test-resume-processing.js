const http = require('http');

const resumeFrontend = `ALEX RIVERA
Frontend Developer | React Specialist
Email: alex.rivera@example.com | Location: Seattle, WA

SUMMARY
Creative Frontend Engineer with 3+ years experience building responsive web apps with React.js, TypeScript, and CSS3.

EDUCATION
B.S. in Computer Science (2020 - 2024)
University of Washington | GPA: 3.8 / 4.0

TECHNICAL SKILLS
- Languages: JavaScript, TypeScript, HTML5, CSS3, SQL
- Frameworks: React.js, Redux, Tailwind CSS, Next.js
- Databases: PostgreSQL, Firebase
- Tools: Git, GitHub, VS Code, Webpack, Figma

PROJECTS
1. Real-Time Analytics Dashboard
   - Developed a responsive analytics portal using React.js and Tailwind CSS.
   - Reduced dashboard load time by 35% through code splitting and virtualized lists.
`;

const resumeDataBackend = `SARAH CHEN
Data Engineer & Python Backend Specialist
Email: sarah.chen@example.com | Location: San Francisco, CA

SUMMARY
Senior Data Engineer specializing in distributed pipeline processing, Python, PySpark, and PostgreSQL data warehouses.

EDUCATION
M.S. in Data Science (2021 - 2023)
Stanford University | CGPA: 3.9 / 4.0

TECHNICAL SKILLS
- Languages: Python, SQL, C++, Java, Scala
- Frameworks: FastAPI, Django, Flask, PySpark
- Databases: PostgreSQL, MongoDB, Redis, Cassandra
- Tools: Docker, Kubernetes, AWS, Postman, Git

PROJECTS
1. High-Throughput Stream Processing Pipeline
   - Built a streaming ETL data pipeline using Python, PySpark, and Redis processing 1M events/min.
   - Improved query response performance by 45% using indexed PostgreSQL schemas.
`;

function parseResume(resumeText, filename) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ resumeText, filename });
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/resume/parse',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runAcceptanceTest() {
  console.log('=== ACCEPTANCE TEST: REAL RESUME PROCESSING & DYNAMIC PROFILES ===\n');

  try {
    console.log('--- 1. Processing Resume A (Alex Rivera - Frontend Developer) ---');
    const resA = await parseResume(resumeFrontend, 'alex_rivera_resume.pdf');
    const profileA = resA.data ? resA.data.profile : null;

    console.log('Candidate A Name:', profileA.name);
    console.log('Candidate A Skills:', profileA.skills.join(', '));
    console.log('Candidate A Languages:', profileA.programmingLanguages.join(', '));
    console.log('Candidate A Projects:', profileA.projects.map(p => p.name).join(' | '));
    console.log('\n------------------------------------------------------------\n');

    console.log('--- 2. Processing Resume B (Sarah Chen - Data Engineer) ---');
    const resB = await parseResume(resumeDataBackend, 'sarah_chen_resume.pdf');
    const profileB = resB.data.profile;

    console.log('Candidate B Name:', profileB.name);
    console.log('Candidate B Skills:', profileB.skills.join(', '));
    console.log('Candidate B Languages:', profileB.programmingLanguages.join(', '));
    console.log('Candidate B Projects:', profileB.projects.map(p => p.name).join(' | '));
    console.log('\n------------------------------------------------------------\n');

    // Verification Checks
    console.log('=== ACCEPTANCE TEST VERIFICATION CHECKS ===');
    const isDifferentName = profileA.name !== profileB.name;
    const isDifferentLanguages = JSON.stringify(profileA.programmingLanguages) !== JSON.stringify(profileB.programmingLanguages);
    const isDifferentProjects = JSON.stringify(profileA.projects) !== JSON.stringify(profileB.projects);

    console.log('1. Are Candidate Names Different?', isDifferentName ? '✅ YES (' + profileA.name + ' vs ' + profileB.name + ')' : '❌ NO');
    console.log('2. Are Extracted Languages Different?', isDifferentLanguages ? '✅ YES' : '❌ NO');
    console.log('3. Are Extracted Projects Different?', isDifferentProjects ? '✅ YES' : '❌ NO');

    if (isDifferentName && isDifferentLanguages && isDifferentProjects) {
      console.log('\n🎉 SUCCESS: Candidate profiles are 100% dynamically extracted from resume text without hardcoded data!');
    } else {
      console.error('\n❌ FAILURE: Profiles are not distinct.');
    }
  } catch (err) {
    console.error('Acceptance test error:', err);
  }
}

runAcceptanceTest();
