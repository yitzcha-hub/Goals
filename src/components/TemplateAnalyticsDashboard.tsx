import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Award, Sparkles, Calendar } from 'lucide-react';
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface JournalEntry {
  id: string;
  date: string;
  content: string;
  templateId?: string;
  templateName?: string;
}

interface TemplateAnalyticsDashboardProps {
  entries: JournalEntry[];
}

const TemplateAnalyticsDashboard: React.FC<TemplateAnalyticsDashboardProps> = ({ entries }) => {
  const analytics = useMemo(() => {
    const templateEntries = entries.filter(e => e.templateId);
    const templateUsage = new Map<string, number>();
    const templatesByDate = new Map<string, Set<string>>();
    
    templateEntries.forEach(entry => {
      if (entry.templateId && entry.templateName) {
        templateUsage.set(entry.templateName, (templateUsage.get(entry.templateName) || 0) + 1);
        
        const date = entry.date.split('T')[0];
        if (!templatesByDate.has(date)) {
          templatesByDate.set(date, new Set());
        }
        templatesByDate.get(date)!.add(entry.templateId);
      }
    });

    const mostUsedTemplate = Array.from(templateUsage.entries())
      .sort((a, b) => b[1] - a[1])[0];

    const uniqueTemplatesUsed = new Set(templateEntries.map(e => e.templateId)).size;
    const totalTemplates = 5; // Base templates
    const diversityScore = Math.round((uniqueTemplatesUsed / totalTemplates) * 100);

    const completionRate = templateEntries.length > 0 
      ? Math.round((templateEntries.filter(e => e.content.length > 100).length / templateEntries.length) * 100)
      : 0;

    const streak = calculateTemplateStreak(templateEntries);

    return {
      mostUsedTemplate,
      diversityScore,
      completionRate,
      streak,
      templateUsage,
      totalTemplateEntries: templateEntries.length,
      templatesByDate
    };
  }, [entries]);

  const calculateTemplateStreak = (entries: JournalEntry[]) => {
    if (entries.length === 0) return 0;
    
    const dates = [...new Set(entries.map(e => e.date.split('T')[0]))].sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < dates.length; i++) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      const expected = expectedDate.toISOString().split('T')[0];
      
      if (dates[i] === expected) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const usageChartData = useMemo(() => {
    return Array.from(analytics.templateUsage.entries())
      .map(([name, count]) => ({ name, uses: count }))
      .sort((a, b) => b.uses - a.uses);
  }, [analytics.templateUsage]);

  const timelineData = useMemo(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = entries.filter(e => e.date.startsWith(dateStr) && e.templateId).length;
      last7Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        entries: count
      });
    }
    return last7Days;
  }, [entries]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Most Used</p>
                <p className="text-lg font-bold mt-1">
                  {analytics.mostUsedTemplate ? analytics.mostUsedTemplate[0] : 'None'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.mostUsedTemplate ? `${analytics.mostUsedTemplate[1]} times` : ''}
                </p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Streak</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{analytics.streak}</p>
                <p className="text-xs text-gray-500 mt-1">days</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Diversity Score</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{analytics.diversityScore}%</p>
                <p className="text-xs text-gray-500 mt-1">variety</p>
              </div>
              <Sparkles className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{analytics.completionRate}%</p>
                <p className="text-xs text-gray-500 mt-1">quality</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Template Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usageChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={usageChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="uses" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No template usage data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              7-Day Template Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="entries" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analytics.totalTemplateEntries === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Start using templates to see personalized insights!
            </p>
          ) : (
            <>
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Template Usage</p>
                  <p className="text-sm text-blue-700">
                    You've completed {analytics.totalTemplateEntries} template-based entries
                  </p>
                </div>
              </div>
              
              {analytics.streak > 0 && (
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Great Consistency!</p>
                    <p className="text-sm text-green-700">
                      You're on a {analytics.streak}-day streak of template journaling
                    </p>
                  </div>
                </div>
              )}
              
              {analytics.diversityScore < 50 && analytics.totalTemplateEntries > 5 && (
                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-900">Try Something New</p>
                    <p className="text-sm text-purple-700">
                      Explore different templates to diversify your journaling practice
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateAnalyticsDashboard;
