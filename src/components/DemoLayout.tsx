import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/AuthModal';
import { Target, CheckCircle2, Plus, Heart, Award, Calendar, TrendingUp, Flame } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import DemoGoalDialog from '@/components/DemoGoalDialog';
import DemoGoalDetailView from '@/components/DemoGoalDetailView';
import PricingSection from '@/components/PricingSection';
import { HeroFloatingCircles } from '@/components/HeroFloatingCircles';

const DEMO_STORAGE_GOALS = 'goals_app_demo_layout_goals';
const DEMO_STORAGE_TASKS = 'goals_app_demo_layout_tasks';

const DEFAULT_DEMO_GOALS = [
    { 
      id: '1', 
      title: 'Launch My Dream Business', 
      description: 'Start and grow my online coaching business', 
      progress: 7, 
      timeline: '1year',
      priority: 'high',
      category: 'Business', 
      targetDate: '2027-01-15',
      image: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760312841255_ba6990ea.webp',
      steps: [
        { id: 's1', title: 'Define niche and target audience', completed: true },
        { id: 's2', title: 'Create business plan', completed: true },
        { id: 's3', title: 'Build website and branding', completed: true },
        { id: 's4', title: 'Launch and get first clients', completed: false }
      ]
    },
    { 
      id: '2', 
      title: 'Run a Marathon', 
      description: 'Complete my first 26.2 mile race', 
      progress: 6, 
      timeline: '90',
      priority: 'high',
      category: 'Health', 
      targetDate: '2026-04-15',
      image: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760312839241_43f789a1.webp',
      steps: [
        { id: 's1', title: 'Build base mileage', completed: true },
        { id: 's2', title: 'Follow training plan', completed: true },
        { id: 's3', title: 'Complete long runs', completed: true },
        { id: 's4', title: 'Race day!', completed: false }
      ]
    },
    { 
      id: '3', 
      title: 'Build My Dream Home', 
      description: 'Design and construct our forever home', 
      progress: 4, 
      timeline: '5year',
      priority: 'medium',
      category: 'Personal', 
      targetDate: '2030-10-01',
      image: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760312839994_d53dd0af.webp',
      steps: [
        { id: 's1', title: 'Save for down payment', completed: true },
        { id: 's2', title: 'Find perfect land', completed: false },
        { id: 's3', title: 'Design with architect', completed: false },
        { id: 's4', title: 'Build and move in', completed: false }
      ]
    },
    { 
      id: '4', 
      title: 'Learn Spanish Fluently', 
      description: 'Achieve conversational fluency in Spanish', 
      progress: 5, 
      timeline: '60',
      priority: 'medium',
      category: 'Education', 
      targetDate: '2026-03-20',
      image: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760312845466_22d02da1.webp',
      steps: [
        { id: 's1', title: 'Complete beginner course', completed: true },
        { id: 's2', title: 'Practice daily with app', completed: true },
        { id: 's3', title: 'Find language partner', completed: false },
        { id: 's4', title: 'Travel to Spanish-speaking country', completed: false }
      ]
    },
    { 
      id: '5', 
      title: 'Travel to Japan', 
      description: 'Experience Japanese culture and cuisine', 
      progress: 3, 
      timeline: '1year',
      priority: 'low',
      category: 'Travel', 
      targetDate: '2027-10-01',
      image: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760530848740_26e90107.webp',
      steps: [
        { id: 's1', title: 'Save travel fund', completed: true },
        { id: 's2', title: 'Research destinations', completed: false },
        { id: 's3', title: 'Book flights and hotels', completed: false },
        { id: 's4', title: 'Take the trip!', completed: false }
      ]
    },
    { 
      id: '6', 
      title: 'Save $50,000 Emergency Fund', 
      description: 'Build financial security for my family', 
      progress: 8, 
      timeline: '1year',
      priority: 'high',
      category: 'Finance', 
      targetDate: '2026-12-31',
      image: 'https://d64gsuwffb70l.cloudfront.net/692dfc7e4cdd91a34e5e367b_1768963852567_f1acdb0c.jpg',
      steps: [
        { id: 's1', title: 'Create budget plan', completed: true },
        { id: 's2', title: 'Automate savings', completed: true },
        { id: 's3', title: 'Reach $25k milestone', completed: true },
        { id: 's4', title: 'Hit $50k goal', completed: false }
      ]
    }
];

