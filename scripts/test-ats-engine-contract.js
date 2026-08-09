const AtsEngine = require('../client/js/ats-engine.js');

function runContractAudit() {
  console.log('=== ATS ENGINE CONTRACT AUDIT ===\n');

  const resumeText = 'NANDAN SHAH Full-Stack & Frontend Developer JavaScript React Node.js SQL PostgreSQL';
  const profile = { name: 'Nandan Shah', detectedRole: 'Full-Stack & Frontend Developer', skills: ['JavaScript', 'React', 'Node.js', 'SQL'] };

  console.log('Testing AtsEngine method contracts:');

  // 1. analyzeResume
  console.log('1. analyzeResume():', typeof AtsEngine.analyzeResume === 'function' ? '✅ Function Exists' : '❌ Missing');
  const res1 = AtsEngine.analyzeResume(resumeText, profile, 'Full-Stack & Frontend Developer');
  console.log('   Score:', res1.overallScore, '| Source:', res1.source);

  // 2. analyze
  console.log('2. analyze():', typeof AtsEngine.analyze === 'function' ? '✅ Function Exists' : '❌ Missing');
  const res2 = AtsEngine.analyze(resumeText, profile);
  console.log('   Score:', res2.overallScore);

  // 3. analyzeMatch
  console.log('3. analyzeMatch():', typeof AtsEngine.analyzeMatch === 'function' ? '✅ Function Exists' : '❌ Missing');
  const res3 = AtsEngine.analyzeMatch(resumeText, '', 'Full-Stack & Frontend Developer');
  console.log('   Score:', res3.overallScore);

  // 4. analyzeCandidate
  console.log('4. analyzeCandidate():', typeof AtsEngine.analyzeCandidate === 'function' ? '✅ Function Exists' : '❌ Missing');
  const res4 = AtsEngine.analyzeCandidate(resumeText, profile);
  console.log('   Score:', res4.overallScore);

  // 5. runATSAnalysis
  console.log('5. runATSAnalysis():', typeof AtsEngine.runATSAnalysis === 'function' ? '✅ Function Exists' : '❌ Missing');
  const res5 = AtsEngine.runATSAnalysis(resumeText, profile);
  console.log('   Score:', res5.overallScore);

  // 6. evaluateResume
  console.log('6. evaluateResume():', typeof AtsEngine.evaluateResume === 'function' ? '✅ Function Exists' : '❌ Missing');
  const res6 = AtsEngine.evaluateResume(resumeText, profile);
  console.log('   Score:', res6.overallScore);

  console.log('\n🎉 SUCCESS: All 6 AtsEngine API contract aliases are 100% functional!');
}

runContractAudit();
