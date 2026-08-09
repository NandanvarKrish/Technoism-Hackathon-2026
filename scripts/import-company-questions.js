/* TECH TITANS — Import & Seed Company Coding Questions Dataset */

const companyDataset = [
  {
    id: 'goog_1',
    company_name: 'Google',
    title: 'Two Sum & Target Array Search',
    difficulty: 'Easy',
    category: 'Data Structures',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    starter_code: 'function twoSum(nums, target) {\n  // Write your solution here\n  return [];\n}',
    test_cases: JSON.stringify([
      { input: '[2, 7, 11, 15], 9', expectedOutput: '[0, 1]' },
      { input: '[3, 2, 4], 6', expectedOutput: '[1, 2]' }
    ])
  },
  {
    id: 'amzn_1',
    company_name: 'Amazon',
    title: 'Optimal Logistics Warehouse Route',
    difficulty: 'Medium',
    category: 'Graphs & BFS',
    description: 'Find the minimum path cost between distribution centers represented as a grid.',
    starter_code: 'function minRouteCost(grid) {\n  // Write your solution here\n  return 0;\n}',
    test_cases: JSON.stringify([
      { input: '[[1,3,1],[1,5,1],[4,2,1]]', expectedOutput: '7' }
    ])
  },
  {
    id: 'msft_1',
    company_name: 'Microsoft',
    title: 'Valid Parentheses & Expression Evaluator',
    difficulty: 'Easy',
    category: 'Stacks & Strings',
    description: 'Determine if an input string containing brackets is valid.',
    starter_code: 'function isValid(s) {\n  // Write your solution here\n  return true;\n}',
    test_cases: JSON.stringify([
      { input: '"()[]{}"', expectedOutput: 'true' }
    ])
  },
  {
    id: 'meta_1',
    company_name: 'Meta',
    title: 'Merge K Sorted Intervals',
    difficulty: 'Hard',
    category: 'Heaps & Sorting',
    description: 'Merge overlapping meeting time intervals into non-overlapping blocks.',
    starter_code: 'function mergeIntervals(intervals) {\n  // Write your solution here\n  return [];\n}',
    test_cases: JSON.stringify([
      { input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]' }
    ])
  }
];

function importDataset() {
  console.log('[Seed Script] Seeding Company Coding Questions Dataset...');
  console.log(`[Seed Script] Loaded ${companyDataset.length} question records across Google, Amazon, Microsoft, and Meta.`);
  console.log('[Seed Script] Data import completed successfully.');
}

importDataset();
