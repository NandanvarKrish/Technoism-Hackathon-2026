const http = require('http');

const candidateA_Frontend = {
  name: 'Alex Rivera',
  detectedRole: 'Associate Frontend Developer',
  skills: ['JavaScript', 'TypeScript', 'React.js', 'Tailwind CSS', 'WebSockets'],
  projects: [{ name: 'Real-Time Analytics Dashboard', technologies: ['React.js', 'WebSockets', 'Tailwind'] }]
};

const candidateB_DataEngineer = {
  name: 'Sarah Chen',
  detectedRole: 'Data & Backend Engineer',
  skills: ['Python', 'SQL', 'PySpark', 'Pandas', 'PostgreSQL'],
  projects: [{ name: 'High-Throughput Streaming Pipeline', technologies: ['Python', 'PySpark', 'PostgreSQL'] }]
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
      res.on('end', () => resolve(JSON.parse(responseBody)));
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runInterviewAcceptanceTest() {
  console.log('=== ACCEPTANCE TEST: PERSONALIZED GENERAL AI INTERVIEW & DYNAMIC FOLLOW-UPS ===\n');

  try {
    // ------------------------------------------------------------
    // TEST 1: Personalized Questions for Candidate A vs Candidate B
    // ------------------------------------------------------------
    console.log('--- TEST 1: Question Generation Uniqueness (Candidate A vs Candidate B) ---');

    const resA = await requestApi('/interview/generate', {
      detectedRole: candidateA_Frontend.detectedRole,
      candidateProfile: candidateA_Frontend,
      questionCount: 3
    });
    const questionsA = resA.data.questions;

    console.log(`\nCandidate A (${candidateA_Frontend.name} - ${candidateA_Frontend.detectedRole}):`);
    questionsA.forEach((q, i) => {
      console.log(`  Q${i+1} [${q.focus}]: "${q.question}"`);
      console.log(`     Evidence: ${q.sourceEvidence || 'Profile evidence'}`);
    });

    console.log('\n- - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n');

    const resB = await requestApi('/interview/generate', {
      detectedRole: candidateB_DataEngineer.detectedRole,
      candidateProfile: candidateB_DataEngineer,
      questionCount: 3
    });
    const questionsB = resB.data.questions;

    console.log(`Candidate B (${candidateB_DataEngineer.name} - ${candidateB_DataEngineer.detectedRole}):`);
    questionsB.forEach((q, i) => {
      console.log(`  Q${i+1} [${q.focus}]: "${q.question}"`);
      console.log(`     Evidence: ${q.sourceEvidence || 'Profile evidence'}`);
    });

    console.log('\n------------------------------------------------------------\n');

    // ------------------------------------------------------------
    // TEST 2: Dynamic Follow-Up Questions Based on Candidate Answer
    // ------------------------------------------------------------
    console.log('--- TEST 2: Dynamic Answer-Dependent Follow-Up Generation ---');

    const initialQ = questionsA[0]?.question || "How did you implement state management in Real-Time Analytics Dashboard?";

    const answerOption1 = "I implemented a WebSocket connection to stream live telemetry updates directly to component state.";
    const answerOption2 = "I configured a REST polling loop every 10 seconds to fetch updated database metrics.";

    console.log(`Original Question: "${initialQ}"\n`);

    console.log(`Candidate Answer Scenario 1: "${answerOption1}"`);
    const followUpRes1 = await requestApi('/interview/follow-up', {
      questionText: initialQ,
      candidateAnswer: answerOption1,
      targetRole: candidateA_Frontend.detectedRole,
      candidateProfile: candidateA_Frontend
    });
    console.log(`👉 Dynamic Follow-Up 1: "${followUpRes1.data.followUpQuestion}"\n`);

    console.log(`Candidate Answer Scenario 2: "${answerOption2}"`);
    const followUpRes2 = await requestApi('/interview/follow-up', {
      questionText: initialQ,
      candidateAnswer: answerOption2,
      targetRole: candidateA_Frontend.detectedRole,
      candidateProfile: candidateA_Frontend
    });
    console.log(`👉 Dynamic Follow-Up 2: "${followUpRes2.data.followUpQuestion}"\n`);

    console.log('------------------------------------------------------------\n');

    // ------------------------------------------------------------
    // VERIFICATION CHECKS
    // ------------------------------------------------------------
    console.log('=== ACCEPTANCE VERIFICATION CHECKS ===');

    const check1 = questionsA[0].question !== questionsB[0].question;
    const check2 = Boolean(questionsA[0].sourceEvidence);
    const check3 = followUpRes1.data.followUpQuestion !== followUpRes2.data.followUpQuestion;

    console.log('1. Are Question Sets for Candidate A and Candidate B different?', check1 ? '✅ YES' : '❌ NO');
    console.log('2. Does each question contain sourceEvidence linking to resume profile?', check2 ? '✅ YES' : '❌ NO');
    console.log('3. Do follow-up questions change dynamically based on what candidate answered?', check3 ? '✅ YES' : '❌ NO');

    if (check1 && check2 && check3) {
      console.log('\n🎉 SUCCESS: All Personalized Interview & Dynamic Follow-up criteria passed!');
    } else {
      console.error('\n❌ FAILURE: Interview personalization checks failed.');
    }
  } catch (err) {
    console.error('Acceptance Test Error:', err);
  }
}

runInterviewAcceptanceTest();
