import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Calendar, Loader2 } from 'lucide-react';
import { useAICoach, AIAnalysis } from '@/hooks/useAICoach';
import { useSubscription } from '@/hooks/useSubscription';
import UpgradePrompt from './UpgradePrompt';

interface AICoachPanelProps {
  goal: any;
  onDeadlineUpdate?: (date: string) => void;
}

/** Session-scoped cache for goal analyses (avoids re-fetching on re-mount). */
const GOAL_ANALYSIS_CACHE_KEY = 'ai_goal_analysis_cache';
const GOAL_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCachedGoalAnalysis(goalId: string): AIAnalysis | null {
  try {
    const raw = sessionStorage.getItem(`${GOAL_ANALYSIS_CACHE_KEY}_${goalId}`);
    if (!raw) return null;
    const { data, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) {
      sessionStorage.removeItem(`${GOAL_ANALYSIS_CACHE_KEY}_${goalId}`);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCachedGoalAnalysis(goalId: string, data: AIAnalysis): void {
  try {
    sessionStorage.setItem(
      `${GOAL_ANALYSIS_CACHE_KEY}_${goalId}`,
      JSON.stringify({ data, expiry: Date.now() + GOAL_CACHE_TTL_MS }),
    );
  } catch {
    /* storage full — ignore */
  }
}

export const AICoachPanel = ({ goal, onDeadlineUpdate }: AICoachPanelProps) => {
  const { hasFeatureAccess } = useSubscription();
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(() =>
    getCachedGoalAnalysis(goal?.id),
  );
  const { analyzeGoal, loading } = useAICoach();
  const hasFiredRef = useRef(false);

  // Check if user has access to AI Coach
  if (!hasFeatureAccess('ai-coach')) {
    return <UpgradePrompt feature="ai-coach" />;
  }

  const handleAnalyze = useCallback(async () => {
    const result = await analyzeGoal({
      title: goal.title,
      description: goal.description,
      deadline: goal.deadline,
      progress: goal.progress,
      category: goal.category,
      daysSinceStart: Math.floor((Date.now() - new Date(goal.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24))
    });
    
    if (result) {
      setAnalysis(result);
      setCachedGoalAnalysis(goal.id, result);
    }
  }, [goal, analyzeGoal]);

  useEffect(() => {
    // Only auto-analyze once per mount cycle and only if not already cached
    if (goal && !analysis && !hasFiredRef.current) {
      hasFiredRef.current = true;
      handleAnalyze();
    }
  }, [goal?.id]);

  if (loading && !analysis) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Success Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Success Probability</span>
              <Badge variant={analysis.successProbability > 70 ? 'default' : 'secondary'}>
                {analysis.successProbability}%
              </Badge>
            </div>
            <Progress value={analysis.successProbability} className="h-2" />
          </div>
          
          <div className="p-4 bg-primary/5 rounded-lg">
            <p className="text-sm">{analysis.motivation}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Potential Obstacles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.obstacles.map((obstacle, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-orange-500 mt-0.5">•</span>
                <span>{obstacle}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Recommended Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.strategies.map((strategy, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{strategy}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {analysis.suggestedDeadline && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Smart Deadline Suggestion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Based on your progress patterns, we suggest: <strong>{analysis.suggestedDeadline}</strong>
            </p>
            {onDeadlineUpdate && (
              <Button onClick={() => onDeadlineUpdate(analysis.suggestedDeadline!)} size="sm">
                Apply Suggested Deadline
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