const DEFAULT_DEMO_TASKS = [
  { id: '1', title: 'Morning meditation - 15 minutes', completed: true, points: 5 },
  { id: '2', title: 'Review weekly goals', completed: true, points: 5 },
  { id: '3', title: 'Call mom', completed: true, points: 5 },
  { id: '4', title: 'Workout session', completed: true, points: 5 },
  { id: '5', title: 'Read for 30 minutes', completed: true, points: 5 },
  { id: '6', title: 'Prepare healthy lunch', completed: false, points: 5 },
  { id: '7', title: 'Evening walk', completed: false, points: 5 },
  { id: '8', title: 'Journal before bed', completed: false, points: 5 }
];

const DemoLayout: React.FC = () => {
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

  const [demoGoals, setDemoGoals] = useState(() => {
    try {
      const raw = localStorage.getItem(DEMO_STORAGE_GOALS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_DEMO_GOALS;
  });

  const [demoTasks, setDemoTasks] = useState(() => {
    try {
      const raw = localStorage.getItem(DEMO_STORAGE_TASKS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_DEMO_TASKS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(DEMO_STORAGE_GOALS, JSON.stringify(demoGoals));
    } catch {}
  }, [demoGoals]);

  useEffect(() => {
    try {
      localStorage.setItem(DEMO_STORAGE_TASKS, JSON.stringify(demoTasks));
    } catch {}
  }, [demoTasks]);

  const timelineLabels: Record<string, string> = {
    '30': '30 Days',
    '60': '60 Days',
    '90': '90 Days',
    '1year': '1 Year',
    '5year': '5 Year Plan'
  };


  const [gratitudeEntries] = useState([
    { id: '1', content: "I'm grateful for my supportive family who believes in my dreams", date: '2026-01-18' },
    { id: '2', content: "Thankful for my health and the ability to pursue my goals", date: '2026-01-17' },
    { id: '3', content: "Grateful for this beautiful morning and a fresh start", date: '2026-01-16' }
  ]);

  const handleAddGoal = (newGoal: any) => {
    setDemoGoals(prev => [...prev, { ...newGoal, progress: 0, timeline: '90', priority: 'medium' }]);
  };

  const handleUpdateGoal = (updatedGoal: any) => {
    setDemoGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

  const updateGoalProgress = (goalId: string, progress: number) => {
    setDemoGoals(prev => prev.map(g => g.id === goalId ? { ...g, progress } : g));
  };

  const totalPoints = 1250;
  const streak = 14;

  if (selectedGoal) {
    return (
      <DemoGoalDetailView 
        goal={selectedGoal} 
        onBack={() => setSelectedGoal(null)}
        onUpdateGoal={handleUpdateGoal}
      />
    );
  }

  return (
    <div className="min-h-screen landing" style={{ backgroundColor: 'var(--landing-bg)', color: 'var(--landing-text)' }}>
      {/* Demo Banner */}
      <div className="py-3 px-4 text-center text-white" style={{ backgroundColor: 'var(--landing-primary)' }}>
        <p className="font-semibold flex items-center justify-center gap-2">
          <Flame className="h-5 w-5" />
          Interactive Demo — Try the app with sample goals and tasks
          <Flame className="h-5 w-5" />
        </p>
      </div>

      {/* Hero Section — matches landing style */}
      <section className="relative py-16 sm:py-20 px-4 min-h-[20rem] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundColor: 'var(--landing-accent)', opacity: 0.78 }} aria-hidden />
        <HeroFloatingCircles />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, var(--landing-primary) 0%, var(--landing-primary-soft) 50%, #1a6b4f 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
            }}
          >
            See how it works
          </h1>
          <p className="text-lg sm:text-xl font-semibold max-w-2xl mx-auto" style={{ color: 'var(--landing-text)' }}>
            Explore goals, progress tracking, and daily tasks — no account needed
          </p>
        </div>
      </section>





      {/* Stats Bar */}
      <section className="py-8 px-4 border-t" style={{ backgroundColor: 'var(--landing-bg)', borderColor: 'var(--landing-border)' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--landing-accent)', borderColor: 'var(--landing-border)' }}>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--landing-primary)' }}>{demoGoals.length}</div>
            <div className="text-sm font-medium" style={{ color: 'var(--landing-text)' }}>Active Goals</div>
          </div>
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--landing-accent)', borderColor: 'var(--landing-border)' }}>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--landing-primary)' }}>{demoTasks.filter(t => t.completed).length}/{demoTasks.length}</div>
            <div className="text-sm font-medium" style={{ color: 'var(--landing-text)' }}>Tasks Done</div>
          </div>
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--landing-accent)', borderColor: 'var(--landing-border)' }}>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--landing-primary)' }}>{totalPoints}</div>
            <div className="text-sm font-medium" style={{ color: 'var(--landing-text)' }}>Total Points</div>
          </div>
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--landing-accent)', borderColor: 'var(--landing-border)' }}>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--landing-primary)' }}>{streak} days</div>
            <div className="text-sm font-medium" style={{ color: 'var(--landing-text)' }}>Current Streak</div>
          </div>
        </div>
      </section>

      {/* Demo Dashboard */}
      <section className="py-12 px-4 border-t" style={{ backgroundColor: 'var(--landing-bg)', borderColor: 'var(--landing-border)' }}>
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Goals Grid */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8" style={{ color: 'var(--landing-primary)' }} />
                <h2 className="text-3xl font-bold" style={{ color: 'var(--landing-text)' }}>Your Goals (0-10 Scale)</h2>
              </div>
              <DemoGoalDialog
                trigger={
                  <Button className="hero-cta-primary">
                    <Plus className="h-5 w-5 mr-2" />
                    Add Goal
                  </Button>
                }
                onGoalAdd={handleAddGoal}
              />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoGoals.map(goal => (
                <Card
                  key={goal.id}
                  className="overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer feature-card-shadow"
                  style={{ borderColor: 'var(--landing-border)', backgroundColor: 'white' }}
                  onClick={() => setSelectedGoal(goal)}
                >
                  {goal.image && (
                    <div className="w-full h-40 overflow-hidden">
                      <img
                        src={goal.image}
                        alt={goal.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--landing-text)' }}>{goal.title}</h3>
                      <span className="text-2xl font-bold" style={{ color: 'var(--landing-primary)' }}>{goal.progress}/10</span>
                    </div>
                    <p className="text-sm mb-3 opacity-90" style={{ color: 'var(--landing-text)' }}>{goal.description}</p>
                    <div className="flex gap-2 mb-3">
                      <Badge variant="outline" style={{ borderColor: 'var(--landing-primary)', color: 'var(--landing-primary)' }}>{timelineLabels[goal.timeline]}</Badge>
                      <Badge style={{
                        backgroundColor: goal.priority === 'high' ? 'rgba(220,38,38,0.12)' : goal.priority === 'medium' ? 'var(--landing-accent)' : 'var(--landing-accent)',
                        color: goal.priority === 'high' ? '#dc2626' : 'var(--landing-primary)',
                      }}>
                        {goal.priority}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Slider
                        value={[goal.progress]}
                        onValueChange={(value) => updateGoalProgress(goal.id, value[0])}
                        onClick={(e) => e.stopPropagation()}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                      <Progress value={goal.progress * 10} className="h-2" style={{ backgroundColor: 'var(--landing-accent)' }} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Tasks Section */}
            <Card className="shadow-lg feature-card-shadow" style={{ borderColor: 'var(--landing-border)', backgroundColor: 'white' }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle2 className="h-7 w-7" style={{ color: 'var(--landing-primary)' }} />
                  <h3 className="text-2xl font-semibold" style={{ color: 'var(--landing-text)' }}>To-Do List</h3>
                  <Badge style={{ backgroundColor: 'var(--landing-accent)', color: 'var(--landing-primary)' }}>+5 pts each</Badge>
                </div>
                <div className="space-y-3">
                  {demoTasks.map(task => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                        task.completed ? 'border-2' : ''
                      }`}
                      style={{
                        backgroundColor: task.completed ? 'var(--landing-accent)' : 'var(--landing-bg)',
                        borderColor: task.completed ? 'var(--landing-primary)' : 'transparent',
                      }}
                    >
                      <button
                        onClick={() => setDemoTasks(demoTasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          task.completed ? '' : 'border-gray-300'
                        }`}
                        style={task.completed ? { backgroundColor: 'var(--landing-primary)', borderColor: 'var(--landing-primary)' } : {}}
                      >
                        {task.completed && <CheckCircle2 className="h-4 w-4 text-white" />}
                      </button>
                      <span className={`flex-1 ${task.completed ? 'line-through opacity-70' : ''}`} style={{ color: 'var(--landing-text)' }}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gratitude Section */}
            <Card className="shadow-lg feature-card-shadow" style={{ borderColor: 'var(--landing-border)', backgroundColor: 'var(--landing-accent)' }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="h-7 w-7" style={{ color: 'var(--landing-primary)' }} />
                  <h3 className="text-2xl font-semibold" style={{ color: 'var(--landing-text)' }}>Gratitude Journal</h3>
                </div>
                <div className="space-y-4">
                  {gratitudeEntries.map(entry => (
                    <div key={entry.id} className="p-4 rounded-xl border" style={{ backgroundColor: 'white', borderColor: 'var(--landing-border)' }}>
                      <p style={{ color: 'var(--landing-text)' }}>{entry.content}</p>
                      <p className="text-xs mt-2 opacity-70" style={{ color: 'var(--landing-text)' }}>{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Highlights */}
          <div className="rounded-2xl p-8 shadow-lg border" style={{ backgroundColor: 'white', borderColor: 'var(--landing-border)' }}>
            <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--landing-text)' }}>Why Goals and Development?</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-6 rounded-xl border" style={{ backgroundColor: 'var(--landing-accent)', borderColor: 'var(--landing-border)' }}>
                <Calendar className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--landing-primary)' }} />
                <h4 className="font-semibold text-lg mb-2" style={{ color: 'var(--landing-text)' }}>Goal Timelines</h4>
                <p className="text-sm opacity-90" style={{ color: 'var(--landing-text)' }}>30, 60, 90 days to 5-year plans</p>
              </div>
              <div className="text-center p-6 rounded-xl border" style={{ backgroundColor: 'var(--landing-accent)', borderColor: 'var(--landing-border)' }}>
                <TrendingUp className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--landing-primary)' }} />
                <h4 className="font-semibold text-lg mb-2" style={{ color: 'var(--landing-text)' }}>0-10 Progress</h4>
                <p className="text-sm opacity-90" style={{ color: 'var(--landing-text)' }}>Simple, visual progress tracking</p>
              </div>
              <div className="text-center p-6 rounded-xl border" style={{ backgroundColor: 'var(--landing-accent)', borderColor: 'var(--landing-border)' }}>
                <Heart className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--landing-primary)' }} />
                <h4 className="font-semibold text-lg mb-2" style={{ color: 'var(--landing-text)' }}>Focus on YOU</h4>
                <p className="text-sm opacity-90" style={{ color: 'var(--landing-text)' }}>No social comparison, just growth</p>
              </div>
              <div className="text-center p-6 rounded-xl border" style={{ backgroundColor: 'var(--landing-accent)', borderColor: 'var(--landing-border)' }}>
                <Award className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--landing-primary)' }} />
                <h4 className="font-semibold text-lg mb-2" style={{ color: 'var(--landing-text)' }}>Earn Rewards</h4>
                <p className="text-sm opacity-90" style={{ color: 'var(--landing-text)' }}>Points for every achievement</p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div id="pricing">
            <PricingSection />
          </div>

          {/* CTA Section — matches landing */}
          <section className="py-16 px-4 text-white rounded-2xl text-center relative overflow-hidden" style={{ backgroundColor: 'var(--landing-primary)' }}>
            <div className="relative z-10 max-w-2xl mx-auto">
              <h3 className="text-3xl font-bold mb-4">Ready to Start Your Growth Journey?</h3>
              <p className="text-xl mb-6 opacity-90">Start your 7 day free trial today — no credit card required</p>
              <AuthModal
                defaultMode="signup"
                trigger={
                  <Button size="lg" variant="secondary" className="bg-white hover:bg-white/90 shadow-lg" style={{ color: 'var(--landing-primary)' }}>
                    <Flame className="h-5 w-5 mr-2" />
                    Begin Your Journey Now
                  </Button>
                }
              />
            </div>
          </section>
        </div>
      </section>
    </div>
  );

};

export default DemoLayout;
