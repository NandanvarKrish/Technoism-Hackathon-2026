/* TECH TITANS — Import & Normalize Company-Wise Coding Questions Dataset */

const fs = require('fs');
const path = require('path');

// Raw Company Questions Dataset (leetcode-company-wise-problems structure)
const rawDataset = [
  // Google
  { company: 'Google', title: 'Two Sum', difficulty: 'Easy', topic: 'Array & Hash Table', timeWindow: '6 Months', sourceUrl: 'https://leetcode.com/problems/two-sum/' },
  { company: 'Google', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', topic: 'Sliding Window', timeWindow: '6 Months', sourceUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
  { company: 'Google', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', topic: 'Binary Search', timeWindow: '1 Year', sourceUrl: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
  { company: 'Google', title: 'Container With Most Water', difficulty: 'Medium', topic: 'Two Pointers', timeWindow: '6 Months', sourceUrl: 'https://leetcode.com/problems/container-with-most-water/' },
  { company: 'Google', title: 'Word Ladder', difficulty: 'Hard', topic: 'Breadth-First Search', timeWindow: '2 Years', sourceUrl: 'https://leetcode.com/problems/word-ladder/' },

  // Amazon
  { company: 'Amazon', title: 'Two Sum', difficulty: 'Easy', topic: 'Array & Hash Table', timeWindow: '6 Months', sourceUrl: 'https://leetcode.com/problems/two-sum/' }, // Intentional Duplicate to test deduplication
  { company: 'Amazon', title: 'LRU Cache', difficulty: 'Medium', topic: 'Design & Linked List', timeWindow: '6 Months', sourceUrl: 'https://leetcode.com/problems/lru-cache/' },
  { company: 'Amazon', title: 'Number of Islands', difficulty: 'Medium', topic: 'Depth-First Search', timeWindow: '6 Months', sourceUrl: 'https://leetcode.com/problems/number-of-islands/' },
  { company: 'Amazon', title: 'Trapping Rain Water', difficulty: 'Hard', topic: 'Two Pointers & Stack', timeWindow: '1 Year', sourceUrl: 'https://leetcode.com/problems/trapping-rain-water/' },
  { company: 'Amazon', title: 'Reorganize String', difficulty: 'Medium', topic: 'Heap & Greedy', timeWindow: '6 Months', sourceUrl: 'https://leetcode.com/problems/reorganize-string/' },

  // Microsoft
  { company: 'Microsoft', title: 'Valid Parentheses', difficulty: 'Easy', topic: 'Stack', timeWindow: '6 Months', sourceUrl: 'https://leetcode.com/problems/valid-parentheses/' },
  { company: 'Microsoft', title: 'Spiral Matrix', difficulty: 'Medium', topic: 'Matrix', timeWindow: '6 Months', sourceUrl: 'https://leetcode.com/problems/spiral-matrix/' },
  { company: 'Microsoft', title: 'Search in Rotated Sorted Array', difficulty: 'Medium', topic: 'Binary Search', timeWindow: '1 Year', sourceUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
  { company: 'Microsoft', title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', topic: 'Tree & Design', timeWindow: '2 Years', sourceUrl: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/' },

  // Meta
  { company: 'Meta', title: 'Merge Intervals', difficulty: 'Medium', topic: 'Sorting & Array', timeWindow: '6 Months', sourceUrl: 'https://leetcode.com/problems/merge-intervals/' },
  { company: 'Meta', title: 'Minimum Remove to Make Valid Parentheses', difficulty: 'Medium', topic: 'Stack & String', timeWindow: '6 Months', sourceUrl: 'https://leetcode.com/problems/minimum-remove-to-make-valid-parentheses/' },
  { company: 'Meta', title: 'Subarray Sum Equals K', difficulty: 'Medium', topic: 'Prefix Sum & Hash Table', timeWindow: '1 Year', sourceUrl: 'https://leetcode.com/problems/subarray-sum-equals-k/' },
  { company: 'Meta', title: 'Binary Tree Right Side View', difficulty: 'Medium', topic: 'Tree & BFS', timeWindow: '6 Months', sourceUrl: 'https://leetcode.com/problems/binary-tree-right-side-view/' },

  // Apple
  { company: 'Apple', title: 'Reverse Linked List', difficulty: 'Easy', topic: 'Linked List', timeWindow: '6 Months', sourceUrl: 'https://leetcode.com/problems/reverse-linked-list/' },
  { company: 'Apple', title: 'Product of Array Except Self', difficulty: 'Medium', topic: 'Array & Prefix Sum', timeWindow: '6 Months', sourceUrl: 'https://leetcode.com/problems/product-of-array-except-self/' },

  // Netflix
  { company: 'Netflix', title: 'Group Anagrams', difficulty: 'Medium', topic: 'Hash Table & String', timeWindow: '1 Year', sourceUrl: 'https://leetcode.com/problems/group-anagrams/' },
  { company: 'Netflix', title: 'Design Underground System', difficulty: 'Medium', topic: 'Design & Hash Table', timeWindow: '1 Year', sourceUrl: 'https://leetcode.com/problems/design-underground-system/' }
];

// Starter Code & Descriptions Template Generator
function generateProblemTemplate(title, difficulty, topic) {
  const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '');
  const funcName = cleanTitle.charAt(0).toLowerCase() + cleanTitle.slice(1);
  return {
    description: `Given problem requirements for "${title}" (${topic}). Implement an optimal algorithmic solution.`,
    starterCode: `function ${funcName}(input) {\n  // Write your solution for ${title} here\n  return input;\n}`,
    testCases: [
      { input: 'Sample Input 1', expectedOutput: 'Expected Output 1' },
      { input: 'Sample Input 2', expectedOutput: 'Expected Output 2' }
    ]
  };
}

function processAndImportDataset() {
  console.log('=== IMPORTING & DEDUPLICATING COMPANY-WISE CODING DATASET ===\n');

  const companiesMap = {};
  const questionsMap = {};
  const relations = [];

  let rawCount = rawDataset.length;
  let duplicateCount = 0;
  const seenCompanyQuestionPairs = new Set();

  rawDataset.forEach((item, index) => {
    const companyName = item.company.trim();
    const companySlug = companyName.toLowerCase();
    const titleKey = item.title.trim().toLowerCase();
    const relationKey = `${companySlug}::${titleKey}`;

    if (seenCompanyQuestionPairs.has(relationKey)) {
      duplicateCount++;
      return;
    }
    seenCompanyQuestionPairs.add(relationKey);

    // 1. Company Table Record
    if (!companiesMap[companySlug]) {
      companiesMap[companySlug] = {
        id: companySlug,
        name: companyName,
        questionCount: 0
      };
    }

    // 2. Question Table Record
    const questionId = `q_${titleKey.replace(/[^a-z0-9]/g, '_')}`;
    if (!questionsMap[questionId]) {
      const template = generateProblemTemplate(item.title, item.difficulty, item.topic);
      questionsMap[questionId] = {
        id: questionId,
        title: item.title,
        difficulty: item.difficulty,
        topic: item.topic,
        sourceUrl: item.sourceUrl,
        description: template.description,
        starterCode: template.starterCode,
        testCases: template.testCases
      };
    }

    // 3. Relation Table Record
    companiesMap[companySlug].questionCount++;
    relations.push({
      id: `rel_${companySlug}_${questionId}`,
      companyId: companySlug,
      companyName: companyName,
      questionId: questionId,
      timeWindow: item.timeWindow || 'All Time',
      metadata: {
        difficulty: item.difficulty,
        topic: item.topic,
        sourceUrl: item.sourceUrl
      }
    });
  });

  const companiesList = Object.values(companiesMap);
  const questionsList = Object.values(questionsMap);

  console.log(`Raw Dataset Records Processed: ${rawCount}`);
  console.log(`Duplicates Removed:           ${duplicateCount}`);
  console.log(`Unique Companies Registered:  ${companiesList.length}`);
  console.log(`Unique Coding Questions:      ${questionsList.length}`);
  console.log(`Company-Question Relations:   ${relations.length}\n`);

  const outputPayload = {
    updatedAt: new Date().toISOString(),
    companies: companiesList,
    questions: questionsList,
    relations: relations
  };

  const outputDir = path.join(__dirname, '../data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'company-questions-normalized.json');
  fs.writeFileSync(outputPath, JSON.stringify(outputPayload, null, 2));
  console.log(`✅ Normalized Dataset persisted to: ${outputPath}`);

  return outputPayload;
}

if (require.main === module) {
  processAndImportDataset();
}

module.exports = { processAndImportDataset };
