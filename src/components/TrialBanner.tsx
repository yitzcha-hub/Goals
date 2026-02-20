import { useState, useCallback } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Leaf, Gift, Flame, X } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'goals_app_trial_banner_dismissed_date';

function getTodayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function isDismissedToday(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === getTodayKey();
  } catch {
    return false;
  }
}

function dismissForToday() {
  try {
    localStorage.setItem(STORAGE_KEY, getTodayKey());
  } catch {}
}

export const TrialBanner = () => {
  const { isTrial, trialDaysRemaining, isPremium } = useSubscription();
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(() => isDismissedToday());

  const handleClose = useCallback(() => {
    dismissForToday();
    setHidden(true);
  }, []);

  const inviteCodeLine = (
    <p className="text-sm mt-2 text-muted-foreground">
      Have an invite code?{' '}
      <a href="/pricing#invite-code" className="font-medium underline hover:no-underline text-green-700 dark:text-green-400">
        Redeem it here
      </a>
      .
    </p>
  );

  if (hidden) return null;

  // Show welcome message for premium users
  if (isPremium && !isTrial) {
    return (
      <div>
        <Alert className="border-2 border-green-500 bg-gradient-to-r from-green-50 to-lime-50 relative pr-12 mb-2">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 text-green-700 hover:bg-green-100 rounded-full"
            onClick={handleClose}
            aria-label="Dismiss for today"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Leaf className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-900">
                <span className="font-semibold">You're a Premium Member!</span>
                {' - '}Enjoy unlimited access to all features
              </AlertDescription>
            </div>
          </div>
        </Alert>
        {inviteCodeLine}
      </div>
    );
  }

  if (!isTrial || trialDaysRemaining === null) {
    // Show 7 day free trial banner for new users
    return (
      <div>
        <Alert className="border-2 border-green-500 bg-gradient-to-r from-green-50 to-lime-50 relative pr-12 mb-2">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 text-green-700 hover:bg-green-100 rounded-full"
            onClick={handleClose}
            aria-label="Dismiss for today"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gift className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-900">
                <span className="font-semibold">Your first 7 days are FREE!</span>
                {' - '}Explore all features and start achieving your goals
              </AlertDescription>
            </div>
          </div>
        </Alert>
        {inviteCodeLine}
      </div>
    );
  }

  const isExpiringSoon = trialDaysRemaining <= 3;

  return (
    <div>
      <Alert className={`border-2 relative pr-12 mb-2 ${isExpiringSoon ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-amber-50' : 'border-green-500 bg-gradient-to-r from-green-50 to-lime-50'}`}>
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 h-8 w-8 rounded-full ${isExpiringSoon ? 'text-orange-700 hover:bg-orange-100' : 'text-green-700 hover:bg-green-100'}`}
          onClick={handleClose}
          aria-label="Dismiss for today"
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isExpiringSoon ? (
              <Flame className="h-5 w-5 text-orange-600" />
            ) : (
              <Leaf className="h-5 w-5 text-green-600" />
            )}
            <AlertDescription className={isExpiringSoon ? 'text-orange-900' : 'text-green-900'}>
              <span className="font-semibold">
                {trialDaysRemaining === 0 ? 'Your free trial expires today!' : 
                 trialDaysRemaining === 1 ? 'Your free trial expires tomorrow!' :
                 `${trialDaysRemaining} days left in your 7 day free trial`}
              </span>

              {' - '}Continue your growth journey for just $4.99/month
            </AlertDescription>
          </div>
          <Button 
            onClick={() => navigate('/pricing')}
            className={isExpiringSoon ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600' : 'bg-gradient-to-r from-green-600 to-lime-500 hover:from-green-700 hover:to-lime-600'}
          >
            <Flame className="h-4 w-4 mr-2" />
            Upgrade Now
          </Button>
        </div>
      </Alert>
      {inviteCodeLine}
    </div>
  );
};
