// Company Coding Dataset Controller

const companyQuestionsData = {
  google: [
    {
      id: 'goog_1',
      title: 'Two Sum & Target Array Search',
      difficulty: 'Easy',
      category: 'Data Structures',
      description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.',
      starterCode: 'function twoSum(nums, target) {\n  // Write your code here\n  return [];\n}',
      testCases: [
        { input: '[2, 7, 11, 15], 9', expectedOutput: '[0, 1]' },
        { input: '[3, 2, 4], 6', expectedOutput: '[1, 2]' }
      ]
    },
    {
      id: 'goog_2',
      title: 'Longest Substring Without Repeating Characters',
      difficulty: 'Medium',
      category: 'Sliding Window',
      description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
      starterCode: 'function lengthOfLongestSubstring(s) {\n  // Write your code here\n  return 0;\n}',
      testCases: [
        { input: '"abcabcbb"', expectedOutput: '3' },
        { input: '"bbbbb"', expectedOutput: '1' }
      ]
    }
  ],
  amazon: [
    {
      id: 'amzn_1',
      title: 'Optimal Logistics Warehouse Route',
      difficulty: 'Medium',
      category: 'Graphs & BFS',
      description: 'Find the minimum path cost between distribution centers represented as a grid.',
      starterCode: 'function minRouteCost(grid) {\n  // Write your code here\n  return 0;\n}',
      testCases: [
        { input: '[[1,3,1],[1,5,1],[4,2,1]]', expectedOutput: '7' }
      ]
    }
  ],
  microsoft: [
    {
      id: 'msft_1',
      title: 'Valid Parentheses & Expression Evaluator',
      difficulty: 'Easy',
      category: 'Stacks & Strings',
      description: 'Determine if an input string containing brackets is valid.',
      starterCode: 'function isValid(s) {\n  // Write your code here\n  return true;\n}',
      testCases: [
        { input: '"()[]{}"', expectedOutput: 'true' },
        { input: '"(]"', expectedOutput: 'false' }
      ]
    }
  ],
  meta: [
    {
      id: 'meta_1',
      title: 'Merge K Sorted Intervals',
      difficulty: 'Hard',
      category: 'Heaps & Sorting',
      description: 'Merge overlapping meeting time intervals into non-overlapping blocks.',
      starterCode: 'function mergeIntervals(intervals) {\n  // Write your code here\n  return [];\n}',
      testCases: [
        { input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]' }
      ]
    }
  ]
};

exports.getCompanies = (req, res) => {
  res.status(200).json({
    success: true,
    data: [
      { id: 'google', name: 'Google', icon: 'fa-brands fa-google', totalQuestions: 2 },
      { id: 'amazon', name: 'Amazon', icon: 'fa-brands fa-amazon', totalQuestions: 1 },
      { id: 'microsoft', name: 'Microsoft', icon: 'fa-brands fa-microsoft', totalQuestions: 1 },
      { id: 'meta', name: 'Meta', icon: 'fa-brands fa-meta', totalQuestions: 1 }
    ]
  });
};

exports.getCompanyQuestions = (req, res) => {
  const companyKey = (req.params.company || '').toLowerCase();
  const questions = companyQuestionsData[companyKey];

  if (!questions) {
    return res.status(404).json({
      success: false,
      error: `No questions found for company: ${req.params.company}`
    });
  }

  res.status(200).json({
    success: true,
    company: companyKey,
    count: questions.length,
    data: questions
  });
};
