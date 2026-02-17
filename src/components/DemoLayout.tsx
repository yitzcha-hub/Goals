import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/AuthModal';
import { Target, CheckCircle2, Plus, Heart, Award, Calendar, TrendingUp, Flame, DollarSign, RotateCcw, Sparkles } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import DemoGoalDialog from '@/components/DemoGoalDialog';
import DemoGoalDetailView from '@/components/DemoGoalDetailView';
import DemoTestimonials from '@/components/DemoTestimonials';
import DemoAchievementsSection from '@/components/DemoAchievementsSection';
import { DemoAnalyticsSection } from '@/components/DemoAnalyticsSection';
import DemoProgressTimeline from '@/components/DemoProgressTimeline';
import PricingSection from '@/components/PricingSection';
import { HeroFloatingCircles } from '@/components/HeroFloatingCircles';
import demoHeroBg from '@/assets/images/Demo-bg.png';
import { BookOpen, PenLine } from 'lucide-react';

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
      budget: 15000,
      spent: 10500,
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
      budget: 800,
      spent: 480,
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
      budget: 450000,
      spent: 180000,
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
      budget: 600,
      spent: 300,
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
      budget: 5000,
      spent: 1500,
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
      budget: 50000,
      spent: 40000,
      steps: [
        { id: 's1', title: 'Create budget plan', completed: true },
        { id: 's2', title: 'Automate savings', completed: true },
        { id: 's3', title: 'Reach $25k milestone', completed: true },
        { id: 's4', title: 'Hit $50k goal', completed: false }
      ]
    }
];

