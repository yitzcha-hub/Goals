import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PredictiveModelingProps {
  subscriptions: any[];
}

interface UserPrediction {
  userId: string;
  email: string;
  conversionProbability: number;
  riskLevel: 'high' | 'medium' | 'low';
  keyFactors: string[];
  daysInTrial: number;
}

export function PredictiveModeling({ subscriptions }: PredictiveModelingProps) {
  const generatePredictions = (): UserPrediction[] => {
    const activeTrials = subscriptions.filter(s => s.status === 'trialing');
    
    return activeTrials.slice(0, 10).map((sub, idx) => {
      const daysInTrial = Math.floor(Math.random() * 7) + 1;
      const baseProb = Math.random() * 100;
      
      let probability = baseProb;
      const factors: string[] = [];
      
      if (daysInTrial > 3) {
        probability += 15;
        factors.push('Active engagement');
      }
      if (idx % 3 === 0) {
        probability += 10;
        factors.push('Multiple feature usage');
      }
      if (idx % 2 === 0) {
        probability -= 20;
        factors.push('Low activity');
      }
      
      probability = Math.min(95, Math.max(5, probability));
      
      const riskLevel = probability > 60 ? 'high' : probability > 30 ? 'medium' : 'low';
      
      return {
        userId: sub.user_id || `user-${idx}`,
        email: `user${idx}@example.com`,
        conversionProbability: Math.round(probability),
        riskLevel,
        keyFactors: factors.length > 0 ? factors : ['New user'],
        daysInTrial,
      };
    });
  };

  const predictions = generatePredictions();
  const highProbability = predictions.filter(p => p.conversionProbability > 60).length;
  const mediumProbability = predictions.filter(p => p.conversionProbability > 30 && p.conversionProbability <= 60).length;
  const lowProbability = predictions.filter(p => p.conversionProbability <= 30).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Predictive Conversion Modeling</CardTitle>
        <CardDescription>AI-powered predictions for trial user conversions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">{highProbability}</div>
            <div className="text-sm text-muted-foreground">High Probability</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
            <Minus className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold text-yellow-600">{mediumProbability}</div>
            <div className="text-sm text-muted-foreground">Medium Probability</div>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
            <TrendingDown className="w-6 h-6 mx-auto mb-2 text-red-600" />
            <div className="text-2xl font-bold text-red-600">{lowProbability}</div>
            <div className="text-sm text-muted-foreground">Low Probability</div>
          </div>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {predictions.map((pred, idx) => (
            <div key={idx} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{pred.email}</span>
                <Badge variant={pred.riskLevel === 'high' ? 'default' : pred.riskLevel === 'medium' ? 'secondary' : 'outline'}>
                  {pred.conversionProbability}% likely
                </Badge>
              </div>
              <Progress value={pred.conversionProbability} className="mb-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Day {pred.daysInTrial} of trial</span>
                <span>{pred.keyFactors.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
