// Analytics utility functions for goal tracking and predictions

export interface Goal {
  id: number;
  title: string;
  progress: number;
  category: string;
  dueDate: string;
  createdAt: string;
  timeSpent?: number;
}

export const calculateCompletionRate = (goals: Goal[]): number => {
  if (goals.length === 0) return 0;
  const completed = goals.filter(g => g.progress >= 100).length;
  return (completed / goals.length) * 100;
};

export const predictCompletionDate = (goal: Goal, progressHistory: number[]): string => {
  if (progressHistory.length < 2) return 'Insufficient data';
  
  const avgGrowth = progressHistory.reduce((sum, val, i) => {
    if (i === 0) return 0;
    return sum + (val - progressHistory[i - 1]);
  }, 0) / (progressHistory.length - 1);
  
  if (avgGrowth <= 0) return 'No progress trend';
  
  const remainingProgress = 100 - goal.progress;
  const daysToComplete = Math.ceil(remainingProgress / avgGrowth);
  
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + daysToComplete);
  
  return completionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const calculateTimeEfficiency = (goal: Goal, avgTimeForCategory: number): string => {
  if (!goal.timeSpent) return 'N/A';
  
  const efficiency = (avgTimeForCategory / goal.timeSpent) * 100;
  
  if (efficiency > 120) return 'Highly Efficient';
  if (efficiency > 100) return 'Above Average';
  if (efficiency > 80) return 'Average';
  return 'Below Average';
};

export const generateInsights = (goals: Goal[] = []): Array<{type: string; title: string; description: string}> => {
  const insights = [];
  
  if (goals.length === 0) {
    return [{
      type: 'warning',
      title: 'No Goals Yet',
      description: 'Start by creating your first goal to track your progress!'
    }];
  }
  
  const completionRate = calculateCompletionRate(goals);
  if (completionRate > 75) {
    insights.push({
      type: 'positive',
      title: 'Excellent Progress',
      description: `You're completing ${completionRate.toFixed(0)}% of your goals - keep it up!`
    });
  }
  
  const stagnantGoals = goals.filter(g => g.progress < 30 && g.progress > 0);
  if (stagnantGoals.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Stagnant Goals Detected',
      description: `${stagnantGoals.length} goals need attention to get back on track`
    });
  }
  
  return insights.length > 0 ? insights : [{
    type: 'positive',
    title: 'Getting Started',
    description: 'Keep tracking your goals to unlock personalized insights!'
  }];
};

