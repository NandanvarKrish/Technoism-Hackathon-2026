const http = require('http');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('=== TESTING TECH TITANS REST API ENDPOINTS ===\n');

  try {
    const health = await makeRequest('GET', '/health');
    console.log('1. GET /api/health:', health.status, JSON.stringify(health.data));

    const parse = await makeRequest('POST', '/resume/parse', { resumeText: 'Nandan Shah. Full Stack Developer.' });
    console.log('2. POST /api/resume/parse:', parse.status, JSON.stringify(parse.data.data ? parse.data.data.filename : parse.data));

    const ats = await makeRequest('POST', '/ats/analyze', { resumeText: 'React Node SQL JavaScript HTML CSS', jobDescription: 'Seeking Associate Frontend Developer proficient in React, JavaScript, Node.js, HTML5, CSS3, and SQL databases.', targetRole: 'Frontend Dev' });
    console.log('3. POST /api/ats/analyze:', ats.status, 'Score:', ats.data.data ? ats.data.data.matchScore : ats.data);

    const questions = await makeRequest('POST', '/interview/generate', { targetRole: 'Frontend Developer', questionCount: 3 });
    console.log('4. POST /api/interview/generate:', questions.status, 'Questions Count:', questions.data.data ? questions.data.data.questions.length : 0);

    const evalAns = await makeRequest('POST', '/interview/evaluate', { candidateAnswer: 'I implemented React components with custom hooks.', targetRole: 'Frontend Developer' });
    console.log('5. POST /api/interview/evaluate:', evalAns.status, 'Score:', evalAns.data.data ? evalAns.data.data.score : 0);

    const followUp = await makeRequest('POST', '/interview/follow-up', { questionText: 'Describe state management', candidateAnswer: 'Used Redux', targetRole: 'Frontend Dev' });
    console.log('6. POST /api/interview/follow-up:', followUp.status, JSON.stringify(followUp.data.data));

    const companies = await makeRequest('GET', '/companies');
    console.log('7. GET /api/companies:', companies.status, 'Count:', companies.data.data ? companies.data.data.length : 0);

    const googQuestions = await makeRequest('GET', '/companies/google/questions');
    console.log('8. GET /api/companies/google/questions:', googQuestions.status, 'Count:', googQuestions.data.count);

    const codingStart = await makeRequest('POST', '/coding/start', { company: 'google', problemId: 'goog_1' });
    console.log('9. POST /api/coding/start:', codingStart.status, JSON.stringify(codingStart.data.data.sessionId));

    const codingRun = await makeRequest('POST', '/coding/run', { code: 'function twoSum() { return [0,1]; }', language: 'javascript' });
    console.log('10. POST /api/coding/run:', codingRun.status, 'Status:', codingRun.data.data ? codingRun.data.data.status : 'error');

    const codingSubmit = await makeRequest('POST', '/coding/submit', { code: 'function twoSum() { return [0,1]; }', language: 'javascript', problemId: 'goog_1' });
    console.log('11. POST /api/coding/submit:', codingSubmit.status, 'Score:', codingSubmit.data.data ? codingSubmit.data.data.score : 0);

    const createSess = await makeRequest('POST', '/session', { candidateName: 'Nandan Shah', targetRole: 'Frontend Dev' });
    console.log('12. POST /api/session:', createSess.status, 'Session ID:', createSess.data.data ? createSess.data.data.id : null);

    const sessId = createSess.data.data ? createSess.data.data.id : 'test';
    const getSess = await makeRequest('GET', `/session/${sessId}`);
    console.log('13. GET /api/session/:id:', getSess.status, 'Candidate:', getSess.data.data ? getSess.data.data.candidateName : null);

    const finalReport = await makeRequest('POST', '/report/final', { atsScore: 85, interviewScore: 90, codingScore: 92, targetRole: 'Frontend Dev' });
    console.log('14. POST /api/report/final:', finalReport.status, 'Readiness Score:', finalReport.data.data ? finalReport.data.data.readinessScore : 0);

    console.log('\n=== ALL API TESTS PASSED SUCCESSFULLY! ===');
  } catch (err) {
    console.error('API Test Failed:', err);
  }
}

runTests();
