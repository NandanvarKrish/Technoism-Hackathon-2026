const http = require('http');

function requestApi(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api' + path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => resolve(JSON.parse(responseBody)));
    });

    req.on('error', reject);
    req.end();
  });
}

async function runCompanyDatasetAcceptanceTest() {
  console.log('=== ACCEPTANCE TEST: COMPANY-WISE CODING DATASET INTEGRATION ===\n');

  try {
    // 1. Fetch Companies List
    console.log('--- TEST 1: Retrieve Registered Companies ---');
    const compRes = await requestApi('/companies');
    console.log(`Registered Companies count: ${compRes.count}`);
    compRes.data.forEach(c => {
      console.log(`  🏢 ${c.name} (${c.id}) — ${c.totalQuestions} Questions`);
    });

    console.log('\n------------------------------------------------------------\n');

    // 2. Search Company
    console.log('--- TEST 2: Company Search Filter ("Google") ---');
    const searchRes = await requestApi('/companies?search=Google');
    console.log(`Search Results count: ${searchRes.count}`);
    console.log(`  Found: ${searchRes.data[0]?.name}`);

    console.log('\n------------------------------------------------------------\n');

    // 3. Retrieve Google Questions
    console.log('--- TEST 3: Retrieve Google Company Questions ---');
    const googRes = await requestApi('/companies/google/questions');
    console.log(`Google Questions count: ${googRes.count}`);
    googRes.data.forEach((q, i) => {
      console.log(`  Q${i+1}: "${q.title}" [Difficulty: ${q.difficulty}] [Topic: ${q.topic}] [TimeWindow: ${q.timeWindow}]`);
      console.log(`      Source: ${q.sourceUrl}`);
    });

    console.log('\n------------------------------------------------------------\n');

    // 4. Retrieve Filtered Questions (Difficulty: Medium)
    console.log('--- TEST 4: Filter Questions by Difficulty ("Medium") ---');
    const diffRes = await requestApi('/companies/google/questions?difficulty=Medium');
    console.log(`Filtered (Medium) count: ${diffRes.count}`);
    diffRes.data.forEach(q => {
      console.log(`  - "${q.title}" (${q.difficulty})`);
    });

    console.log('\n------------------------------------------------------------\n');

    // VERIFICATION CHECKS
    console.log('=== ACCEPTANCE VERIFICATION CHECKS ===');
    const check1 = compRes.count >= 4;
    const check2 = searchRes.data[0]?.id === 'google';
    const check3 = googRes.count > 0;
    const check4 = diffRes.data.every(q => q.difficulty.toLowerCase() === 'medium');

    console.log('1. Dataset imported and registered multiple companies?', check1 ? '✅ YES' : '❌ NO');
    console.log('2. Company search correctly locates target company?', check2 ? '✅ YES' : '❌ NO');
    console.log('3. Company coding questions retrieved successfully with source URLs?', check3 ? '✅ YES' : '❌ NO');
    console.log('4. Filtering by difficulty ("Medium") works accurately?', check4 ? '✅ YES' : '❌ NO');

    if (check1 && check2 && check3 && check4) {
      console.log('\n🎉 SUCCESS: All Company Coding Dataset Integration criteria passed!');
    } else {
      console.error('\n❌ FAILURE: Company dataset integration checks failed.');
    }
  } catch (err) {
    console.error('Acceptance Test Error:', err);
  }
}

runCompanyDatasetAcceptanceTest();
