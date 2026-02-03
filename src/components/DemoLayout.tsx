import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/AuthModal';
import { Leaf, Target, CheckCircle2, Plus, Home, Heart, BookOpen, Award, Calendar, TrendingUp, Flame, HelpCircle } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import DemoGoalDialog from '@/components/DemoGoalDialog';
import DemoGoalDetailView from '@/components/DemoGoalDetailView';
import PricingSection from '@/components/PricingSection';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-lime-50 to-emerald-100">
      {/* Navigation Bar */}
      <nav className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-green-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-lime-500 rounded-xl flex items-center justify-center">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-lime-500 bg-clip-text text-transparent">
              Goals and Development
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/help')}
              className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50"
            >
              <HelpCircle className="h-4 w-4" />
              Help
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
          </div>
        </div>
      </nav>


      {/* Demo Banner */}
      <div className="bg-green-500 text-white py-4 px-4 text-center shadow-lg">
        <p className="font-semibold flex items-center justify-center gap-2">
          <Flame className="h-5 w-5" />
          DEMO MODE - Experience the full power of goal achievement
          <Flame className="h-5 w-5" />
        </p>
      </div>


      {/* Hero Section - Chalkboard Style (Compact) */}
      <section className="relative py-10 px-4 text-white text-center overflow-hidden">
        {/* Chalkboard Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-950 via-emerald-900 to-green-950"></div>

        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}></div>
        {/* Chalk dust effect */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-20 w-32 h-1 bg-white/5 rotate-12 blur-sm"></div>
          <div className="absolute top-32 right-40 w-24 h-1 bg-white/5 -rotate-6 blur-sm"></div>
          <div className="absolute bottom-20 left-1/3 w-40 h-1 bg-white/5 rotate-3 blur-sm"></div>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Cursive Chalkboard Text */}
          <h1 
            className="text-5xl md:text-7xl lg:text-8xl mb-4 text-white drop-shadow-lg"
            style={{ 
              fontFamily: "'Caveat', cursive",
              textShadow: '2px 2px 4px rgba(0,0,0,0.5), 0 0 40px rgba(255,255,255,0.1)',
              letterSpacing: '0.02em'
            }}
          >
            <span className="block">Life's not</span>
            <span className="block text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5), 0 0 40px rgba(255,255,255,0.2)' }}>
              waiting...
            </span>
          </h1>

          <p className="text-lg md:text-xl font-light tracking-wide text-orange-300" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
            See how our 0-10 progress scale and goal timelines work in action
          </p>

        </div>
      </section>





      {/* Stats Bar */}
      <section className="py-8 px-4 bg-white shadow-md">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 bg-gradient-to-br from-green-50 to-lime-50 rounded-xl border border-green-100">
            <div className="text-3xl font-bold text-green-600 mb-1">{demoGoals.length}</div>
            <div className="text-gray-600 text-sm font-medium">Active Goals</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-lime-50 to-emerald-50 rounded-xl border border-lime-100">
            <div className="text-3xl font-bold text-lime-600 mb-1">{demoTasks.filter(t => t.completed).length}/{demoTasks.length}</div>
            <div className="text-gray-600 text-sm font-medium">Tasks Done</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
            <div className="text-3xl font-bold text-orange-600 mb-1">{totalPoints}</div>
            <div className="text-gray-600 text-sm font-medium">Total Points</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
            <div className="text-3xl font-bold text-amber-600 mb-1">{streak} days</div>
            <div className="text-gray-600 text-sm font-medium">Current Streak</div>
          </div>
        </div>
      </section>

      {/* Demo Dashboard */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Goals Grid */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-green-600" />
                <h2 className="text-3xl font-bold text-gray-800">Your Goals (0-10 Scale)</h2>
              </div>
              <DemoGoalDialog
                trigger={
                  <Button className="bg-gradient-to-r from-green-600 to-lime-500 hover:from-green-700 hover:to-lime-600 text-white">
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
                  className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer bg-white"
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
                      <h3 className="text-lg font-semibold text-gray-800">{goal.title}</h3>
                      <span className="text-2xl font-bold text-green-600">{goal.progress}/10</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{goal.description}</p>
                    <div className="flex gap-2 mb-3">
                      <Badge variant="outline" className="border-green-300 text-green-700">{timelineLabels[goal.timeline]}</Badge>
                      <Badge className={
                        goal.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        goal.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }>
                        {goal.priority}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Slider
                        value={[goal.progress]}
                        onValueChange={(value) => {
                          updateGoalProgress(goal.id, value[0]);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                      <Progress value={goal.progress * 10} className="h-2 bg-green-100" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Tasks Section */}
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle2 className="h-7 w-7 text-green-600" />
                  <h3 className="text-2xl font-semibold text-gray-800">To-Do List</h3>
                  <Badge className="bg-orange-100 text-orange-700">+5 pts each</Badge>
                </div>
                <div className="space-y-3">
                  {demoTasks.map(task => (
                    <div 
                      key={task.id} 
                      className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                        task.completed 
                          ? 'bg-green-50 border-2 border-green-200' 
                          : 'bg-gray-50 hover:bg-orange-50'
                      }`}
                    >
                      <button
                        onClick={() => setDemoTasks(demoTasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          task.completed 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="h-4 w-4 text-white" />}
                      </button>
                      <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gratitude Section */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="h-7 w-7 text-orange-500" />
                  <h3 className="text-2xl font-semibold text-gray-800">Gratitude Journal</h3>
                </div>
                <div className="space-y-4">
                  {gratitudeEntries.map(entry => (
                    <div key={entry.id} className="p-4 bg-white rounded-xl shadow-sm border border-orange-100">
                      <p className="text-gray-700">{entry.content}</p>
                      <p className="text-xs text-gray-500 mt-2">{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Highlights */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Why Goals and Development?</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-lime-50 rounded-xl border border-green-100">
                <Calendar className="h-10 w-10 mx-auto mb-3 text-green-600" />
                <h4 className="font-semibold text-lg mb-2">Goal Timelines</h4>
                <p className="text-gray-600 text-sm">30, 60, 90 days to 5-year plans</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-lime-50 to-emerald-50 rounded-xl border border-lime-100">
                <TrendingUp className="h-10 w-10 mx-auto mb-3 text-lime-600" />
                <h4 className="font-semibold text-lg mb-2">0-10 Progress</h4>
                <p className="text-gray-600 text-sm">Simple, visual progress tracking</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                <Heart className="h-10 w-10 mx-auto mb-3 text-orange-500" />
                <h4 className="font-semibold text-lg mb-2">Focus on YOU</h4>
                <p className="text-gray-600 text-sm">No social comparison, just growth</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
                <Award className="h-10 w-10 mx-auto mb-3 text-amber-600" />
                <h4 className="font-semibold text-lg mb-2">Earn Rewards</h4>
                <p className="text-gray-600 text-sm">Points for every achievement</p>
              </div>
            </div>
          </div>

          {/* Pricing with Subscribe buttons */}
          <div id="pricing">
            <PricingSection />
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-lime-500/20 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-4">Ready to Start Your Growth Journey?</h3>
              <p className="text-xl mb-6 opacity-90">Start your 7 day free trial today - no credit card required</p>

              <AuthModal 
                defaultMode="signup"
                trigger={
                  <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 font-semibold px-8 shadow-lg">
                    <Flame className="h-5 w-5 mr-2" />
                    Begin Your Journey Now
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-950 text-white py-8 px-4 mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-6 w-6 text-lime-400" />
            <span className="font-bold text-lg text-green-100">Goals and Development</span>
          </div>
          <div className="flex items-center justify-center gap-6 mb-4 text-sm">
            <button onClick={() => navigate('/help')} className="text-green-400 hover:text-white transition-colors">Help & FAQ</button>
            <button onClick={() => navigate('/contact')} className="text-green-400 hover:text-white transition-colors">Contact</button>
            <button onClick={() => navigate('/about')} className="text-green-400 hover:text-white transition-colors">About</button>
          </div>
          <p className="text-green-400">&copy; {new Date().getFullYear()} Goals and Development. Transform your dreams into reality with <span className="text-orange-400">passion</span>.</p>
        </div>
      </footer>
    </div>
  );

};

export default DemoLayout;
