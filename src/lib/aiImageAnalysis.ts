export interface AIInsight {
  category: 'progress' | 'technique' | 'composition' | 'comparison';
  confidence: number;
  message: string;
  icon: string;
}

export interface AIAnalysisResult {
  overallProgress: number;
  insights: AIInsight[];
  detectedChanges: string[];
}

// Simulates AI-powered image analysis based on goal type and progress
export function analyzeProgressImage(
  imageUrl: string,
  progress: number,
  goalType: string,
  previousImages?: { url: string; progress: number }[]
): AIAnalysisResult {
  const insights: AIInsight[] = [];
  const detectedChanges: string[] = [];

  // Fitness-related analysis
  if (goalType.toLowerCase().includes('fitness') || goalType.toLowerCase().includes('weight') || goalType.toLowerCase().includes('workout')) {
    if (progress >= 25) {
      insights.push({
        category: 'progress',
        confidence: 0.87,
        message: 'Visible progress in upper body definition',
        icon: '💪'
      });
      detectedChanges.push('Muscle tone improvement detected');
    }
    if (progress >= 50) {
      insights.push({
        category: 'progress',
        confidence: 0.92,
        message: 'Significant body composition changes observed',
        icon: '🎯'
      });
      detectedChanges.push('Posture improvement noted');
    }
    if (progress >= 75) {
      insights.push({
        category: 'comparison',
        confidence: 0.95,
        message: 'Remarkable transformation from starting point',
        icon: '⭐'
      });
    }
  }

  // Project/Construction analysis
  if (goalType.toLowerCase().includes('project') || goalType.toLowerCase().includes('build') || goalType.toLowerCase().includes('construction')) {
    const estimatedCompletion = Math.min(progress + 10, 100);
    insights.push({
      category: 'progress',
      confidence: 0.89,
      message: `Project approximately ${estimatedCompletion}% complete based on visual analysis`,
      icon: '🏗️'
    });
    
    if (progress >= 30) {
      detectedChanges.push('Foundation work completed');
      insights.push({
        category: 'composition',
        confidence: 0.84,
        message: 'Structural elements properly aligned',
        icon: '📐'
      });
    }
  }

  // Creative/Skill analysis
  if (goalType.toLowerCase().includes('art') || goalType.toLowerCase().includes('skill') || goalType.toLowerCase().includes('learn')) {
    insights.push({
      category: 'technique',
      confidence: 0.81,
      message: 'Noticeable improvement in technique and execution',
      icon: '🎨'
    });
    
    if (progress >= 40) {
      detectedChanges.push('Enhanced detail work observed');
      insights.push({
        category: 'progress',
        confidence: 0.88,
        message: 'Advanced techniques being applied effectively',
        icon: '✨'
      });
    }
  }

  // Comparison with previous images
  if (previousImages && previousImages.length > 0) {
    const progressDelta = progress - previousImages[previousImages.length - 1].progress;
    if (progressDelta >= 20) {
      insights.push({
        category: 'comparison',
        confidence: 0.90,
        message: `Accelerated progress: ${progressDelta}% improvement since last photo`,
        icon: '📈'
      });
    }
  }

  // General progress insights
  if (progress >= 80) {
    insights.push({
      category: 'progress',
      confidence: 0.93,
      message: 'Nearing completion - consistency is evident',
      icon: '🏆'
    });
  }

  return {
    overallProgress: Math.min(progress + Math.floor(Math.random() * 10), 100),
    insights,
    detectedChanges
  };
}
