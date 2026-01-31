import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Trophy, X, RotateCcw, Target, ListTodo, Activity, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingCelebration } from './OnboardingCelebration';

interface OnboardingProgress {
  step_1_set_goal: boolean;
  step_2_create_task: boolean;
  step_3_habit_checkin: boolean;
  step_4_explore_analytics: boolean;
  completed: boolean;
  skipped: boolean;
}

export function OnboardingChecklist() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    { id: 'step_1_set_goal', label: 'Set your first goal', icon: Target, description: 'Define what you want to achieve' },
    { id: 'step_2_create_task', label: 'Create your first task', icon: ListTodo, description: 'Break down your goal into actions' },
    { id: 'step_3_habit_checkin', label: 'Complete a habit check-in', icon: Activity, description: 'Start tracking your daily habits' },
    { id: 'step_4_explore_analytics', label: 'Explore the analytics', icon: BarChart3, description: 'View your progress insights' },
  ];

  useEffect(() => {
    if (user) {
      loadProgress();
    }
  }, [user]);

  const loadProgress = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading progress:', error);
    }

    if (!data) {
      await supabase.from('onboarding_progress').insert({ user_id: user.id });
      setProgress({
        step_1_set_goal: false,
        step_2_create_task: false,
        step_3_habit_checkin: false,
        step_4_explore_analytics: false,
        completed: false,
        skipped: false,
      });
    } else {
      setProgress(data);
      if (data.completed || data.skipped) {
        setIsVisible(false);
      }
    }
    setLoading(false);
  };

  const completedSteps = progress ? Object.keys(progress).filter(k => k.startsWith('step_') && progress[k as keyof OnboardingProgress]).length : 0;
  const progressPercent = (completedSteps / steps.length) * 100;

  const handleSkip = async () => {
    if (!user) return;
    await supabase.from('onboarding_progress').update({ skipped: true }).eq('user_id', user.id);
    setIsVisible(false);
  };

  const handleRestart = async () => {
    if (!user) return;
    const reset = {
      step_1_set_goal: false,
      step_2_create_task: false,
      step_3_habit_checkin: false,
      step_4_explore_analytics: false,
      completed: false,
      skipped: false,
    };
    await supabase.from('onboarding_progress').update(reset).eq('user_id', user.id);
    setProgress(reset);
    setIsVisible(true);
  };

  useEffect(() => {
    if (progress && completedSteps === steps.length && !progress.completed) {
      supabase.from('onboarding_progress').update({ completed: true }).eq('user_id', user?.id);
      setShowCelebration(true);
    }
  }, [completedSteps, progress]);

  if (loading || !progress || !isVisible) return null;

  return (
    <>
      <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Welcome! Complete Your Setup
            </h3>
            <p className="text-sm text-gray-600 mt-1">Get started with these quick steps</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSkip}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <Progress value={progressPercent} className="mb-4 h-2" />
        <p className="text-sm text-gray-600 mb-4">{completedSteps} of {steps.length} completed</p>

        <div className="space-y-3">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = progress[step.id as keyof OnboardingProgress];
            return (
              <div key={step.id} className={`flex items-start gap-3 p-3 rounded-lg ${isCompleted ? 'bg-green-50' : 'bg-white'}`}>
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-600" />
                    <p className={`font-medium ${isCompleted ? 'text-green-700' : 'text-gray-900'}`}>{step.label}</p>
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <Button variant="outline" size="sm" onClick={handleRestart} className="mt-4">
          <RotateCcw className="w-4 h-4 mr-2" />
          Restart Checklist
        </Button>
      </Card>

      {showCelebration && <OnboardingCelebration onClose={() => setShowCelebration(false)} />}
    </>
  );
}
