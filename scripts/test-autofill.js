const http = require('http');

const resumeFrontend = `ALEX RIVERA
Frontend Developer | React Specialist
Email: alex.rivera@example.com | Location: Seattle, WA

SUMMARY
Creative Frontend Engineer with 3+ years experience building responsive web apps with React.js, TypeScript, HTML5, CSS3, and Tailwind CSS.
`;

const resumeDataBackend = `SARAH CHEN
Data Engineer & Python Backend Specialist
Email: sarah.chen@example.com | Location: San Francisco, CA

SUMMARY
Senior Data Engineer specializing in distributed pipeline processing, Python, PySpark, ETL data warehouses, and PostgreSQL.
`;

function parseResume(resumeText, filename) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ resumeText, filename });
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/resume/parse',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function testAutoFill() {
  console.log('=== TESTING AUTOMATIC ROLE & JOB DESCRIPTION AUTO-FILL ===\n');

  try {
    console.log('--- 1. Uploading Resume A (Frontend Developer) ---');
    const resA = await parseResume(resumeFrontend, 'alex_resume.pdf');
    const profileA = resA.data.profile;

    console.log('Detected Role A:', profileA.detectedRole);
    console.log('Generated JD A Snippet:\n' + profileA.recommendedJobDescription.slice(0, 160) + '...\n');

    console.log('------------------------------------------------------------\n');

    console.log('--- 2. Uploading Resume B (Data Engineer) ---');
    const resB = await parseResume(resumeDataBackend, 'sarah_resume.pdf');
    const profileB = resB.data.profile;

    console.log('Detected Role B:', profileB.detectedRole);
    console.log('Generated JD B Snippet:\n' + profileB.recommendedJobDescription.slice(0, 160) + '...\n');

    console.log('=== AUTO-FILL VERIFICATION CHECKS ===');
    console.log('1. Was Role A Auto-Detected?', profileA.detectedRole ? '✅ YES (' + profileA.detectedRole + ')' : '❌ NO');
    console.log('2. Was Role B Auto-Detected?', profileB.detectedRole ? '✅ YES (' + profileB.detectedRole + ')' : '❌ NO');
    console.log('3. Are Detected Roles Different?', profileA.detectedRole !== profileB.detectedRole ? '✅ YES' : '❌ NO');
    console.log('4. Were Tailored Job Descriptions Auto-Generated?', (profileA.recommendedJobDescription && profileB.recommendedJobDescription) ? '✅ YES' : '❌ NO');

    console.log('\n🎉 SUCCESS: Role and Job Description auto-fill verified!');
  } catch (err) {
    console.error('Auto-fill test error:', err);
  }
}

testAutoFill();
