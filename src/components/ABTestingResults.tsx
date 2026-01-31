import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';

interface ABTestingResultsProps {
  subscriptions: any[];
}

export function ABTestingResults({ subscriptions }: ABTestingResultsProps) {
  const calculateABTestData = () => {
    // Simulate A/B test data for different trial lengths
    const total = subscriptions.length;
    
    const sevenDayTrials = Math.floor(total * 0.4);
    const fourteenDayTrials = Math.floor(total * 0.35);
    const thirtyDayTrials = total - sevenDayTrials - fourteenDayTrials;

    return [
      {
        variant: '7-Day Trial',
        trials: sevenDayTrials,
        conversions: Math.floor(sevenDayTrials * 0.28),
        conversionRate: 28,
        avgRevenue: 42.50,
      },
      {
        variant: '14-Day Trial',
        trials: fourteenDayTrials,
        conversions: Math.floor(fourteenDayTrials * 0.35),
        conversionRate: 35,
        avgRevenue: 48.30,
      },
      {
        variant: '30-Day Trial',
        trials: thirtyDayTrials,
        conversions: Math.floor(thirtyDayTrials * 0.22),
        conversionRate: 22,
        avgRevenue: 38.90,
      },
    ];
  };

  const abTestData = calculateABTestData();
  const winner = abTestData.reduce((prev, current) => 
    current.conversionRate > prev.conversionRate ? current : prev
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>A/B Testing Results</CardTitle>
        <CardDescription>Comparing different trial length variants</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={abTestData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="variant" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="conversionRate" fill="#3b82f6" name="Conversion Rate %" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-3">
          {abTestData.map((variant, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <span className="font-medium">{variant.variant}</span>
                {variant.variant === winner.variant && (
                  <Badge variant="default">Winner</Badge>
                )}
              </div>
              <div className="flex gap-6 text-sm">
                <span>{variant.trials} trials</span>
                <span className="font-semibold text-primary">{variant.conversionRate}% conversion</span>
                <span className="text-muted-foreground">${variant.avgRevenue} avg revenue</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
