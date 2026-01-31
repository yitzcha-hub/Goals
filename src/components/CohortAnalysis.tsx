import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CohortAnalysisProps {
  subscriptions: any[];
}

export function CohortAnalysis({ subscriptions }: CohortAnalysisProps) {
  const calculateCohortData = () => {
    const now = new Date();
    const cohorts = [];

    for (let i = 5; i >= 0; i--) {
      const cohortMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const cohortSubs = subscriptions.filter(s => {
        const created = new Date(s.created_at);
        return created >= cohortMonth && created < nextMonth;
      });

      const totalTrials = cohortSubs.length;
      const converted = cohortSubs.filter(s => s.status === 'active' && !s.trial_end).length;
      const conversionRate = totalTrials > 0 ? (converted / totalTrials) * 100 : 0;

      cohorts.push({
        month: cohortMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        trials: totalTrials,
        conversions: converted,
        conversionRate: parseFloat(conversionRate.toFixed(1)),
      });
    }

    return cohorts;
  };

  const cohortData = calculateCohortData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cohort Analysis</CardTitle>
        <CardDescription>Trial conversion rates by signup month</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={cohortData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="trials" stroke="#8b5cf6" name="Total Trials" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="conversionRate" stroke="#10b981" name="Conversion Rate %" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-3 gap-4">
          {cohortData.slice(-3).map((cohort, idx) => (
            <div key={idx} className="text-center p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium">{cohort.month}</div>
              <div className="text-2xl font-bold text-primary">{cohort.conversionRate}%</div>
              <div className="text-xs text-muted-foreground">{cohort.conversions}/{cohort.trials} converted</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
