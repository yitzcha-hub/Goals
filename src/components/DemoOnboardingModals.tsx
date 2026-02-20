import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  OCCUPATIONS,
  ASPIRATION_PRESETS,
  generateRecommendedGoals,
  type DemoGoalGenerated,
} from '@/data/demoOnboardingMockData';
import { Loader2, Target, Calendar, DollarSign, ListChecks, Sparkles } from 'lucide-react';

const timelineLabels: Record<string, string> = {
  '30': '30 Days',
  '60': '60 Days',
  '90': '90 Days',
  '1year': '1 Year',
  '5year': '5 Year Plan',
};

const GENERATING_MESSAGES = [
  'Analyzing your occupation and aspiration...',
  'Generating personalized goals and steps...',
  'Almost there...',
];

export type OnboardingStep = 'occupation' | 'aspiration' | 'plan-choice' | 'recommended-result' | null;

interface DemoOnboardingModalsProps {
  open: boolean;
  onClose: () => void;
  onCompleteWithOwnPlan: () => void;
  onCompleteWithRecommended: (goals: DemoGoalGenerated[]) => void;
  /** When provided (e.g. Dashboard), use OpenAI to generate goals instead of mock. */
  onRecommendRequest?: (occupation: string, aspiration: string, description: string) => Promise<DemoGoalGenerated[]>;
  /** Label for the accept button when goals are generated (e.g. "Add these to my goals" for Dashboard, "Add these to my demo" for demo page). */
  acceptButtonLabel?: string;
}

