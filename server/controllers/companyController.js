const fs = require('fs');
const path = require('path');

let datasetCache = null;

function loadDataset() {
  if (datasetCache) return datasetCache;
  const filePath = path.join(__dirname, '../../data/company-questions-normalized.json');

  if (fs.existsSync(filePath)) {
    try {
      datasetCache = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return datasetCache;
    } catch (e) {
      console.warn('[companyController] Failed to parse normalized dataset file:', e.message);
    }
  }

  // Initial Fallback Data Structure
  return {
    companies: [
      { id: 'google', name: 'Google', questionCount: 5 },
      { id: 'amazon', name: 'Amazon', questionCount: 5 },
      { id: 'microsoft', name: 'Microsoft', questionCount: 4 },
      { id: 'meta', name: 'Meta', questionCount: 4 },
      { id: 'apple', name: 'Apple', questionCount: 2 },
      { id: 'netflix', name: 'Netflix', questionCount: 2 }
    ],
    questions: [],
    relations: []
  };
}

// Icon Mapping helper
function getCompanyIcon(companySlug) {
  switch (companySlug.toLowerCase()) {
    case 'google': return 'fa-brands fa-google';
    case 'amazon': return 'fa-brands fa-amazon';
    case 'microsoft': return 'fa-brands fa-microsoft';
    case 'meta': return 'fa-brands fa-meta';
    case 'apple': return 'fa-brands fa-apple';
    case 'netflix': return 'fa-solid fa-film';
    default: return 'fa-solid fa-building';
  }
}

// GET /api/companies (Support search filter)
exports.getCompanies = (req, res) => {
  try {
    const dataset = loadDataset();
    const query = (req.query.search || req.query.query || '').toLowerCase().trim();

    let companies = dataset.companies.map(c => ({
      ...c,
      icon: getCompanyIcon(c.id),
      totalQuestions: c.questionCount || 0
    }));

    if (query) {
      companies = companies.filter(c => 
        c.name.toLowerCase().includes(query) || c.id.toLowerCase().includes(query)
      );
    }

    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch companies: ' + err.message
    });
  }
};

// GET /api/companies/:company/questions (Support difficulty, timeWindow, topic, search filters)
exports.getCompanyQuestions = (req, res) => {
  try {
    const companyKey = (req.params.company || '').toLowerCase().trim();
    const { difficulty, timeWindow, topic, search } = req.query;
    const dataset = loadDataset();

    const companyObj = dataset.companies.find(c => c.id.toLowerCase() === companyKey || c.name.toLowerCase() === companyKey);
    if (!companyObj) {
      return res.status(404).json({
        success: false,
        error: `Company "${req.params.company}" not found.`
      });
    }

    // Filter relations for target company
    let targetRelations = dataset.relations.filter(r => r.companyId.toLowerCase() === companyObj.id.toLowerCase());

    if (timeWindow && timeWindow !== 'All Time') {
      targetRelations = targetRelations.filter(r => r.timeWindow.toLowerCase() === timeWindow.toLowerCase());
    }

    let questionMap = {};
    dataset.questions.forEach(q => { questionMap[q.id] = q; });

    let matchedQuestions = targetRelations.map(rel => {
      const q = questionMap[rel.questionId] || {};
      return {
        id: q.id || rel.questionId,
        title: q.title || 'Coding Challenge',
        difficulty: rel.metadata?.difficulty || q.difficulty || 'Medium',
        topic: rel.metadata?.topic || q.topic || 'Algorithms',
        timeWindow: rel.timeWindow,
        sourceUrl: rel.metadata?.sourceUrl || q.sourceUrl || 'https://leetcode.com',
        description: q.description || '',
        starterCode: q.starterCode || '',
        testCases: q.testCases || []
      };
    });

    // Apply difficulty filter
    if (difficulty && difficulty !== 'All') {
      matchedQuestions = matchedQuestions.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    // Apply topic filter
    if (topic && topic !== 'All') {
      matchedQuestions = matchedQuestions.filter(q => q.topic.toLowerCase().includes(topic.toLowerCase()));
    }

    // Apply search filter
    if (search) {
      const sLower = search.toLowerCase();
      matchedQuestions = matchedQuestions.filter(q => 
        q.title.toLowerCase().includes(sLower) || q.topic.toLowerCase().includes(sLower)
      );
    }

    res.status(200).json({
      success: true,
      company: companyObj.name,
      companyId: companyObj.id,
      count: matchedQuestions.length,
      data: matchedQuestions
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company questions: ' + err.message
    });
  }
};
