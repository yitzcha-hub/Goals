import { TaggedImage } from '../components/VisualProgressTimeline';

export interface MilestoneSuggestion {
  id: string;
  title: string;
  targetProgress: number;
  targetDate: Date;
  description: string;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
}

export interface NextStepSuggestion {
  id: string;
  action: string;
  impact: string;
  timeframe: string;
}

export interface CompletionPrediction {
  predictedDate: Date;
  confidence: number;
  daysRemaining: number;
  progressRate: number; // % per day
  trend: 'accelerating' | 'steady' | 'slowing';
}

export interface AIMilestoneAnalysis {
  milestones: MilestoneSuggestion[];
  nextSteps: NextStepSuggestion[];
  prediction: CompletionPrediction;
  insights: string[];
}

export function analyzeAndSuggestMilestones(
  goalType: string,
  currentProgress: number,
  targetValue: number,
  startDate: Date,
  images: TaggedImage[]
): AIMilestoneAnalysis {
  const progressRate = calculateProgressRate(currentProgress, startDate);
  const prediction = predictCompletion(currentProgress, progressRate, targetValue);
  const milestones = generateMilestones(goalType, currentProgress, targetValue, prediction.predictedDate);
  const nextSteps = generateNextSteps(goalType, currentProgress, images, progressRate);
  const insights = generateInsights(goalType, currentProgress, progressRate, images, prediction);

  return { milestones, nextSteps, prediction, insights };
}

function calculateProgressRate(currentProgress: number, startDate: Date): number {
  const daysSinceStart = Math.max(1, (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return currentProgress / daysSinceStart;
}

function predictCompletion(
  currentProgress: number,
  progressRate: number,
  targetValue: number
): CompletionPrediction {
  const remainingProgress = targetValue - currentProgress;
  const daysRemaining = Math.ceil(remainingProgress / Math.max(0.1, progressRate));
  const predictedDate = new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000);
  
  const trend = progressRate > 1.5 ? 'accelerating' : progressRate > 0.5 ? 'steady' : 'slowing';
  const confidence = Math.min(95, 60 + (progressRate * 10));

  return { predictedDate, confidence, daysRemaining, progressRate, trend };
}

function generateMilestones(
  goalType: string,
  currentProgress: number,
  targetValue: number,
  predictedDate: Date
): MilestoneSuggestion[] {
  const milestones: MilestoneSuggestion[] = [];
  const checkpoints = [25, 50, 75, 90, 100];
  
  checkpoints.forEach((checkpoint, index) => {
    if (checkpoint > currentProgress) {
      const daysUntil = Math.ceil((checkpoint - currentProgress) / 0.8);
      const targetDate = new Date(Date.now() + daysUntil * 24 * 60 * 60 * 1000);
      
      milestones.push({
        id: `milestone-${checkpoint}`,
        title: getMilestoneTitle(goalType, checkpoint),
        targetProgress: checkpoint,
        targetDate,
        description: getMilestoneDescription(goalType, checkpoint),
        reasoning: getMilestoneReasoning(checkpoint, daysUntil),
        priority: checkpoint <= 50 ? 'high' : checkpoint <= 75 ? 'medium' : 'low'
      });
    }
  });

  return milestones.slice(0, 3);
}

function getMilestoneTitle(goalType: string, progress: number): string {
  const category = goalType.toLowerCase();
  if (category.includes('fitness') || category.includes('health')) {
    if (progress === 25) return 'Foundation Built';
    if (progress === 50) return 'Halfway Transformation';
    if (progress === 75) return 'Advanced Progress';
    if (progress === 90) return 'Peak Performance';
    return 'Goal Achieved';
  } else if (category.includes('project') || category.includes('construction')) {
    if (progress === 25) return 'Initial Phase Complete';
    if (progress === 50) return 'Midpoint Milestone';
    if (progress === 75) return 'Final Phase';
    if (progress === 90) return 'Near Completion';
    return 'Project Complete';
  }
  return `${progress}% Milestone`;
}

function getMilestoneDescription(goalType: string, progress: number): string {
  const category = goalType.toLowerCase();
  if (category.includes('fitness')) {
    if (progress === 25) return 'Establish consistent routine and see initial results';
    if (progress === 50) return 'Significant visible changes and strength gains';
    if (progress === 75) return 'Advanced techniques and refined physique';
  } else if (category.includes('project')) {
    if (progress === 25) return 'Core structure and foundation established';
    if (progress === 50) return 'Major components completed and integrated';
    if (progress === 75) return 'Final details and quality assurance';
  }
  return `Reach ${progress}% completion with measurable progress`;
}

function getMilestoneReasoning(progress: number, daysUntil: number): string {
  return `Based on your current pace, this milestone is achievable in ${daysUntil} days. This checkpoint will help maintain momentum.`;
}

function generateNextSteps(
  goalType: string,
  currentProgress: number,
  images: TaggedImage[],
  progressRate: number
): NextStepSuggestion[] {
  const steps: NextStepSuggestion[] = [];
  const category = goalType.toLowerCase();

  if (category.includes('fitness')) {
    if (currentProgress < 30) {
      steps.push({
        id: 'step-1',
        action: 'Increase workout intensity by 15%',
        impact: 'Accelerate muscle development and strength gains',
        timeframe: 'Next 2 weeks'
      });
    }
    steps.push({
      id: 'step-2',
      action: 'Take weekly progress photos',
      impact: 'Better track visual changes and stay motivated',
      timeframe: 'Ongoing'
    });
    if (images.length < 3) {
      steps.push({
        id: 'step-3',
        action: 'Upload comparison photos',
        impact: 'AI can provide more accurate progress analysis',
        timeframe: 'This week'
      });
    }
  } else if (category.includes('project')) {
    steps.push({
      id: 'step-1',
      action: 'Complete next major component',
      impact: 'Maintain steady progress toward completion',
      timeframe: 'Next 7 days'
    });
    steps.push({
      id: 'step-2',
      action: 'Document current stage with photos',
      impact: 'Track progress and identify potential issues early',
      timeframe: 'This week'
    });
  }

  return steps;
}

function generateInsights(
  goalType: string,
  currentProgress: number,
  progressRate: number,
  images: TaggedImage[],
  prediction: CompletionPrediction
): string[] {
  const insights: string[] = [];

  if (prediction.trend === 'accelerating') {
    insights.push('🚀 Your progress is accelerating! Keep up the excellent momentum.');
  } else if (prediction.trend === 'slowing') {
    insights.push('⚠️ Progress has slowed. Consider adjusting your approach or timeline.');
  } else {
    insights.push('📈 Maintaining steady progress. Consistency is key to success.');
  }

  if (images.length >= 3) {
    insights.push('📸 Great job documenting progress! Visual tracking enhances motivation.');
  } else {
    insights.push('💡 Upload more photos to unlock detailed AI progress analysis.');
  }

  if (currentProgress >= 50) {
    insights.push('🎯 Halfway there! The hardest part is behind you.');
  }

  if (progressRate > 1.0) {
    insights.push('⚡ Above-average progress rate. You may finish ahead of schedule!');
  }

  return insights;
}
