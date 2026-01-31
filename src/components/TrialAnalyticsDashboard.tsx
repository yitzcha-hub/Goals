import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { TrialMetricsCards } from "./TrialMetricsCards";
import { TrialTimelineChart } from "./TrialTimelineChart";
import { TrialStatusChart } from "./TrialStatusChart";
import { TrialAbandonmentFunnel } from "./TrialAbandonmentFunnel";
import { CohortAnalysis } from "./CohortAnalysis";
import { ABTestingResults } from "./ABTestingResults";
import { PredictiveModeling } from "./PredictiveModeling";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export function TrialAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);


  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data: subs, error } = await supabase
        .from('subscriptions')
        .select('*');

      if (error) throw error;

      setSubscriptions(subs || []);

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const totalTrials = subs.filter(s => s.trial_start).length;
      const activeTrials = subs.filter(s => 
        s.status === 'trialing' && new Date(s.trial_end) > now
      ).length;
      const expiredTrials = subs.filter(s => 
        s.status === 'trialing' && new Date(s.trial_end) <= now
      ).length;
      const convertedTrials = subs.filter(s => 
        s.trial_start && s.status === 'active'
      ).length;
      const conversionRate = totalTrials > 0 ? (convertedTrials / totalTrials * 100) : 0;

      const conversions = subs.filter(s => s.trial_start && s.status === 'active');
      let avgTimeToConversion = 0;
      if (conversions.length > 0) {
        const totalDays = conversions.reduce((sum, s) => {
          const start = new Date(s.trial_start);
          const end = new Date(s.updated_at);
          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        }, 0);
        avgTimeToConversion = Math.round(totalDays / conversions.length);
      }

      const timeline = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const started = subs.filter(s => 
          s.trial_start && s.trial_start.startsWith(dateStr)
        ).length;
        const converted = subs.filter(s => 
          s.trial_start && s.status === 'active' && 
          s.updated_at && s.updated_at.startsWith(dateStr)
        ).length;
        timeline.push({ date: dateStr, started, converted });
      }

      setMetrics({
        totalTrials,
        activeTrials,
        expiredTrials,
        convertedTrials,
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        avgTimeToConversion,
        canceledTrials: subs.filter(s => s.status === 'canceled' && s.trial_start).length
      });
      setTimelineData(timeline);
    } catch (error: any) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchAnalytics();
  }, []);

  const exportReport = () => {
    if (!metrics) return;
    
    const report = {
      generatedAt: new Date().toISOString(),
      metrics,
      timelineData
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trial-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success("Report exported successfully");
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading analytics...</div>;
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Trial Analytics Dashboard</h2>
        <div className="flex gap-2">
          <Button onClick={fetchAnalytics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <TrialMetricsCards metrics={metrics} />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="funnel">Funnel Analysis</TabsTrigger>
          <TabsTrigger value="cohort">Cohort Analysis</TabsTrigger>
          <TabsTrigger value="abtesting">A/B Testing</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <TrialTimelineChart data={timelineData} />
            <TrialStatusChart metrics={metrics} />
          </div>
        </TabsContent>

        <TabsContent value="funnel">
          <TrialAbandonmentFunnel subscriptions={subscriptions} />
        </TabsContent>

        <TabsContent value="cohort">
          <CohortAnalysis subscriptions={subscriptions} />
        </TabsContent>

        <TabsContent value="abtesting">
          <ABTestingResults subscriptions={subscriptions} />
        </TabsContent>

        <TabsContent value="predictions">
          <PredictiveModeling subscriptions={subscriptions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

