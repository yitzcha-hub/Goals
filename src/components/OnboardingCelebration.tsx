import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Sparkles, CheckCircle } from 'lucide-react';

interface OnboardingCelebrationProps {
  onClose: () => void;
}

export function OnboardingCelebration({ onClose }: OnboardingCelebrationProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center py-6">
          <div className="relative inline-block mb-6">
            <Trophy className="w-24 h-24 text-yellow-500 animate-bounce" />
            <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
            <Sparkles className="w-6 h-6 text-yellow-400 absolute -bottom-1 -left-1 animate-pulse" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Congratulations! 🎉
          </h2>
          
          <p className="text-lg text-gray-600 mb-6">
            You've completed the onboarding checklist and unlocked all features!
          </p>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="font-semibold text-gray-900">Achievement Unlocked</p>
            </div>
            <p className="text-sm text-gray-600">
              "Quick Starter" - Complete onboarding in record time
            </p>
          </div>

          <div className="space-y-2 text-left mb-6">
            <p className="text-sm text-gray-700">✅ Set your first goal</p>
            <p className="text-sm text-gray-700">✅ Created your first task</p>
            <p className="text-sm text-gray-700">✅ Completed a habit check-in</p>
            <p className="text-sm text-gray-700">✅ Explored the analytics</p>
          </div>

          <Button onClick={onClose} className="w-full" size="lg">
            Start Your Journey
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
