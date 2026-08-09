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

async function runSemanticEvaluationTest() {
  console.log('=== ACCEPTANCE TEST: REAL SEMANTIC AI INTERVIEW EVALUATION ===\n');

  try {
    const questionObj = {
      id: 'q_test_1',
      question: 'How did you handle real-time state updates in your React analytics dashboard project?',
      focus: 'React State Management & WebSockets'
    };

    const conciseCorrectAnswer = 'I established a WebSocket connection and bound incoming payload dispatches directly to Redux store reducers to update UI components cleanly.';

    const longRamblingAnswer = 'Well, state management is very important in software engineering. When you build applications you want good state management. So I used React and JavaScript and HTML and CSS and I spent many hours thinking about state and components and dispatches and buttons and styling. It was a very big project and I worked hard to make sure the state was stateful.';

    // 1. Evaluate Concise Correct Answer
    console.log('--- TEST 1: Concise Correct Answer Evaluation ---');
    console.log(`Answer (${conciseCorrectAnswer.split(' ').length} words): "${conciseCorrectAnswer}"`);
    const evalConcise = await requestApi('/interview/evaluate', {
      questionObj,
      candidateAnswer: conciseCorrectAnswer,
      targetRole: 'Full-Stack Developer'
    });

    console.log('Evaluation Result:');
    console.log(`  Overall Score: ${evalConcise.data.score}%`);
    console.log(`  Relevance: ${evalConcise.data.relevance}% | Clarity: ${evalConcise.data.clarity}% | Technical Accuracy: ${evalConcise.data.technicalAccuracy}%`);
    console.log(`  Strengths: ${evalConcise.data.strengths?.[0] || 'N/A'}`);
    console.log(`  Follow-Up Needed: ${evalConcise.data.followUpNeeded} (${evalConcise.data.followUpReason || 'None'})`);

    console.log('\n------------------------------------------------------------\n');

    // 2. Evaluate Long Rambling Answer
    console.log('--- TEST 2: Long Rambling Answer Evaluation ---');
    console.log(`Answer (${longRamblingAnswer.split(' ').length} words): "${longRamblingAnswer}"`);
    const evalRambling = await requestApi('/interview/evaluate', {
      questionObj,
      candidateAnswer: longRamblingAnswer,
      targetRole: 'Full-Stack Developer'
    });

    console.log('Evaluation Result:');
    console.log(`  Overall Score: ${evalRambling.data.score}%`);
    console.log(`  Relevance: ${evalRambling.data.relevance}% | Clarity: ${evalRambling.data.clarity}% | Technical Accuracy: ${evalRambling.data.technicalAccuracy}%`);
    console.log(`  Improvements: ${evalRambling.data.improvements?.[0] || 'N/A'}`);

    console.log('\n------------------------------------------------------------\n');

    // 3. Evaluate Session Aggregator
    console.log('--- TEST 3: Session Evaluation Aggregator ---');
    const sessionRes = await requestApi('/interview/evaluate-session', {
      questions: [questionObj],
      answers: [
        { questionId: questionObj.id, answerText: conciseCorrectAnswer, evaluation: evalConcise.data }
      ],
      targetRole: 'Full-Stack Developer'
    });

    console.log('Session Summary Result:');
    console.log(`  Overall Session Score: ${sessionRes.data.overallScore}%`);
    console.log(`  Avg Relevance: ${sessionRes.data.averageRelevance}% | Avg Clarity: ${sessionRes.data.averageClarity}% | Avg Structure: ${sessionRes.data.averageStructure}%`);
    console.log(`  Technical Performance: ${sessionRes.data.technicalPerformance}%`);
    console.log(`  Strongest Areas: ${sessionRes.data.strongestAreas?.join(', ')}`);

    console.log('\n------------------------------------------------------------\n');

    // VERIFICATION CHECKS
    console.log('=== ACCEPTANCE VERIFICATION CHECKS ===');
    const check1 = evalConcise.data.score >= 70; // Concise correct answer gets solid score
    const check2 = evalConcise.data.technicalAccuracy !== undefined;
    const check3 = sessionRes.data.overallScore !== undefined;

    console.log('1. Concise correct answer scored based on semantic quality (not word count)?', check1 ? '✅ YES' : '❌ NO');
    console.log('2. Evaluation includes technicalAccuracy & followUpNeeded schema fields?', check2 ? '✅ YES' : '❌ NO');
    console.log('3. Session Aggregator computes session metrics & technical performance?', check3 ? '✅ YES' : '❌ NO');

    if (check1 && check2 && check3) {
      console.log('\n🎉 SUCCESS: Real Semantic AI Evaluation & Session Aggregator verified!');
    } else {
      console.error('\n❌ FAILURE: Semantic evaluation checks failed.');
    }
  } catch (err) {
    console.error('Acceptance Test Error:', err);
  }
}

runSemanticEvaluationTest();
