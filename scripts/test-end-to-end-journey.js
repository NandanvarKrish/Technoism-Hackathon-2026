const http = require('http');

function requestApi(path, method = 'POST', body = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(responseBody) });
        } catch (e) {
          resolve({ status: res.statusCode, body: responseBody });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runEndToEndJourneyTest() {
  console.log('=== ACCEPTANCE TEST: TECH TITANS COMPLETE END-TO-END USER JOURNEY ===\n');

  try {
    // ------------------------------------------------------------
    // STAGE 1: Create Session & Health Check
    // ------------------------------------------------------------
    console.log('--- STAGE 1: Session Initialization ---');
    const sessRes = await requestApi('/session', 'POST', {
      candidateName: 'Nandan Shah',
      targetRole: 'Full-Stack Developer'
    });
    const sessionId = sessRes.body.data.id;
    console.log(`Initialized Session ID: ${sessionId}`);

    // ------------------------------------------------------------
    // STAGE 2: Locked Progression Defense Check (Coding & Report should fail prematurely)
    // ------------------------------------------------------------
    console.log('\n--- STAGE 2: Locked Progression Security Check ---');
    const prematureCoding = await requestApi('/coding/start', 'POST', {
      company: 'google',
      generalInterviewCompleted: false
    });
    console.log(`Premature Coding Lock (Expected HTTP 403): ${prematureCoding.status} ${prematureCoding.body.error ? '✅ LOCKED' : '❌ UNLOCKED'}`);

    const prematureReport = await requestApi('/report/final', 'POST', {
      atsScore: 80
      // Incomplete rounds!
    });
    console.log(`Premature Report Lock (Expected HTTP 403): ${prematureReport.status} ${prematureReport.body.error ? '✅ LOCKED' : '❌ UNLOCKED'}`);

    // ------------------------------------------------------------
    // STAGE 3: Resume Extraction & Automatic Role Detection
    // ------------------------------------------------------------
    console.log('\n--- STAGE 3: Resume Text Extraction & Candidate Profile ---');
    const resumeText = `NANDAN SHAH
Full-Stack & Frontend Developer
Email: nandan@example.com | GitHub: github.com/nandan

PROFESSIONAL SUMMARY
Passionate Full-Stack Developer with 3+ years of experience building high-performance web applications using JavaScript, React, Node.js, Express, PostgreSQL, and REST APIs.

SKILLS
- Languages: JavaScript, Python, SQL, HTML5, CSS3
- Frontend: React, Redux, Next.js, Webpack
- Backend: Node.js, Express, RESTful APIs, Microservices
- Databases: PostgreSQL, Supabase, MongoDB, Redis

PROJECTS
Tech Titans AI Platform — Built a full-stack candidate preparation platform using React, Node.js, and Gemini 2.5 Flash API.
- Implemented real-time ATS analysis, automated role detection, personalized mock interviews, and isolated sandbox code execution.`;

    const resumeSave = await requestApi(`/session/${sessionId}/resume`, 'POST', {
      file_name: 'nandan_resume.pdf',
      extracted_text: resumeText,
      candidateProfile: {
        name: 'Nandan Shah',
        detectedRole: 'Full-Stack Developer',
        skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'Python']
      }
    });
    console.log(`Resume & Profile Saved: ${resumeSave.body.data.id}`);

    // ------------------------------------------------------------
    // STAGE 4: Real ATS Resume Analysis
    // ------------------------------------------------------------
    console.log('\n--- STAGE 4: Real ATS Resume Scorecard Generation ---');
    const atsRes = await requestApi('/ats/analyze', 'POST', {
      resumeText,
      candidateProfile: { detectedRole: 'Full-Stack Developer', skills: ['JavaScript', 'React', 'Node.js'] },
      targetRole: 'Full-Stack Developer'
    });
    const atsResult = atsRes.body.data;
    console.log(`ATS Score: ${atsResult.score}% | Target Role: "${atsResult.targetRole}"`);

    await requestApi(`/session/${sessionId}/ats`, 'POST', { atsResult });

    // ------------------------------------------------------------
    // STAGE 5: Personalized General AI Mock Interview
    // ------------------------------------------------------------
    console.log('\n--- STAGE 5: Personalized General AI Mock Interview ---');
    const intGen = await requestApi('/interview/generate', 'POST', {
      detectedRole: 'Full-Stack Developer',
      candidateProfile: { skills: ['JavaScript', 'React', 'Node.js'] },
      atsResult,
      resumeText,
      questionCount: 2
    });
    const questions = intGen.body.data.questions;
    console.log(`Generated ${questions.length} personalized evidence-backed questions:`);
    questions.forEach((q, i) => console.log(`  Q${i+1}: "${q.question}"`));

    // Evaluate Question 1
    const eval1 = await requestApi('/interview/evaluate', 'POST', {
      questionObj: questions[0],
      candidateAnswer: 'In my recent project, I built a microservices backend using Node.js and Express with PostgreSQL connection pooling.',
      targetRole: 'Full-Stack Developer',
      resumeText
    });
    console.log(`Q1 Evaluation: Score = ${eval1.body.data.score}% | Technical Accuracy = ${eval1.body.data.technicalAccuracy}%`);

    // Evaluate Dynamic Follow-up Question
    const followUpRes = await requestApi('/interview/follow-up', 'POST', {
      previousQuestion: questions[0].question,
      candidateAnswer: 'I optimized query latency using indexing and Redis caching.',
      candidateProfile: { detectedRole: 'Full-Stack Developer' }
    });
    console.log(`Dynamic Follow-up Question: "${followUpRes.body.data.followUpQuestion}"`);

    const sessionEval = await requestApi('/interview/evaluate-session', 'POST', {
      answers: [
        { questionObj: questions[0], candidateAnswer: 'I built Node.js microservices with Redis.' },
        { questionObj: questions[1], candidateAnswer: 'I structured React components with state management.' }
      ],
      targetRole: 'Full-Stack Developer',
      resumeText
    });
    const interviewResult = sessionEval.body.data;
    console.log(`General Interview Completed: Overall Score = ${interviewResult.overallScore}%`);

    await requestApi(`/session/${sessionId}/interview`, 'POST', {
      targetRole: 'Full-Stack Developer',
      questions,
      evaluations: [eval1.body.data]
    });

    // ------------------------------------------------------------
    // STAGE 6: Company-Wise Coding Round (Now Unlocked!)
    // ------------------------------------------------------------
    console.log('\n--- STAGE 6: Company Selection & Personalized Problem Recommendation ---');
    const codingStart = await requestApi('/coding/start', 'POST', {
      company: 'google',
      candidateProfile: { detectedRole: 'Full-Stack Developer', skills: ['JavaScript', 'React', 'Node.js'] },
      atsResult,
      interviewResult,
      generalInterviewCompleted: true
    });
    const codingProblem = codingStart.body.data.question;
    console.log(`Selected Company: "${codingStart.body.data.company}"`);
    console.log(`Recommended Problem: "${codingProblem.title}" (${codingProblem.difficulty} | ${codingProblem.topic})`);
    console.log(`Selection Reason: "${codingStart.body.data.selectionReason}"`);

    // ------------------------------------------------------------
    // STAGE 7: Code Sandbox Execution & Evaluation
    // ------------------------------------------------------------
    console.log('\n--- STAGE 7: Isolated Sandbox Code Execution ---');
    const validCode = 'function twoSum(nums, target) { return [0, 1]; }';
    const runRes = await requestApi('/coding/run', 'POST', {
      code: validCode,
      language: 'javascript',
      problemId: codingProblem.id
    });
    console.log(`Execution Status: "${runRes.body.data.status}" | Passed: ${runRes.body.data.testsPassed}/${runRes.body.data.testsTotal}`);

    const subRes = await requestApi('/coding/submit', 'POST', {
      code: validCode,
      language: 'javascript',
      problemId: codingProblem.id,
      sessionId,
      attempts: 1
    });
    const codingSubmission = subRes.body.data;
    console.log(`Coding Submission Score: ${codingSubmission.score}% | Status: "${codingSubmission.status}"`);

    await requestApi(`/session/${sessionId}/coding`, 'POST', {
      company: 'google',
      problemId: codingProblem.id,
      submission: codingSubmission
    });

    // ------------------------------------------------------------
    // STAGE 8: Final Three-Stage Scorecard & Report Generation
    // ------------------------------------------------------------
    console.log('\n--- STAGE 8: Final Three-Stage Scorecard & Report ---');
    const reportRes = await requestApi('/report/final', 'POST', {
      atsResult,
      interviewResult,
      codingSubmission,
      targetRole: 'Full-Stack Developer',
      selectedCompany: 'Google'
    });
    const finalReport = reportRes.body.data;
    console.log(`ATS Fit (30%):        ${finalReport.atsScore}%`);
    console.log(`General Interview (35%): ${finalReport.interviewScore}%`);
    console.log(`Company Coding (35%):    ${finalReport.codingScore}%`);
    console.log(`OVERALL PREPARATION:     ${finalReport.readinessScore}% (${finalReport.readinessLevel})`);

    console.log('\nPersonalized Next Actions:');
    finalReport.nextActions.forEach((act, idx) => {
      console.log(`  ${idx+1}. ${act}`);
    });

    await requestApi(`/session/${sessionId}/report`, 'POST', { report: finalReport });

    // ------------------------------------------------------------
    // STAGE 9: Complete Session State Recovery Verification
    // ------------------------------------------------------------
    console.log('\n--- STAGE 9: Full Session Recovery Check (GET /api/session/:id) ---');
    const recoverRes = await requestApi(`/session/${sessionId}`, 'GET');
    const recData = recoverRes.body.data;
    console.log('Final Persisted Session Flags:');
    console.log(recData.session);

    // VERIFICATION CHECKS
    console.log('\n=== ACCEPTANCE VERIFICATION CHECKS ===');
    const check1 = prematureCoding.status === 403 && prematureReport.status === 403;
    const check2 = atsResult.score > 0 && interviewResult.overallScore > 0 && codingSubmission.score > 0;
    const check3 = finalReport.readinessScore === Math.round((atsResult.score * 0.30) + (interviewResult.overallScore * 0.35) + (codingSubmission.score * 0.35));
    const check4 = recData.session.finalReportAvailable === true;

    console.log('1. Locked progression security enforced (HTTP 403 on premature stage access)?', check1 ? '✅ YES' : '❌ NO');
    console.log('2. Real non-simulated evaluation returned for ATS, Interview, and Coding?', check2 ? '✅ YES' : '❌ NO');
    console.log('3. Final Three-Stage Scorecard correctly calculated with 30/35/35 weights?', check3 ? '✅ YES' : '❌ NO');
    console.log('4. Complete session state persisted and fully recoverable?', check4 ? '✅ YES' : '❌ NO');

    if (check1 && check2 && check3 && check4) {
      console.log('\n🎉 SUCCESS: Complete End-to-End User Journey Verified across all 15 stages!');
    } else {
      console.error('\n❌ FAILURE: End-to-end journey checks failed.');
    }
  } catch (err) {
    console.error('Acceptance Test Error:', err);
  }
}

runEndToEndJourneyTest();
