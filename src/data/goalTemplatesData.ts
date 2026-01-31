export interface GoalTemplateData {
  id: string;
  title: string;
  description: string;
  category: 'Fitness' | 'Business' | 'Education' | 'Personal Development' | 'Finance' | 'Health';
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  popularity: number;
  icon: string;
  tasks: string[];
  milestones: string[];
  bestPractices: string[];
  estimatedTimePerWeek: string;
}

export const goalTemplatesData: GoalTemplateData[] = [
  {
    id: 'fit-1',
    title: 'Run a 5K Race',
    description: 'Build endurance to complete a 5K run without stopping',
    category: 'Fitness',
    duration: '8 weeks',
    difficulty: 'Medium',
    popularity: 3450,
    icon: 'Dumbbell',
    tasks: ['Week 1-2: Walk/jog intervals', 'Week 3-4: Increase jogging time', 'Week 5-6: Run 3K continuously', 'Week 7: Run 4K', 'Week 8: Complete 5K'],
    milestones: ['Complete 1K', 'Run 2.5K non-stop', 'Finish 4K', 'Complete 5K race'],
    bestPractices: ['Warm-up and cool-down properly', 'Increase distance by max 10% per week', 'Rest between runs', 'Stay hydrated', 'Get good running shoes'],
    estimatedTimePerWeek: '3-4 hours'
  },
  {
    id: 'fit-2',
    title: 'Lose 20 Pounds',
    description: 'Achieve healthy weight loss through diet and exercise',
    category: 'Fitness',
    duration: '16 weeks',
    difficulty: 'Hard',
    popularity: 5200,
    icon: 'Heart',
    tasks: ['Calculate calorie deficit', 'Plan weekly meal prep', 'Exercise 4-5x per week', 'Track food daily', 'Weekly weigh-ins'],
    milestones: ['Lose 5 lbs', 'Lose 10 lbs', 'Lose 15 lbs', 'Reach 20 lb goal'],
    bestPractices: ['Aim for 1-2 lbs per week', 'Focus on whole foods', 'Drink water', 'Get 7-8 hours sleep', 'Track with photos'],
    estimatedTimePerWeek: '5-7 hours'
  },
  {
    id: 'fit-3',
    title: 'Build Muscle Mass',
    description: 'Gain 10 pounds of lean muscle through strength training',
    category: 'Fitness',
    duration: '12 weeks',
    difficulty: 'Hard',
    popularity: 2890,
    icon: 'Dumbbell',
    tasks: ['Create workout plan', 'Train each muscle 2x/week', 'Post-workout protein', 'Progressive overload', 'Adequate rest'],
    milestones: ['Gain 2.5 lbs', 'Gain 5 lbs', 'Gain 7.5 lbs', 'Reach 10 lb goal'],
    bestPractices: ['Eat 300-500 calorie surplus', '1g protein per lb bodyweight', 'Compound movements', '48hr rest between groups', 'Progress photos'],
    estimatedTimePerWeek: '6-8 hours'
  },
  {
    id: 'fit-4',
    title: 'Complete a Marathon',
    description: 'Train for and finish a full 26.2 mile marathon',
    category: 'Fitness',
    duration: '20 weeks',
    difficulty: 'Hard',
    popularity: 1890,
    icon: 'Dumbbell',
    tasks: ['Build base mileage', 'Follow training plan', 'Weekly long runs', 'Practice race nutrition', 'Taper and race'],
    milestones: ['Run 10K', 'Half marathon', 'Run 20 miles', 'Finish marathon'],
    bestPractices: ['Gradual mileage increase', 'Rest and cross-train', 'Test nutrition', 'Prevent injury', 'Join running group'],
    estimatedTimePerWeek: '8-12 hours'
  },
  {
    id: 'bus-1',
    title: 'Launch a Side Business',
    description: 'Start and validate a profitable side business',
    category: 'Business',
    duration: '12 weeks',
    difficulty: 'Hard',
    popularity: 4100,
    icon: 'Briefcase',
    tasks: ['Identify idea and market', 'Create business plan', 'Build MVP', 'Set up legal/finances', 'Get first 10 customers'],
    milestones: ['Validate idea', 'Create MVP', 'First sale', 'Reach $1000 revenue'],
    bestPractices: ['Start lean', 'Talk to customers early', 'Solve real problems', 'Keep costs low', 'Consistent weekly time'],
    estimatedTimePerWeek: '10-15 hours'
  },
  {
    id: 'bus-2',
    title: 'Grow Revenue by 50%',
    description: 'Increase business revenue through strategic growth',
    category: 'Business',
    duration: '6 months',
    difficulty: 'Hard',
    popularity: 1850,
    icon: 'TrendingUp',
    tasks: ['Analyze revenue streams', 'Identify opportunities', 'Marketing campaigns', 'Optimize sales funnel', 'Expand offerings'],
    milestones: ['10% growth', '25% growth', '40% growth', '50% growth achieved'],
    bestPractices: ['High-impact focus', 'Track weekly metrics', 'Test and iterate', 'Customer retention', 'Leverage existing base'],
    estimatedTimePerWeek: '15-20 hours'
  },
  {
    id: 'fin-1',
    title: 'Save $10,000 Emergency Fund',
    description: 'Build financial security with emergency savings',
    category: 'Finance',
    duration: '12 months',
    difficulty: 'Medium',
    popularity: 4560,
    icon: 'DollarSign',
    tasks: ['Calculate monthly savings', 'Auto-transfer setup', 'Cut expenses', 'Increase income', 'Track monthly'],
    milestones: ['Save $2,500', 'Save $5,000', 'Save $7,500', 'Reach $10,000'],
    bestPractices: ['Pay yourself first', 'High-yield savings', 'Emergency use only', 'Celebrate milestones', 'Monthly budget review'],
    estimatedTimePerWeek: '2-3 hours'
  },
  {
    id: 'fin-2',
    title: 'Pay Off Credit Card Debt',
    description: 'Eliminate all credit card debt',
    category: 'Finance',
    duration: '18 months',
    difficulty: 'Hard',
    popularity: 3780,
    icon: 'DollarSign',
    tasks: ['List all debts', 'Choose payoff strategy', 'Create strict budget', 'Extra payments', 'No new charges'],
    milestones: ['Pay smallest debt', '50% eliminated', '75% paid', 'Debt-free!'],
    bestPractices: ['Debt avalanche method', 'Negotiate rates', 'Balance transfers', 'Additional income', 'Visual tracking'],
    estimatedTimePerWeek: '3-4 hours'
  }
];
