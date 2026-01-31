import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

interface TourTooltipProps {
  title: string;
  description: string;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export function TourTooltip({
  title,
  description,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onClose,
  position
}: TourTooltipProps) {
  const positionClasses = {
    top: 'bottom-full mb-4',
    bottom: 'top-full mt-4',
    left: 'right-full mr-4',
    right: 'left-full ml-4'
  };

  return (
    <Card className={`absolute ${positionClasses[position]} z-50 w-80 p-4 shadow-2xl border-2 border-primary animate-in fade-in zoom-in duration-300`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-lg">{title}</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === currentStep ? 'w-8 bg-primary' : 'w-1.5 bg-muted'
              }`}
            />
          ))}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={onNext}>
            {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
            {currentStep < totalSteps - 1 && <ArrowRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      </div>
    </Card>
  );
}
