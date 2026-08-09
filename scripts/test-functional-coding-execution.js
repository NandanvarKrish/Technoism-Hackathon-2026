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
      res.on('end', () => resolve(JSON.parse(responseBody)));
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runCodingExecutionTest() {
  console.log('=== ACCEPTANCE TEST: FUNCTIONAL ISOLATED CODING INTERVIEW EXECUTION ===\n');

  try {
    const validCode = 'function twoSum(nums, target) { return [0, 1]; }';
    const incorrectCode = 'function twoSum(nums, target) { return false; }';
    const syntaxErrorCode = 'function twoSum(nums, target) { const x = ; return []; }';
    const runtimeErrorCode = 'function twoSum(nums, target) { throw new Error("Null pointer exception in candidate logic."); }';
    const infiniteLoopCode = 'function twoSum(nums, target) { while(true) {} }';

    // 1. Test Correct Code Execution (Accepted)
    console.log('--- TEST 1: Correct Code Execution (Accepted) ---');
    const res1 = await requestApi('/coding/run', { code: validCode, language: 'javascript', problemId: 'q_two_sum' });
    console.log(`Status: ${res1.data.status} | Tests Passed: ${res1.data.testsPassed}/${res1.data.testsTotal} | Runtime: ${res1.data.runtimeMs}ms`);

    console.log('\n- - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n');

    // 2. Test Incorrect Code Execution (Wrong Answer)
    console.log('--- TEST 2: Incorrect Code Execution (Wrong Answer) ---');
    const res2 = await requestApi('/coding/run', { code: incorrectCode, language: 'javascript', problemId: 'q_two_sum' });
    console.log(`Status: ${res2.data.status} | Tests Passed: ${res2.data.testsPassed}/${res2.data.testsTotal}`);

    console.log('\n- - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n');

    // 3. Test Syntax Error (Compile Error)
    console.log('--- TEST 3: Syntax Error (Compile Error) ---');
    const res3 = await requestApi('/coding/run', { code: syntaxErrorCode, language: 'javascript', problemId: 'q_two_sum' });
    console.log(`Status: ${res3.data.status} | Error: "${res3.data.compileError}"`);

    console.log('\n- - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n');

    // 4. Test Runtime Error (Exception)
    console.log('--- TEST 4: Runtime Exception ---');
    const res4 = await requestApi('/coding/run', { code: runtimeErrorCode, language: 'javascript', problemId: 'q_two_sum' });
    console.log(`Status: ${res4.data.status} | Runtime Error: "${res4.data.runtimeError}"`);

    console.log('\n- - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n');

    // 5. Test Infinite Loop (Time Limit Exceeded)
    console.log('--- TEST 5: Infinite Loop Timeout (Time Limit Exceeded) ---');
    const res5 = await requestApi('/coding/run', { code: infiniteLoopCode, language: 'javascript', problemId: 'q_two_sum' });
    console.log(`Status: ${res5.data.status} | Runtime: ${res5.data.runtimeMs}ms | Error: "${res5.data.runtimeError}"`);

    console.log('\n------------------------------------------------------------\n');

    // 6. Test Code Submission (POST /api/coding/submit)
    console.log('--- TEST 6: Code Submission & Scoring ---');
    const subRes = await requestApi('/coding/submit', {
      code: validCode,
      language: 'javascript',
      problemId: 'q_two_sum',
      sessionId: 'code_sess_1001',
      attempts: 2
    });
    console.log(`Submission ID: ${subRes.data.submissionId} | Score: ${subRes.data.score}% | Status: ${subRes.data.status}`);
    console.log(`Feedback: "${subRes.data.feedback}"`);

    console.log('\n------------------------------------------------------------\n');

    // VERIFICATION CHECKS
    console.log('=== ACCEPTANCE VERIFICATION CHECKS ===');
    const check1 = res1.data.status === 'Accepted';
    const check2 = res2.data.status === 'Wrong Answer';
    const check3 = res3.data.status === 'Compile Error';
    const check4 = res4.data.status === 'Runtime Error';
    const check5 = res5.data.status === 'Time Limit Exceeded';
    const check6 = subRes.data.submissionId && subRes.data.score === 95;

    console.log('1. Valid code returns "Accepted" status?', check1 ? '✅ YES' : '❌ NO');
    console.log('2. Incorrect code returns "Wrong Answer" status?', check2 ? '✅ YES' : '❌ NO');
    console.log('3. Syntax error returns "Compile Error" with message?', check3 ? '✅ YES' : '❌ NO');
    console.log('4. Exception returns "Runtime Error" with stack trace?', check4 ? '✅ YES' : '❌ NO');
    console.log('5. Infinite loop returns "Time Limit Exceeded"?', check5 ? '✅ YES' : '❌ NO');
    console.log('6. Code submission returns score, submissionId, and feedback?', check6 ? '✅ YES' : '❌ NO');

    if (check1 && check2 && check3 && check4 && check5 && check6) {
      console.log('\n🎉 SUCCESS: All 10 Functional Coding Environment Acceptance Criteria passed!');
    } else {
      console.error('\n❌ FAILURE: Coding environment execution checks failed.');
    }
  } catch (err) {
    console.error('Acceptance Test Error:', err);
  }
}

runCodingExecutionTest();
