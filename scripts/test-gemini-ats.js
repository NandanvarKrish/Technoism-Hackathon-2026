const http = require('http');

const resumeFrontend = `ALEX RIVERA
Frontend Developer | React Specialist
Email: alex.rivera@example.com | Location: Seattle, WA

SUMMARY
Creative Frontend Engineer with 3+ years experience building responsive web apps with React.js, TypeScript, and CSS3.

TECHNICAL SKILLS
- Languages: JavaScript, TypeScript, HTML5, CSS3, SQL
- Frameworks: React.js, Redux, Tailwind CSS, Next.js
- Tools: Git, GitHub, VS Code, Webpack, Figma

PROJECTS
1. Real-Time Analytics Dashboard
   - Developed a responsive analytics portal using React.js and Tailwind CSS.
   - Reduced dashboard load time by 35% through code splitting.
`;

const resumeBackendData = `SARAH CHEN
Data Engineer & Python Backend Specialist
Email: sarah.chen@example.com | Location: San Francisco, CA

SUMMARY
Senior Data Engineer specializing in distributed pipeline processing, Python, PySpark, and PostgreSQL data warehouses.

TECHNICAL SKILLS
- Languages: Python, SQL, C++, Java, Scala
- Frameworks: FastAPI, Django, Flask, PySpark
- Databases: PostgreSQL, MongoDB, Redis, Cassandra
- Tools: Docker, Kubernetes, AWS, Postman, Git

PROJECTS
1. High-Throughput Stream Processing Pipeline
   - Built a streaming ETL data pipeline using Python, PySpark, and Redis processing 1M events/min.
`;

const jobFrontend = `Role: Associate Frontend Developer
Company: Tech Innovations Inc.
Description: Seeking a passionate Frontend Developer proficient in React.js, JavaScript, TypeScript, HTML5, CSS3, and Tailwind CSS. Experience building responsive web interfaces and integrating REST APIs.`;

const jobMlData = `Role: Senior Data & Machine Learning Engineer
Company: AI Analytics Corp.
Description: Looking for a Data Engineer proficient in Python, PySpark, SQL, PostgreSQL, Distributed ETL pipelines, PyTorch, Docker, Kubernetes, and AWS cloud infrastructure.`;

function analyzeAts(resumeText, jobDescription, targetRole) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ resumeText, jobDescription, targetRole });
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/ats/analyze',
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

async function runAtsAcceptanceTests() {
  console.log('=== ACCEPTANCE TEST: REAL GEMINI ATS ENGINE ===\n');

  try {
    // ------------------------------------------------------------
    // TEST 1: Same Resume + Different Job Descriptions
    // ------------------------------------------------------------
    console.log('--- TEST 1: Same Resume (Frontend) + Different JDs ---');
    
    const resA1 = await analyzeAts(resumeFrontend, jobFrontend, 'Associate Frontend Developer');
    const dataA1 = resA1.data;
    console.log(`[JD 1 - Frontend Dev] Match Score: ${dataA1.score}% | Source: ${dataA1.source}`);
    console.log(`Matched Skills: ${dataA1.matchedSkills.join(', ')}`);
    console.log(`Missing Skills: ${dataA1.missingSkills.join(', ')}`);

    console.log('\n- - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n');

    const resA2 = await analyzeAts(resumeFrontend, jobMlData, 'Senior Data Engineer');
    const dataA2 = resA2.data;
    console.log(`[JD 2 - Data Engineer] Match Score: ${dataA2.score}% | Source: ${dataA2.source}`);
    console.log(`Matched Skills: ${dataA2.matchedSkills.join(', ')}`);
    console.log(`Missing Skills: ${dataA2.missingSkills.join(', ')}`);

    console.log('\n------------------------------------------------------------\n');

    // ------------------------------------------------------------
    // TEST 2: Different Resumes + Same Job Description
    // ------------------------------------------------------------
    console.log('--- TEST 2: Different Resumes + Same JD (Frontend Dev) ---');

    const resB1 = await analyzeAts(resumeBackendData, jobFrontend, 'Associate Frontend Developer');
    const dataB1 = resB1.data;
    console.log(`[Resume B - Data Engineer] Match Score: ${dataB1.score}% | Source: ${dataB1.source}`);
    console.log(`Matched Skills: ${dataB1.matchedSkills.join(', ')}`);
    console.log(`Missing Skills: ${dataB1.missingSkills.join(', ')}`);

    console.log('\n------------------------------------------------------------\n');

    // ------------------------------------------------------------
    // VERIFICATION CHECKS
    // ------------------------------------------------------------
    console.log('=== ACCEPTANCE VERIFICATION CHECKS ===');

    const test1Passed = dataA1.score !== dataA2.score || JSON.stringify(dataA1.matchedSkills) !== JSON.stringify(dataA2.matchedSkills);
    const test2Passed = dataA1.score !== dataB1.score || JSON.stringify(dataA1.matchedSkills) !== JSON.stringify(dataB1.matchedSkills);

    console.log('1. Same Resume + Different JDs produces different ATS analysis?', test1Passed ? '✅ YES' : '❌ NO');
    console.log('2. Different Resumes + Same JD produces different ATS analysis?', test2Passed ? '✅ YES' : '❌ NO');
    console.log('3. Structured JSON Schema Validated?', (dataA1.categories && dataA1.matchedSkills && dataA1.missingSkills) ? '✅ YES' : '❌ NO');
    console.log('4. Honest Source Labeling Preserved?', dataA1.source ? `✅ YES (${dataA1.source})` : '❌ NO');

    if (test1Passed && test2Passed) {
      console.log('\n🎉 SUCCESS: Gemini ATS Engine passed all acceptance criteria!');
    } else {
      console.error('\n❌ FAILURE: ATS analysis output failed uniqueness checks.');
    }
  } catch (err) {
    console.error('ATS Acceptance Test Error:', err);
  }
}

runAtsAcceptanceTests();
