import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export function useOnboardingProgress() {
  const { user } = useAuth();

  const markStepComplete = async (step: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('onboarding_progress')
        .update({ [step]: true })
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating onboarding progress:', error);
    }
  };

  return {
    markGoalComplete: () => markStepComplete('step_1_set_goal'),
    markTaskComplete: () => markStepComplete('step_2_create_task'),
    markHabitComplete: () => markStepComplete('step_3_habit_checkin'),
    markAnalyticsComplete: () => markStepComplete('step_4_explore_analytics'),
  };
}
