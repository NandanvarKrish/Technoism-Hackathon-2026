const http = require('http');

const candidateA = {
  name: 'Alex Rivera',
  detectedRole: 'Associate Frontend Developer',
  skills: ['JavaScript', 'TypeScript', 'React.js', 'Sliding Window', 'WebSockets']
};

const candidateB = {
  name: 'Sarah Chen',
  detectedRole: 'Data & Backend Engineer',
  skills: ['Python', 'Binary Search', 'Trees', 'Graphs', 'PySpark']
};

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
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(responseBody) }));
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runPersonalizedCodingTest() {
  console.log('=== ACCEPTANCE TEST: RESUME + COMPANY + ROLE PERSONALIZED CODING ROUND ===\n');

  try {
    // ------------------------------------------------------------
    // TEST 1: Gating Check (Interview must be completed first)
    // ------------------------------------------------------------
    console.log('--- TEST 1: Gating Lock (Locked until interview completed) ---');
    const lockedRes = await requestApi('/coding/start', {
      company: 'google',
      candidateProfile: candidateA,
      generalInterviewCompleted: false
    });

    console.log(`Response Status: ${lockedRes.status}`);
    console.log(`Message: "${lockedRes.body.error}"`);
    console.log('------------------------------------------------------------\n');

    // ------------------------------------------------------------
    // TEST 2: Candidate A (Frontend/React) vs Candidate B (Data/Python) at Google
    // ------------------------------------------------------------
    console.log('--- TEST 2: Personalized Question Recommendation (Candidate A vs Candidate B at Google) ---');

    const resA = await requestApi('/coding/start', {
      company: 'google',
      candidateProfile: candidateA,
      generalInterviewCompleted: true,
      interviewResult: { overallScore: 85 }
    });

    console.log(`Candidate A (${candidateA.name} - ${candidateA.detectedRole}):`);
    console.log(`  Selected Problem: "${resA.body.data.question.title}" [Difficulty: ${resA.body.data.difficulty}] [Topic: ${resA.body.data.topic}]`);
    console.log(`  Selection Reason: "${resA.body.data.selectionReason}"`);
    console.log(`  Relevant Skills: ${resA.body.data.candidateRelevantSkills.join(', ')}`);
    console.log(`  Session ID: ${resA.body.data.sessionId}`);

    console.log('\n- - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n');

    const resB = await requestApi('/coding/start', {
      company: 'google',
      candidateProfile: candidateB,
      generalInterviewCompleted: true,
      interviewResult: { overallScore: 88 }
    });

    console.log(`Candidate B (${candidateB.name} - ${candidateB.detectedRole}):`);
    console.log(`  Selected Problem: "${resB.body.data.question.title}" [Difficulty: ${resB.body.data.difficulty}] [Topic: ${resB.body.data.topic}]`);
    console.log(`  Selection Reason: "${resB.body.data.selectionReason}"`);
    console.log(`  Relevant Skills: ${resB.body.data.candidateRelevantSkills.join(', ')}`);
    console.log(`  Session ID: ${resB.body.data.sessionId}`);

    console.log('\n------------------------------------------------------------\n');

    // ------------------------------------------------------------
    // VERIFICATION CHECKS
    // ------------------------------------------------------------
    console.log('=== ACCEPTANCE VERIFICATION CHECKS ===');
    const check1 = lockedRes.status === 403;
    const check2 = resA.body.data.question.title !== resB.body.data.question.title;
    const check3 = Boolean(resA.body.data.selectionReason && resA.body.data.sessionId);

    console.log('1. Coding round locked (HTTP 403) before interview completion?', check1 ? '✅ YES' : '❌ NO');
    console.log('2. Different coding questions selected for Candidate A vs Candidate B at same company?', check2 ? '✅ YES' : '❌ NO');
    console.log('3. Response stores selectionReason, candidateRelevantSkills, and sessionId?', check3 ? '✅ YES' : '❌ NO');

    if (check1 && check2 && check3) {
      console.log('\n🎉 SUCCESS: All Personalized Coding Round & Gating criteria passed!');
    } else {
      console.error('\n❌ FAILURE: Personalized coding round checks failed.');
    }
  } catch (err) {
    console.error('Acceptance Test Error:', err);
  }
}

runPersonalizedCodingTest();
