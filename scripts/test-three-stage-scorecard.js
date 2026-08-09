const http = require('http');

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

async function runThreeStageScorecardTest() {
  console.log('=== ACCEPTANCE TEST: FINAL THREE-STAGE SCORECARD (30/35/35) ===\n');

  try {
    // ------------------------------------------------------------
    // TEST 1: Locking Check (Requires all 3 rounds)
    // ------------------------------------------------------------
    console.log('--- TEST 1: Locking Check (Incomplete rounds) ---');
    const lockedRes = await requestApi('/report/final', {
      atsScore: 80,
      interviewScore: 80
      // codingScore omitted!
    });
    console.log(`Response Status: ${lockedRes.status}`);
    console.log(`Error Message: "${lockedRes.body.error}"`);

    console.log('\n------------------------------------------------------------\n');

    // ------------------------------------------------------------
    // TEST 2: Three-Stage Score Formula Calculation & Dynamic Sensitivity
    // ------------------------------------------------------------
    console.log('--- TEST 2: Dynamic Score Sensitivity Across Rounds ---');

    // Scenario A: Base scores (ATS: 80, Interview: 80, Coding: 80)
    const resA = await requestApi('/report/final', {
      atsScore: 80,
      interviewScore: 80,
      codingScore: 80,
      targetRole: 'Full-Stack Developer'
    });
    console.log(`Scenario A (80 / 80 / 80): Overall Score = ${resA.body.data.readinessScore}% (Expected: 80%)`);

    // Scenario B: Increase ATS to 90 (90 * 0.30 + 80 * 0.35 + 80 * 0.35 = 83)
    const resB = await requestApi('/report/final', {
      atsScore: 90,
      interviewScore: 80,
      codingScore: 80,
      targetRole: 'Full-Stack Developer'
    });
    console.log(`Scenario B (90 / 80 / 80): Overall Score = ${resB.body.data.readinessScore}% (Expected: 83%)`);

    // Scenario C: Increase Coding to 100 (90 * 0.30 + 80 * 0.35 + 100 * 0.35 = 90)
    const resC = await requestApi('/report/final', {
      atsScore: 90,
      interviewScore: 80,
      codingScore: 100,
      targetRole: 'Full-Stack Developer'
    });
    console.log(`Scenario C (90 / 80 / 100): Overall Score = ${resC.body.data.readinessScore}% (Expected: 90%)`);

    console.log('\n------------------------------------------------------------\n');

    // ------------------------------------------------------------
    // TEST 3: Performance-Based Personalized Recommendations
    // ------------------------------------------------------------
    console.log('--- TEST 3: Performance-Based Recommendations ---');

    const perfRes = await requestApi('/report/final', {
      atsResult: { overallScore: 70, weaknesses: ['Missing AWS cloud deployment'], missingSkills: ['AWS', 'Docker'] },
      interviewResult: { overallScore: 75, weakestAreas: ['STAR method for database scaling'] },
      codingSubmission: { score: 60, status: 'Time Limit Exceeded', complexity: { time: 'O(N^2)' } },
      targetRole: 'Full-Stack Developer',
      selectedCompany: 'Google'
    });

    console.log(`Readiness Level: "${perfRes.body.data.readinessLevel}" (${perfRes.body.data.readinessScore}%)`);
    console.log('Personalized Next Actions:');
    perfRes.body.data.nextActions.forEach((act, idx) => {
      console.log(`  ${idx+1}. ${act}`);
    });

    console.log('\n------------------------------------------------------------\n');

    // VERIFICATION CHECKS
    console.log('=== ACCEPTANCE VERIFICATION CHECKS ===');
    const check1 = lockedRes.status === 403;
    const check2 = resA.body.data.readinessScore === 80 && resB.body.data.readinessScore === 83 && resC.body.data.readinessScore === 90;
    const check3 = perfRes.body.data.nextActions.some(act => act.includes('AWS') || act.includes('Google'));

    console.log('1. Scorecard locked (HTTP 403) before all 3 rounds are complete?', check1 ? '✅ YES' : '❌ NO');
    console.log('2. Score changes dynamically according to 30/35/35 weights when round scores change?', check2 ? '✅ YES' : '❌ NO');
    console.log('3. Recommendations adapt dynamically to actual performance in each round?', check3 ? '✅ YES' : '❌ NO');

    if (check1 && check2 && check3) {
      console.log('\n🎉 SUCCESS: All Final Three-Stage Scorecard criteria passed!');
    } else {
      console.error('\n❌ FAILURE: Scorecard calculation checks failed.');
    }
  } catch (err) {
    console.error('Acceptance Test Error:', err);
  }
}

runThreeStageScorecardTest();
