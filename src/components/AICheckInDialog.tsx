import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAICoach } from '@/hooks/useAICoach';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageCircle } from 'lucide-react';

interface AICheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: any;
  onComplete?: (responses: string[]) => void;
}

export const AICheckInDialog = ({ open, onOpenChange, goal, onComplete }: AICheckInDialogProps) => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [responses, setResponses] = useState<string[]>([]);
  const { getCheckInQuestions, loading } = useAICoach();
  const { toast } = useToast();

  useEffect(() => {
    if (open && goal) {
      loadQuestions();
    }
  }, [open, goal]);

  const loadQuestions = async () => {
    const qs = await getCheckInQuestions({
      title: goal.title,
      progress: goal.progress,
      daysSinceStart: Math.floor((Date.now() - new Date(goal.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24))
    });
    setQuestions(qs);
    setResponses(new Array(qs.length).fill(''));
  };

  const handleSubmit = () => {
    if (responses.some(r => r.trim() === '')) {
      toast({
        title: 'Incomplete Responses',
        description: 'Please answer all questions.',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Check-in Complete!',
      description: 'Your responses have been recorded.',
    });

    onComplete?.(responses);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Goal Check-In: {goal?.title}
          </DialogTitle>
          <DialogDescription>
            Answer these AI-generated questions to reflect on your progress
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question, idx) => (
              <div key={idx} className="space-y-2">
                <Label htmlFor={`q${idx}`} className="text-base font-medium">
                  {idx + 1}. {question}
                </Label>
                <Textarea
                  id={`q${idx}`}
                  value={responses[idx]}
                  onChange={(e) => {
                    const newResponses = [...responses];
                    newResponses[idx] = e.target.value;
                    setResponses(newResponses);
                  }}
                  placeholder="Your answer..."
                  rows={3}
                />
              </div>
            ))}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Complete Check-In
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