const DEFAULT_DEMO_TASKS = [
  { id: '1', title: 'Morning meditation - 15 minutes', completed: true, points: 5, priority: 'high' as const },
  { id: '2', title: 'Review weekly goals', completed: true, points: 5, priority: 'high' as const },
  { id: '3', title: 'Call mom', completed: true, points: 5, priority: 'medium' as const },
  { id: '4', title: 'Workout session', completed: true, points: 5, priority: 'high' as const },
  { id: '5', title: 'Read for 30 minutes', completed: true, points: 5, priority: 'medium' as const },
  { id: '6', title: 'Prepare healthy lunch', completed: false, points: 5, priority: 'medium' as const },
  { id: '7', title: 'Evening walk', completed: false, points: 5, priority: 'low' as const },
  { id: '8', title: 'Journal before bed', completed: false, points: 5, priority: 'medium' as const }
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

  const [newTaskTitle, setNewTaskTitle] = useState('');

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


  const [gratitudeEntries, setGratitudeEntries] = useState([
    { id: '1', content: "I'm grateful for my supportive family who believes in my dreams", date: '2026-01-18' },
    { id: '2', content: "Thankful for my health and the ability to pursue my goals", date: '2026-01-17' },
    { id: '3', content: "Grateful for this beautiful morning and a fresh start", date: '2026-01-16' }
  ]);
  const [newGratitude, setNewGratitude] = useState('');

  const handleAddGoal = (newGoal: any) => {
    setDemoGoals(prev => [...prev, {
      ...newGoal,
      progress: newGoal.progress ?? 0,
      timeline: newGoal.timeline || '90',
      priority: newGoal.priority || 'medium',
      budget: newGoal.budget ?? 0,
      spent: newGoal.spent ?? 0,
      steps: newGoal.steps ?? [],
    }]);
  };

  const handleUpdateGoal = (updatedGoal: any) => {
    setDemoGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

  const updateGoalProgress = (goalId: string, progress: number) => {
    setDemoGoals(prev => prev.map(g => g.id === goalId ? { ...g, progress } : g));
  };

  const earnedAchievementBonus = 150;
  const totalPoints = demoTasks.filter(t => t.completed).reduce((sum, t) => sum + (t.points ?? 5), 0) + earnedAchievementBonus;
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
      <div className="py-3 px-4 text-center text-white flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4" style={{ backgroundColor: 'var(--landing-primary)' }}>
        <p className="font-semibold flex items-center justify-center gap-2">
          <Flame className="h-5 w-5" />
          Interactive Demo — Try the app with sample goals and tasks
          <Sparkles className="h-4 w-4 ml-1" />
        </p>
        <Button
          variant="secondary"
          size="sm"
          className="bg-white/20 hover:bg-white/30 text-white border-0 shrink-0"
          onClick={() => {
            setDemoGoals(DEFAULT_DEMO_GOALS);
            setDemoTasks(DEFAULT_DEMO_TASKS);
            setGratitudeEntries([
              { id: '1', content: "I'm grateful for my supportive family who believes in my dreams", date: '2026-01-18' },
              { id: '2', content: "Thankful for my health and the ability to pursue my goals", date: '2026-01-17' },
              { id: '3', content: "Grateful for this beautiful morning and a fresh start", date: '2026-01-16' }
            ]);
          }}
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset to sample data
        </Button>
      </div>

      {/* Hero Section — matches Features/Pricing/About pattern */}
      <section
        id="hero"
        className="relative py-20 sm:py-28 px-4 min-h-[28rem] flex items-center justify-center overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${demoHeroBg})` }}
          aria-hidden
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'var(--landing-accent)', opacity: 0.85 }} aria-hidden />
        <HeroFloatingCircles />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent animate-slide-up"
            style={{
              backgroundImage: 'linear-gradient(135deg, var(--landing-primary) 0%, var(--landing-primary-soft) 50%, #1a6b4f 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              animationDelay: '0.1s',
            }}
          >
            See how it works
          </h1>
          <p
            className="text-lg sm:text-xl mb-4 font-bold max-w-2xl mx-auto bg-clip-text text-transparent animate-slide-up"
            style={{
              backgroundImage: 'linear-gradient(135deg, #4a5568 0%, #2d3748 50%, #1a1a1a 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              animationDelay: '0.25s',
            }}
          >
            Explore goals, progress tracking, and daily tasks — no account needed
          </p>
          <p
            className="text-sm font-medium opacity-90 mb-8 animate-slide-up"
            style={{ color: 'var(--landing-text)', animationDelay: '0.3s' }}
          >
            Try it: Click a goal to see details • Drag the progress sliders • Toggle tasks • Add your own
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up"
            style={{ animationDelay: '0.4s' }}
          >
            <AuthModal
              trigger={
                <Button size="lg" variant="default" className="hero-cta-primary">
                  Start 7-day free trial
                </Button>
              }
              defaultMode="signup"
            />
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById('demo-dashboard')?.scrollIntoView({ behavior: 'smooth' })}
              className="hero-cta-outline"
            >
              Try the demo below
            </Button>
          </div>
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
      <section id="demo-dashboard" className="py-12 px-4 border-t scroll-mt-24" style={{ backgroundColor: 'var(--landing-bg)', borderColor: 'var(--landing-border)' }}>
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
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline" style={{ borderColor: 'var(--landing-primary)', color: 'var(--landing-primary)' }}>{timelineLabels[goal.timeline]}</Badge>
                      <Badge style={{
                        backgroundColor: goal.priority === 'high' ? 'rgba(220,38,38,0.12)' : goal.priority === 'medium' ? 'var(--landing-accent)' : 'var(--landing-accent)',
                        color: goal.priority === 'high' ? '#dc2626' : 'var(--landing-primary)',
                      }}>
                        {goal.priority}
                      </Badge>
                    </div>
                    {/* Budget & Spent */}
                    {(goal.budget != null && goal.budget > 0) && (
                      <div className="flex flex-wrap gap-4 mb-3 text-sm" style={{ color: 'var(--landing-text)' }}>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" style={{ color: 'var(--landing-primary)' }} />
                          <span><strong>Budget:</strong> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(goal.budget)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" style={{ color: 'var(--landing-primary)' }} />
                          <span><strong>Spent:</strong> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(goal.spent ?? 0)}</span>
                        </div>
                      </div>
                    )}
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
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-7 w-7" style={{ color: 'var(--landing-primary)' }} />
                    <h3 className="text-2xl font-semibold" style={{ color: 'var(--landing-text)' }}>To-Do List</h3>
                    <Badge style={{ backgroundColor: 'var(--landing-accent)', color: 'var(--landing-primary)' }}>+5 pts each</Badge>
                  </div>
                </div>
                <div className="space-y-3 mb-4">
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
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const title = newTaskTitle.trim();
                    if (title) {
                      setDemoTasks([...demoTasks, { id: Date.now().toString(), title, completed: false, points: 5, priority: 'medium' as const }]);
                      setNewTaskTitle('');
                    }
                  }}
                  className="flex gap-2"
                >
                  <Input
                    placeholder="Add a task..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="flex-1"
                    style={{ borderColor: 'var(--landing-border)' }}
                  />
                  <Button type="submit" size="sm" className="hero-cta-primary" disabled={!newTaskTitle.trim()}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Gratitude Section */}
            <Card className="shadow-lg feature-card-shadow" style={{ borderColor: 'var(--landing-border)', backgroundColor: 'var(--landing-accent)' }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="h-7 w-7" style={{ color: 'var(--landing-primary)' }} />
                  <h3 className="text-2xl font-semibold" style={{ color: 'var(--landing-text)' }}>Gratitude Journal</h3>
                </div>
                <div className="space-y-4 mb-4">
                  {gratitudeEntries.map(entry => (
                    <div key={entry.id} className="p-4 rounded-xl border" style={{ backgroundColor: 'white', borderColor: 'var(--landing-border)' }}>
                      <p style={{ color: 'var(--landing-text)' }}>{entry.content}</p>
                      <p className="text-xs mt-2 opacity-70" style={{ color: 'var(--landing-text)' }}>{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const content = newGratitude.trim();
                    if (content) {
                      setGratitudeEntries([...gratitudeEntries, { id: Date.now().toString(), content, date: new Date().toISOString().slice(0, 10) }]);
                      setNewGratitude('');
                    }
                  }}
                  className="flex gap-2"
                >
                  <Input
                    placeholder="What are you grateful for today?"
                    value={newGratitude}
                    onChange={(e) => setNewGratitude(e.target.value)}
                    style={{ borderColor: 'var(--landing-border)' }}
                    className="flex-1"
                  />
                  <Button type="submit" size="sm" className="hero-cta-primary" disabled={!newGratitude.trim()}>
                    <PenLine className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Calendar & Written Plan Row */}
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="shadow-lg feature-card-shadow" style={{ borderColor: 'var(--landing-border)', backgroundColor: 'white' }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="h-7 w-7" style={{ color: 'var(--landing-primary)' }} />
                  <h3 className="text-2xl font-semibold" style={{ color: 'var(--landing-text)' }}>Calendar</h3>
                </div>
                <p className="text-sm opacity-90 mb-4" style={{ color: 'var(--landing-text)' }}>
                  In the full app, goals are attached to your calendar with reminders—so you revisit them when it matters.
                </p>
                <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--landing-accent)', borderColor: 'var(--landing-border)' }}>
                  {[
                    { date: 'Feb 18', goal: 'Run a Marathon — 90-day check-in' },
                    { date: 'Feb 20', goal: 'Learn Spanish — Tutor session' },
                    { date: 'Mar 15', goal: 'Launch Business — First client milestone' }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <span className="font-semibold shrink-0" style={{ color: 'var(--landing-primary)' }}>{item.date}</span>
                      <span style={{ color: 'var(--landing-text)' }}>{item.goal}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg feature-card-shadow" style={{ borderColor: 'var(--landing-border)', backgroundColor: 'white' }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="h-7 w-7" style={{ color: 'var(--landing-primary)' }} />
                <h3 className="text-2xl font-semibold" style={{ color: 'var(--landing-text)' }}>Written Plan</h3>
              </div>
              <p className="text-sm opacity-90 mb-4" style={{ color: 'var(--landing-text)' }}>
                In the full app, each goal has a written development plan—your own words clarifying the path. This keeps you focused and accountable.
              </p>
              <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--landing-accent)', borderColor: 'var(--landing-border)' }}>
                <p className="text-sm italic opacity-90" style={{ color: 'var(--landing-text)' }}>
                  &quot;My plan: I will launch my coaching business by defining my niche, building a website, and getting my first 5 clients within 6 months. I&apos;ll work with Sarah on marketing and Mike on tech.&quot;
                </p>
                <p className="text-xs mt-2 opacity-70" style={{ color: 'var(--landing-text)' }}>— Sample written plan for &quot;Launch My Dream Business&quot;</p>
              </div>
            </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <DemoAchievementsSection totalPoints={totalPoints} />

          {/* Progress Timeline */}
          <DemoProgressTimeline />

          {/* Analytics */}
          <DemoAnalyticsSection goals={demoGoals} tasks={demoTasks} />

          {/* Testimonials */}
          <DemoTestimonials />

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

          {/* CTA Section — matches About/Features/Pricing pattern */}
          <section className="py-20 px-4">
            <div className="max-w-4xl mx-auto text-center rounded-3xl p-10 sm:p-14 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--landing-primary) 0%, var(--landing-primary-soft) 50%, #1a6b4f 100%)' }}>
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: 'white' }} aria-hidden />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: 'white' }} aria-hidden />
              <div className="relative z-10">
                <Flame className="w-12 h-12 mx-auto mb-4 text-white/90" />
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white">Ready to start your growth journey?</h2>
                <p className="text-white/90 mb-6 max-w-md mx-auto">7-day free trial. No credit card required.</p>
                <AuthModal
                  defaultMode="signup"
                  trigger={
                    <Button size="lg" className="text-base px-8 bg-white text-[var(--landing-primary)] hover:bg-white/95 shadow-lg">
                      <Flame className="h-5 w-5 mr-2" />
                      Begin your journey
                    </Button>
                  }
                />
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );

};

export default DemoLayout;
