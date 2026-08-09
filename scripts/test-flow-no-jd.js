const http = require('http');

const nandanResumeText = `NANDAN SHAH
Full-Stack & Frontend Developer | Computer Science Student
Email: nandan.shah@example.com | Phone: (555) 019-2834 | Location: Seattle, WA

SUMMARY
Creative Full-Stack & Frontend Engineer with 3+ years experience building responsive web apps with React.js, Node.js, Express, and SQL databases.

TECHNICAL SKILLS
- Languages: JavaScript, TypeScript, HTML5, CSS3, SQL
- Frameworks: React.js, Node.js, Express.js, Redux, Tailwind CSS
- Databases: PostgreSQL, MongoDB
- Tools: Git, GitHub, REST APIs, VS Code, Webpack

PROJECTS
1. Real-Time Analytics Dashboard
   - Developed a responsive analytics portal using React.js, Node.js, and Tailwind CSS.
   - Reduced dashboard load time by 35% through code splitting and virtualized lists.
`;

function requestApi(path, body) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api' + path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => resolve(JSON.parse(responseBody)));
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runEndToEndNoJdTest() {
  console.log('=== ACCEPTANCE TEST: REMOVE JOB DESCRIPTION STEP + RESUME-DRIVEN ATS ===\n');

  try {
    // ------------------------------------------------------------
    // STEP 1 & 2: Resume Extraction & Profile Generation
    // ------------------------------------------------------------
    console.log('--- STEP 1 & 2: Upload Resume & Extract Candidate Profile ---');
    const parseRes = await requestApi('/resume/parse', { resumeText: nandanResumeText, filename: 'nandan_resume.pdf' });
    const profile = parseRes.data.profile;

    console.log(`Extracted Candidate Name: ${profile.name}`);
    console.log(`Detected Primary Role: "${profile.detectedRole}"`);
    console.log(`Extracted Skills (${profile.skills.length}): ${profile.skills.slice(0, 8).join(', ')}`);
    console.log(`Extracted Projects: ${profile.projects.map(p => p.name).join(', ')}`);

    console.log('\n------------------------------------------------------------\n');

    // ------------------------------------------------------------
    // STEP 3: Resume-Driven ATS Analysis (NO Job Description)
    // ------------------------------------------------------------
    console.log('--- STEP 3: Resume-Driven ATS Analysis (No Job Description Required) ---');
    const atsRes = await requestApi('/ats/analyze', { resumeText: nandanResumeText, candidateProfile: profile });
    const atsData = atsRes.data;

    console.log(`AI Resume ATS Score: ${atsData.overallScore || atsData.score}%`);
    console.log(`Evaluation Source: ${atsData.source}`);
    console.log(`Readiness Categories Evaluated (${atsData.categories ? atsData.categories.length : 0}):`);
    if (atsData.categories) {
      atsData.categories.forEach(c => {
        console.log(`  - ${c.name} (${c.weight}): ${c.score}% — ${c.explanation}`);
      });
    }

    console.log('\n------------------------------------------------------------\n');

    // ------------------------------------------------------------
    // STEP 4: Personalized Mock Interview Question Generation
    // ------------------------------------------------------------
    console.log('--- STEP 4: Personalized Mock Interview Question Generation ---');
    const interviewRes = await requestApi('/interview/generate', {
      detectedRole: profile.detectedRole,
      candidateProfile: profile,
      atsResult: atsData,
      questionCount: 3
    });
    const questions = interviewRes.data.questions;

    console.log(`Generated Questions count: ${questions.length}`);
    questions.forEach((q, idx) => {
      console.log(`  Q${idx + 1} [${q.focus}]: "${q.question}"`);
    });

    console.log('\n------------------------------------------------------------\n');

    // ------------------------------------------------------------
    // VERIFICATION CHECKS
    // ------------------------------------------------------------
    console.log('=== ACCEPTANCE VERIFICATION CHECKS ===');

    const check1 = profile.name === 'NANDAN SHAH';
    const check2 = profile.detectedRole === 'Full-Stack & Frontend Developer';
    const check3 = typeof (atsData.overallScore || atsData.score) === 'number';
    const check4 = atsData.categories && atsData.categories.length >= 4;
    const check5 = questions && questions.length === 3 && questions[0].question.includes('Full-Stack & Frontend Developer');

    console.log('1. Candidate profile extracted correctly?', check1 ? '✅ YES' : '❌ NO');
    console.log('2. Primary Role detected as "Full-Stack & Frontend Developer"?', check2 ? '✅ YES' : '❌ NO');
    console.log('3. AI Resume ATS Score calculated without any Job Description input?', check3 ? '✅ YES' : '❌ NO');
    console.log('4. Category scores evaluated across readiness dimensions?', check4 ? '✅ YES' : '❌ NO');
    console.log('5. Interview questions personalized using candidate profile & detected role?', check5 ? '✅ YES' : '❌ NO');

    if (check1 && check2 && check3 && check4 && check5) {
      console.log('\n🎉 SUCCESS: All acceptance test criteria passed! Job Description step successfully eliminated!');
    } else {
      console.error('\n❌ FAILURE: Flow acceptance test failed.');
    }
  } catch (err) {
    console.error('Acceptance Test Error:', err);
  }
}

runEndToEndNoJdTest();
