import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, Zap, Award } from 'lucide-react';

const goalProgressData = [
  { month: 'Jan', completed: 2, total: 5 },
  { month: 'Feb', completed: 4, total: 6 },
  { month: 'Mar', completed: 6, total: 7 },
  { month: 'Apr', completed: 8, total: 8 },
  { month: 'May', completed: 11, total: 10 },
  { month: 'Jun', completed: 14, total: 12 },
];

const habitStreakData = [
  { day: 'Mon', streak: 5 },
  { day: 'Tue', streak: 6 },
  { day: 'Wed', streak: 7 },
  { day: 'Thu', streak: 8 },
  { day: 'Fri', streak: 9 },
  { day: 'Sat', streak: 10 },
  { day: 'Sun', streak: 11 },
];

const productivityData = [
  { week: 'W1', score: 45 },
  { week: 'W2', score: 52 },
  { week: 'W3', score: 61 },
  { week: 'W4', score: 68 },
  { week: 'W5', score: 75 },
  { week: 'W6', score: 82 },
];

export const ProgressShowcase: React.FC = () => {
  return (
    <section id="progress-showcase" className="py-16 px-4 bg-gradient-to-br from-slate-50 to-gray-100">


      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Measure Your Progress Come to Life</h2>

          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Track every milestone, celebrate every win, and watch your transformation unfold with powerful visual insights
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Goal Completion Trend
              </CardTitle>
              <CardDescription>Watch your goals multiply as you build momentum</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={goalProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip />
                  <Line type="monotone" dataKey="completed" stroke="#16a34a" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Daily Habit Streaks
              </CardTitle>
              <CardDescription>Build unstoppable momentum day by day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={habitStreakData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip />
                  <Bar dataKey="streak" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-violet-600" />
              Productivity Growth Over Time
            </CardTitle>
            <CardDescription>Experience exponential growth in your productivity score</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <ChartTooltip />
                <Area type="monotone" dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="text-center p-6 bg-white rounded-xl shadow-md">
            <Award className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-800 mb-1">87%</div>
            <p className="text-gray-600">Average Success Rate</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-md">
            <Target className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-800 mb-1">2.5x</div>
            <p className="text-gray-600">Goal Completion Increase</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-md">
            <TrendingUp className="h-12 w-12 text-blue-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-800 mb-1">+45%</div>
            <p className="text-gray-600">Productivity Boost</p>
          </div>
        </div>
      </div>
    </section>
  );
};