export function DemoOnboardingModals({
  open,
  onClose,
  onCompleteWithOwnPlan,
  onCompleteWithRecommended,
  onRecommendRequest,
  acceptButtonLabel = 'Add these to my goals',
}: DemoOnboardingModalsProps) {
  const [step, setStep] = useState<OnboardingStep>('occupation');
  const [occupation, setOccupation] = useState('');
  const [whatYouDo, setWhatYouDo] = useState('');
  const [aspiration, setAspiration] = useState('');
  const [aspirationCustom, setAspirationCustom] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [generatedGoals, setGeneratedGoals] = useState<DemoGoalGenerated[]>([]);
  const [recommendError, setRecommendError] = useState<string | null>(null);

  useEffect(() => {
    if (!isGenerating) {
      setGeneratingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setGeneratingStep((s) => (s < GENERATING_MESSAGES.length - 1 ? s + 1 : s));
    }, 1500);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const aspirationOptions = useMemo(
    () => (occupation ? ASPIRATION_PRESETS[occupation] ?? ASPIRATION_PRESETS.other : []),
    [occupation]
  );

  const handleNextFromOccupation = () => {
    if (occupation) setStep('aspiration');
  };

  const handleNextFromAspiration = () => {
    const asp = aspiration || aspirationCustom.trim();
    if (asp) setStep('plan-choice');
  };

  const handleRecommend = async () => {
    const asp = aspiration || aspirationCustom.trim();
    if (!asp) return;
    const fullDescription = [description, whatYouDo].filter(Boolean).join('. ');
    setIsGenerating(true);
    setRecommendError(null);
    setStep('recommended-result');
    try {
      if (onRecommendRequest) {
        const goals = await onRecommendRequest(occupation || 'other', asp, fullDescription);
        setGeneratedGoals(goals ?? []);
      } else {
        const goals = generateRecommendedGoals(occupation || 'other', asp, fullDescription);
        setGeneratedGoals(goals);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to generate goals. Check your API key and try again.';
      setRecommendError(message);
      setGeneratedGoals([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOwnPlan = () => {
    onCompleteWithOwnPlan();
    onClose();
  };

  const handleAcceptRecommended = () => {
    onCompleteWithRecommended(generatedGoals);
    onClose();
  };

  const handleClose = () => {
    setStep('occupation');
    setOccupation('');
    setWhatYouDo('');
    setAspiration('');
    setAspirationCustom('');
    setDescription('');
    setGeneratedGoals([]);
    onClose();
  };

  if (!open) return null;

  // Step 1: Occupation
  if (step === 'occupation') {
    return (
      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>What is your current occupation?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Select occupation</Label>
              <Select value={occupation} onValueChange={setOccupation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select occupation" />
                </SelectTrigger>
                <SelectContent>
                  {OCCUPATIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>What you do (optional)</Label>
              <Input
                placeholder="e.g. Software engineer, ICU nurse, Field sales"
                value={whatYouDo}
                onChange={(e) => setWhatYouDo(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleNextFromOccupation} disabled={!occupation}>
              Next
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Step 2: Aspiration + description
  if (step === 'aspiration') {
    return (
      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>What do you want to become or do?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {aspirationOptions.length > 0 && (
              <div className="space-y-2">
                <Label>Choose one or type your own below</Label>
                <Select value={aspiration} onValueChange={setAspiration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select aspiration" />
                  </SelectTrigger>
                  <SelectContent>
                    {aspirationOptions.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {(!aspirationOptions.length || aspiration === '') && (
              <div className="space-y-2">
                <Label>What do you want to become or do?</Label>
                <Input
                  placeholder="e.g. Land my dream job, Start a business"
                  value={aspirationCustom}
                  onChange={(e) => setAspirationCustom(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Description of your intended actions (optional)</Label>
              <Textarea
                placeholder="A few words about how you plan to get there..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStep('occupation')}>Back</Button>
            <Button
              onClick={handleNextFromAspiration}
              disabled={!aspiration && !aspirationCustom.trim()}
            >
              Next
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Step 3: Plan choice
  if (step === 'plan-choice') {
    return (
      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Do you have your own plan, or would you like us to recommend one?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            We can generate goals and steps (with suggested dates and costs) based on what you told us.
          </p>
          <div className="flex flex-col gap-3 py-2">
            <Button variant="outline" className="w-full justify-center" onClick={handleOwnPlan}>
              I have my own plan
            </Button>
            <Button className="w-full justify-center" onClick={handleRecommend}>
              <Sparkles className="h-4 w-4 mr-2" />
              Recommend a plan for me
            </Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setStep('aspiration')}>Back</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Step 4: Recommended result (loading or list of goals)
  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Your recommended plan</DialogTitle>
        </DialogHeader>
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-12 gap-6">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-center">{GENERATING_MESSAGES[generatingStep]}</p>
            <Progress value={((generatingStep + 1) / GENERATING_MESSAGES.length) * 100} className="w-full max-w-xs h-2" />
          </div>
        ) : recommendError ? (
          <div className="py-6 text-center">
            <p className="text-sm text-destructive font-medium">{recommendError}</p>
            <p className="text-xs text-muted-foreground mt-2">Set VITE_OPENAI_API_KEY in .env to use AI recommendations.</p>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            {generatedGoals.map((goal) => (
              <div
                key={goal.id}
                className="rounded-lg border p-4 space-y-3 bg-card"
              >
                <div className="flex gap-4">
                  {goal.image && (
                    <img
                      src={goal.image}
                      alt=""
                      className="w-24 h-24 object-cover rounded-md shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg">{goal.title}</h3>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs px-2 py-1 rounded bg-muted">
                        {timelineLabels[goal.timeline] || goal.timeline}
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-muted">{goal.priority}</span>
                      {goal.budget > 0 && (
                        <span className="text-xs px-2 py-1 rounded bg-muted flex items-center gap-1">
                          <DollarSign className="h-3 w-3" /> Budget: ${goal.budget}
                        </span>
                      )}
                      <span className="text-xs px-2 py-1 rounded bg-muted flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Deadline: {new Date(goal.targetDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                    <ListChecks className="h-4 w-4" /> Steps
                  </h4>
                  <ul className="space-y-1.5 text-sm">
                    {goal.steps.map((s) => (
                      <li key={s.id} className="flex justify-between gap-2">
                        <span>{s.title}</span>
                        <span className="text-muted-foreground shrink-0">
                          {s.predictDate && new Date(s.predictDate).toLocaleDateString()}
                          {s.predictPrice != null && s.predictPrice > 0 && ` · $${s.predictPrice}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
        {!isGenerating && generatedGoals.length > 0 && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleAcceptRecommended}>
              <Target className="h-4 w-4 mr-2" />
              {acceptButtonLabel}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
