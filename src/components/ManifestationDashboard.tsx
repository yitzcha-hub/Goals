import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { TrialBanner } from './TrialBanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OfflineIndicator } from './OfflineIndicator';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { ThemeToggle } from './ThemeToggle';
import { useManifestationDatabase } from '@/hooks/useManifestationDatabase';
import { 
  Leaf, LogOut, Target, Calendar, Star, Heart, BookOpen, 
  Award, TrendingUp, Plus, Camera, Check, Trash2, Edit2,
  ChevronRight, Gift, Flame, Sun, Moon, Image
} from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  timeline: '30' | '60' | '90' | '1year' | '5year';
  progress: number;
  imageUrl?: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  recommendations: string[];
}


interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  points: number;
  createdAt: string;
}

interface GratitudeEntry {
  id: string;
  content: string;
  date: string;
}

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  mood: 'great' | 'good' | 'okay' | 'tough';
  date: string;
}

const ManifestationDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { isPremium, tier } = useSubscription();
  const [activeTab, setActiveTab] = useState('overview');

  const {
    goals,
    todos,
    gratitudeEntries,
    journalEntries,
    totalPoints,
    streak,
    loading: dbLoading,
    addGoal: addGoalDb,
    updateGoalProgress: updateGoalProgressDb,
    deleteGoal: deleteGoalDb,
    addTodo: addTodoDb,
    toggleTodo: toggleTodoDb,
    deleteTodo: deleteTodoDb,
    addGratitude: addGratitudeDb,
    addJournalEntry: addJournalEntryDb,
  } = useManifestationDatabase();

  // Dialog states
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showTodoDialog, setShowTodoDialog] = useState(false);
  const [showGratitudeDialog, setShowGratitudeDialog] = useState(false);
  const [showJournalDialog, setShowJournalDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  
  // Form states
  const [newGoal, setNewGoal] = useState({ title: '', description: '', timeline: '30' as const, priority: 'medium' as const, imageUrl: '' });
  const [newTodo, setNewTodo] = useState('');
  const [newGratitude, setNewGratitude] = useState('');
  const [newJournal, setNewJournal] = useState({ title: '', content: '', mood: 'good' as const, imageUrl: '' });

  const timelineLabels: Record<string, string> = {
    '30': '30 Days',
    '60': '60 Days',
    '90': '90 Days',
    '1year': '1 Year',
    '5year': '5 Year Plan'
  };


  // Suggested goal templates
  const suggestedGoals = [
    {
      title: 'Reach Ideal Weight',
      description: 'Achieve and maintain my target healthy weight through balanced nutrition and regular exercise.',
      timeline: '90' as const,
      priority: 'high' as const,
      imageUrl: '',
      icon: '⚖️'
    },
    {
      title: 'Intermittent Fasting',
      description: 'Establish a consistent fasting routine (16:8 or 18:6) to improve metabolic health and energy levels.',
      timeline: '30' as const,
      priority: 'high' as const,
      imageUrl: '',
      icon: '🕐'
    },
    {
      title: 'Daily Exercise Routine',
      description: 'Work out at least 30 minutes every day to build strength and improve overall fitness.',
      timeline: '30' as const,
      priority: 'medium' as const,
      imageUrl: '',
      icon: '💪'
    },
    {
      title: 'Read 12 Books This Year',
      description: 'Read one book per month to expand knowledge and develop a consistent reading habit.',
      timeline: '1year' as const,
      priority: 'medium' as const,
      imageUrl: '',
      icon: '📚'
    },
    {
      title: 'Save Emergency Fund',
      description: 'Build a 3-6 month emergency fund for financial security and peace of mind.',
      timeline: '1year' as const,
      priority: 'high' as const,
      imageUrl: '',
      icon: '💰'
    },
    {
      title: 'Learn a New Skill',
      description: 'Master a new skill or hobby that brings joy and personal growth.',
      timeline: '90' as const,
      priority: 'medium' as const,
      imageUrl: '',
      icon: '🎯'
    }
  ];

  const addSuggestedGoal = (suggested: typeof suggestedGoals[0]) => {
    addGoalDb({
      title: suggested.title,
      description: suggested.description,
      timeline: suggested.timeline,
      priority: suggested.priority,
      imageUrl: suggested.imageUrl,
      progress: 0,
      recommendations: generateRecommendations({ timeline: suggested.timeline })
    });
  };



  const generateRecommendations = (goal: Partial<Goal>): string[] => {
    const recs: string[] = [];
    if (goal.timeline === '30') {
      recs.push('Break this goal into weekly milestones');
      recs.push('Set daily check-in reminders');
      recs.push('Identify one action you can take today');
    } else if (goal.timeline === '5year') {
      recs.push('Create yearly milestones for this vision');
      recs.push('Identify skills you need to develop');
      recs.push('Find a mentor or community for support');
    } else {
      recs.push('Review progress weekly');
      recs.push('Celebrate small wins along the way');
      recs.push('Adjust your approach if needed');
    }
    return recs;
  };

  // Goal functions
  const addGoal = () => {
    if (!newGoal.title.trim()) return;
    addGoalDb({
      ...newGoal,
      progress: 0,
      recommendations: generateRecommendations(newGoal)
    });
    setNewGoal({ title: '', description: '', timeline: '30', priority: 'medium', imageUrl: '' });
    setShowGoalDialog(false);
  };

  const updateGoalProgress = (goalId: string, progress: number) => {
    updateGoalProgressDb(goalId, progress);
  };

  const deleteGoal = (goalId: string) => {
    deleteGoalDb(goalId);
  };

  // Todo functions
  const addTodo = () => {
    if (!newTodo.trim()) return;
    addTodoDb({ title: newTodo, completed: false, points: 5 });
    setNewTodo('');
    setShowTodoDialog(false);
  };

  const toggleTodo = (todoId: string) => {
    toggleTodoDb(todoId);
  };

  const deleteTodo = (todoId: string) => {
    deleteTodoDb(todoId);
  };

  // Gratitude functions
  const addGratitude = () => {
    if (!newGratitude.trim()) return;
    addGratitudeDb(newGratitude);
    setNewGratitude('');
    setShowGratitudeDialog(false);
  };

  // Journal functions
  const addJournalEntry = () => {
    if (!newJournal.title.trim() || !newJournal.content.trim()) return;
    addJournalEntryDb({
      ...newJournal,
      date: new Date().toISOString().split('T')[0]
    });
    setNewJournal({ title: '', content: '', mood: 'good', imageUrl: '' });
    setShowJournalDialog(false);
  };

  const getGoalsByTimeline = (timeline: string) => goals.filter(g => g.timeline === timeline);

  const stats = {
    totalGoals: goals.length,
    completedGoals: goals.filter(g => g.progress === 10).length,
    todosCompleted: todos.filter(t => t.completed).length,
    totalTodos: todos.length,
    gratitudeCount: gratitudeEntries.length,
    journalCount: journalEntries.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-lime-50 to-emerald-100 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900">
      {/* Header */}
      <div className="bg-white/90 dark:bg-stone-800/90 backdrop-blur-md shadow-sm border-b border-green-200 dark:border-stone-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-lime-500 rounded-xl flex items-center justify-center">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-lime-500 bg-clip-text text-transparent">
                Goals and Development
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-lime-100 dark:from-green-900/30 dark:to-lime-900/30 px-4 py-2 rounded-full">
                <Star className="h-5 w-5 text-green-600" />
                <span className="font-bold text-green-800 dark:text-green-400">{totalPoints} pts</span>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 px-4 py-2 rounded-full">
                <Flame className="h-5 w-5 text-orange-600" />
                <span className="font-bold text-orange-800 dark:text-orange-400">{streak} day streak</span>
              </div>
              <ThemeToggle />
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-green-600 to-lime-500 text-white">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium dark:text-white">{user?.email?.split('@')[0]}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => signOut()} className="border-green-300 text-green-700 hover:bg-green-50">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trial Banner */}
        <div className="mb-6">
          <TrialBanner />
        </div>

        {/* Welcome Section */}
        <div className="mb-8 bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-lime-500/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">
              Welcome back, {user?.email?.split('@')[0]}!
            </h2>
            <p className="text-white/80 mb-4">Keep growing and achieving. Every step counts!</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/20 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold">{stats.totalGoals}</p>
                <p className="text-sm text-white/80">Active Goals</p>
              </div>
              <div className="bg-white/20 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold">{stats.completedGoals}</p>
                <p className="text-sm text-white/80">Completed</p>
              </div>
              <div className="bg-white/20 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold">{stats.todosCompleted}/{stats.totalTodos}</p>
                <p className="text-sm text-white/80">Tasks Done</p>
              </div>
              <div className="bg-white/20 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold">{stats.gratitudeCount}</p>
                <p className="text-sm text-white/80">Gratitude Entries</p>
              </div>
            </div>
          </div>
        </div>


        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-6 gap-1 h-auto p-1 bg-white dark:bg-stone-800 rounded-xl shadow-sm mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800">
              <Target className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800">
              <Calendar className="h-4 w-4 mr-2" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="todos" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800">
              <Check className="h-4 w-4 mr-2" />
              To-Do List
            </TabsTrigger>
            <TabsTrigger value="gratitude" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800">
              <Heart className="h-4 w-4 mr-2" />
              Gratitude
            </TabsTrigger>
            <TabsTrigger value="journal" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800">
              <BookOpen className="h-4 w-4 mr-2" />
              Journal
            </TabsTrigger>
            <TabsTrigger value="rewards" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800">
              <Award className="h-4 w-4 mr-2" />
              Rewards
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Add */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-green-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <Button onClick={() => setShowGoalDialog(true)} className="h-20 flex-col bg-gradient-to-br from-green-600 to-lime-500 hover:from-green-700 hover:to-lime-600">
                    <Target className="h-6 w-6 mb-1" />
                    Add Goal
                  </Button>
                  <Button onClick={() => setShowTodoDialog(true)} variant="outline" className="h-20 flex-col border-2 hover:bg-orange-50">
                    <Check className="h-6 w-6 mb-1 text-green-600" />
                    Add Task
                  </Button>
                  <Button onClick={() => setShowGratitudeDialog(true)} variant="outline" className="h-20 flex-col border-2 hover:bg-orange-50">
                    <Heart className="h-6 w-6 mb-1 text-orange-600" />
                    Gratitude
                  </Button>
                  <Button onClick={() => setShowJournalDialog(true)} variant="outline" className="h-20 flex-col border-2 hover:bg-gray-50">
                    <BookOpen className="h-6 w-6 mb-1 text-gray-600" />
                    Journal
                  </Button>
                </CardContent>
              </Card>


              {/* Recent Goals */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-emerald-700" />
                      Recent Goals
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('goals')}>
                      View All <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goals.slice(0, 3).map(goal => (
                    <div key={goal.id} className="p-4 bg-stone-50 dark:bg-stone-800 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold dark:text-white">{goal.title}</h4>
                          <Badge variant="outline" className="mt-1">{timelineLabels[goal.timeline]}</Badge>
                        </div>
                        <span className="text-2xl font-bold text-emerald-700">{goal.progress}/10</span>
                      </div>
                      <Progress value={goal.progress * 10} className="h-2" />
                    </div>
                  ))}
                  {goals.length === 0 && (
                    <div className="text-center py-8 text-stone-500">
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No goals yet. Start your journey!</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Today's Gratitude */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-orange-600" />
                    Recent Gratitude
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {gratitudeEntries.slice(0, 3).map(entry => (
                    <div key={entry.id} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg mb-2">
                      <p className="text-stone-700 dark:text-stone-300">{entry.content}</p>
                      <p className="text-xs text-stone-500 mt-1">{new Date(entry.date).toLocaleDateString()}</p>
                    </div>
                  ))}
                  {gratitudeEntries.length === 0 && (
                    <div className="text-center py-6 text-stone-500">
                      <Heart className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>What are you grateful for today?</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-stone-50 dark:from-amber-900/20 dark:to-stone-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-emerald-700" />
                    Smart Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {goals.length > 0 ? (
                    goals.slice(0, 2).flatMap(goal => 
                      goal.recommendations.slice(0, 2).map((rec, i) => (
                        <div key={`${goal.id}-${i}`} className="flex items-start gap-3 p-3 bg-white dark:bg-stone-800 rounded-lg">
                          <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="h-4 w-4 text-amber-700" />
                          </div>
                          <div>
                            <p className="text-sm font-medium dark:text-white">{goal.title}</p>
                            <p className="text-sm text-stone-600 dark:text-stone-400">{rec}</p>
                          </div>
                        </div>
                      ))
                    )
                  ) : (
                    <div className="text-center py-6 text-stone-500">
                      <Leaf className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>Add goals to get personalized recommendations</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold dark:text-white">Your Goals</h3>
              <Button onClick={() => setShowGoalDialog(true)} className="bg-gradient-to-r from-emerald-700 to-amber-600">
                <Plus className="h-4 w-4 mr-2" />
                Add New Goal
              </Button>
            </div>

            {/* Suggested Goals Section */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-emerald-900/20 dark:to-amber-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-emerald-700" />
                  Suggested Goals
                </CardTitle>
                <CardDescription>Click to add these popular goals to your list</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {suggestedGoals.map((suggested, index) => {
                    const isAlreadyAdded = goals.some(g => g.title === suggested.title);
                    return (
                      <button
                        key={index}
                        onClick={() => !isAlreadyAdded && addSuggestedGoal(suggested)}
                        disabled={isAlreadyAdded}
                        className={`p-4 rounded-xl text-center transition-all ${
                          isAlreadyAdded 
                            ? 'bg-stone-100 dark:bg-stone-800 opacity-50 cursor-not-allowed' 
                            : 'bg-white dark:bg-stone-800 hover:shadow-lg hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-emerald-300'
                        }`}
                      >
                        <span className="text-2xl mb-2 block">{suggested.icon}</span>
                        <p className="font-medium text-sm dark:text-white">{suggested.title}</p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {timelineLabels[suggested.timeline]}
                        </Badge>
                        {isAlreadyAdded && (
                          <p className="text-xs text-emerald-600 mt-1">Added</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Goal Timeline Sections */}
            {['30', '60', '90', '1year', '5year'].map(timeline => {

              const timelineGoals = getGoalsByTimeline(timeline);
              if (timelineGoals.length === 0) return null;
              
              return (
                <div key={timeline}>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
                    <Calendar className="h-5 w-5 text-emerald-700" />
                    {timelineLabels[timeline]} Goals
                    <Badge variant="secondary">{timelineGoals.length}</Badge>
                  </h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    {timelineGoals.map(goal => (
                      <Card key={goal.id} className="border-0 shadow-lg overflow-hidden">
                        {goal.imageUrl && (
                          <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${goal.imageUrl})` }} />
                        )}
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-semibold text-lg dark:text-white">{goal.title}</h4>
                              <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">{goal.description}</p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline">{timelineLabels[goal.timeline]}</Badge>
                                <Badge className={
                                  goal.priority === 'high' ? 'bg-red-100 text-red-700' :
                                  goal.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                  'bg-emerald-100 text-emerald-700'
                                }>
                                  {goal.priority} priority
                                </Badge>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => deleteGoal(goal.id)}>
                              <Trash2 className="h-4 w-4 text-stone-400 hover:text-red-500" />
                            </Button>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium dark:text-white">Progress</span>
                              <span className="text-2xl font-bold text-emerald-700">{goal.progress}/10</span>
                            </div>
                            <Slider
                              value={[goal.progress]}
                              onValueChange={(value) => updateGoalProgress(goal.id, value[0])}
                              max={10}
                              step={1}
                              className="w-full"
                            />
                            <Progress value={goal.progress * 10} className="h-2" />
                          </div>

                          {goal.recommendations.length > 0 && (
                            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                              <p className="text-xs font-semibold text-amber-800 dark:text-amber-400 mb-2">RECOMMENDATIONS</p>
                              <ul className="space-y-1">
                                {goal.recommendations.map((rec, i) => (
                                  <li key={i} className="text-sm text-stone-600 dark:text-stone-400 flex items-start gap-2">
                                    <ChevronRight className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}

            {goals.length === 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Target className="h-16 w-16 mx-auto mb-4 text-stone-300" />
                  <h4 className="text-xl font-semibold mb-2 dark:text-white">No Goals Yet</h4>
                  <p className="text-stone-500 mb-4">Start your growth journey by adding your first goal or choose from the suggestions above</p>
                  <Button onClick={() => setShowGoalDialog(true)} className="bg-gradient-to-r from-emerald-700 to-amber-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Goal
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>


          {/* To-Do List Tab */}
          <TabsContent value="todos" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold dark:text-white">To-Do List</h3>
                <p className="text-stone-600 dark:text-stone-400">Tasks that need done - earn 5 points each!</p>
              </div>
              <Button onClick={() => setShowTodoDialog(true)} className="bg-gradient-to-r from-emerald-700 to-amber-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                {todos.length > 0 ? (
                  <div className="space-y-3">
                    {todos.map(todo => (
                      <div 
                        key={todo.id} 
                        className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                          todo.completed 
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800' 
                            : 'bg-stone-50 dark:bg-stone-800 border-2 border-transparent hover:border-amber-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleTodo(todo.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              todo.completed 
                                ? 'bg-emerald-600 border-emerald-600' 
                                : 'border-stone-300 hover:border-emerald-600'
                            }`}
                          >
                            {todo.completed && <Check className="h-4 w-4 text-white" />}
                          </button>
                          <span className={`font-medium ${todo.completed ? 'line-through text-stone-400' : 'dark:text-white'}`}>
                            {todo.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-amber-100 text-amber-800">+{todo.points} pts</Badge>
                          <Button variant="ghost" size="sm" onClick={() => deleteTodo(todo.id)}>
                            <Trash2 className="h-4 w-4 text-stone-400 hover:text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Check className="h-16 w-16 mx-auto mb-4 text-stone-300" />
                    <h4 className="text-xl font-semibold mb-2 dark:text-white">No Tasks Yet</h4>
                    <p className="text-stone-500 mb-4">Add tasks to earn points and stay productive</p>
                    <Button onClick={() => setShowTodoDialog(true)} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Task
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gratitude Tab */}
          <TabsContent value="gratitude" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold dark:text-white">Gratitude Journal</h3>
                <p className="text-stone-600 dark:text-stone-400">What are you thankful for today?</p>
              </div>
              <Button onClick={() => setShowGratitudeDialog(true)} className="bg-gradient-to-r from-orange-600 to-amber-600">
                <Heart className="h-4 w-4 mr-2" />
                Add Gratitude
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {gratitudeEntries.map(entry => (
                <Card key={entry.id} className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
                  <CardContent className="p-6">
                    <Heart className="h-8 w-8 text-orange-500 mb-3" />
                    <p className="text-stone-700 dark:text-stone-300 mb-3">{entry.content}</p>
                    <p className="text-sm text-stone-500">{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {gratitudeEntries.length === 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Heart className="h-16 w-16 mx-auto mb-4 text-orange-200" />
                  <h4 className="text-xl font-semibold mb-2 dark:text-white">Start Your Gratitude Practice</h4>
                  <p className="text-stone-500 mb-4">Recording what you're thankful for increases happiness and positivity</p>
                  <Button onClick={() => setShowGratitudeDialog(true)} className="bg-gradient-to-r from-orange-600 to-amber-600">
                    <Heart className="h-4 w-4 mr-2" />
                    Add Your First Entry
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Journal Tab */}
          <TabsContent value="journal" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold dark:text-white">Life Journal</h3>
                <p className="text-stone-600 dark:text-stone-400">A life worth living is worth recording</p>
              </div>
              <Button onClick={() => setShowJournalDialog(true)} className="bg-gradient-to-r from-stone-600 to-stone-700">
                <BookOpen className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </div>

            <div className="grid gap-6">
              {journalEntries.map(entry => (
                <Card key={entry.id} className="border-0 shadow-lg overflow-hidden">
                  <div className="md:flex">
                    {entry.imageUrl && (
                      <div className="md:w-1/3 h-48 md:h-auto bg-cover bg-center" style={{ backgroundImage: `url(${entry.imageUrl})` }} />
                    )}
                    <CardContent className={`p-6 ${entry.imageUrl ? 'md:w-2/3' : 'w-full'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={
                          entry.mood === 'great' ? 'bg-emerald-100 text-emerald-700' :
                          entry.mood === 'good' ? 'bg-amber-100 text-amber-700' :
                          entry.mood === 'okay' ? 'bg-orange-100 text-orange-700' :
                          'bg-stone-100 text-stone-700'
                        }>
                          {entry.mood === 'great' ? 'Great Day' :
                           entry.mood === 'good' ? 'Good Day' :
                           entry.mood === 'okay' ? 'Okay Day' :
                           'Tough Day'}
                        </Badge>
                        <span className="text-sm text-stone-500">
                          {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      <h4 className="text-xl font-semibold mb-2 dark:text-white">{entry.title}</h4>
                      <p className="text-stone-600 dark:text-stone-400">{entry.content}</p>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>

            {journalEntries.length === 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-stone-300" />
                  <h4 className="text-xl font-semibold mb-2 dark:text-white">Start Your Life Journal</h4>
                  <p className="text-stone-500 mb-4">Document your journey, memories, and growth</p>
                  <Button onClick={() => setShowJournalDialog(true)} className="bg-gradient-to-r from-stone-600 to-stone-700">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Write Your First Entry
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 px-8 py-4 rounded-2xl mb-4">
                <Star className="h-10 w-10 text-amber-600" />
                <span className="text-4xl font-bold text-amber-800 dark:text-amber-400">{totalPoints}</span>
                <span className="text-xl text-amber-700 dark:text-amber-500">Total Points</span>
              </div>
              <p className="text-stone-600 dark:text-stone-400">Keep earning points by achieving goals and completing tasks!</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
                <CardContent className="p-6 text-center">
                  <Target className="h-12 w-12 mx-auto mb-3 text-emerald-700" />
                  <h4 className="font-semibold text-lg mb-1 dark:text-white">Add a Goal</h4>
                  <p className="text-stone-600 dark:text-stone-400 text-sm mb-2">+10 points</p>
                  <Badge className="bg-emerald-100 text-emerald-700">Goal Setting</Badge>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                <CardContent className="p-6 text-center">
                  <Award className="h-12 w-12 mx-auto mb-3 text-amber-700" />
                  <h4 className="font-semibold text-lg mb-1 dark:text-white">Complete a Goal</h4>
                  <p className="text-stone-600 dark:text-stone-400 text-sm mb-2">+100 points</p>
                  <Badge className="bg-amber-100 text-amber-700">Achievement</Badge>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20">
                <CardContent className="p-6 text-center">
                  <Check className="h-12 w-12 mx-auto mb-3 text-teal-700" />
                  <h4 className="font-semibold text-lg mb-1 dark:text-white">Complete a Task</h4>
                  <p className="text-stone-600 dark:text-stone-400 text-sm mb-2">+5 points</p>
                  <Badge className="bg-teal-100 text-teal-700">Productivity</Badge>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
                <CardContent className="p-6 text-center">
                  <Heart className="h-12 w-12 mx-auto mb-3 text-orange-600" />
                  <h4 className="font-semibold text-lg mb-1 dark:text-white">Gratitude Entry</h4>
                  <p className="text-stone-600 dark:text-stone-400 text-sm mb-2">+5 points</p>
                  <Badge className="bg-orange-100 text-orange-700">Mindfulness</Badge>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-800/50 dark:to-stone-900/50">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 text-stone-600" />
                  <h4 className="font-semibold text-lg mb-1 dark:text-white">Journal Entry</h4>
                  <p className="text-stone-600 dark:text-stone-400 text-sm mb-2">+15 points</p>
                  <Badge className="bg-stone-200 text-stone-700">Reflection</Badge>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                <CardContent className="p-6 text-center">
                  <Flame className="h-12 w-12 mx-auto mb-3 text-orange-600" />
                  <h4 className="font-semibold text-lg mb-1 dark:text-white">Daily Streak</h4>
                  <p className="text-stone-600 dark:text-stone-400 text-sm mb-2">{streak} days</p>
                  <Badge className="bg-orange-100 text-orange-700">Consistency</Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Goal Dialog */}
      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Goal</DialogTitle>
            <DialogDescription>What do you want to achieve?</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Goal Title</label>
              <Input 
                placeholder="e.g., Learn a new language" 
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                placeholder="Describe your goal in detail..."
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Timeline</label>
              <Select value={newGoal.timeline} onValueChange={(value: any) => setNewGoal({ ...newGoal, timeline: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="60">60 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                  <SelectItem value="5year">5 Year Plan</SelectItem>
                </SelectContent>

              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select value={newGoal.priority} onValueChange={(value: any) => setNewGoal({ ...newGoal, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Vision Photo URL (optional)</label>
              <Input 
                placeholder="https://example.com/dream-image.jpg"
                value={newGoal.imageUrl}
                onChange={(e) => setNewGoal({ ...newGoal, imageUrl: e.target.value })}
              />
              <p className="text-xs text-stone-500 mt-1">Add an image that represents your goal</p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowGoalDialog(false)}>Cancel</Button>
            <Button onClick={addGoal} className="bg-gradient-to-r from-emerald-700 to-amber-600">Add Goal</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Todo Dialog */}
      <Dialog open={showTodoDialog} onOpenChange={setShowTodoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>What needs to get done?</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              placeholder="e.g., Call the dentist"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowTodoDialog(false)}>Cancel</Button>
            <Button onClick={addTodo}>Add Task</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gratitude Dialog */}
      <Dialog open={showGratitudeDialog} onOpenChange={setShowGratitudeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>What Are You Grateful For?</DialogTitle>
            <DialogDescription>Take a moment to appreciate the good in your life</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              placeholder="I'm grateful for..."
              value={newGratitude}
              onChange={(e) => setNewGratitude(e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowGratitudeDialog(false)}>Cancel</Button>
            <Button onClick={addGratitude} className="bg-gradient-to-r from-orange-600 to-amber-600">Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Journal Dialog */}
      <Dialog open={showJournalDialog} onOpenChange={setShowJournalDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Journal Entry</DialogTitle>
            <DialogDescription>Record your thoughts, memories, and experiences</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input 
                placeholder="e.g., A wonderful day at the beach"
                value={newJournal.title}
                onChange={(e) => setNewJournal({ ...newJournal, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">How was your day?</label>
              <Select value={newJournal.mood} onValueChange={(value: any) => setNewJournal({ ...newJournal, mood: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="great">Great Day</SelectItem>
                  <SelectItem value="good">Good Day</SelectItem>
                  <SelectItem value="okay">Okay Day</SelectItem>
                  <SelectItem value="tough">Tough Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Your Entry</label>
              <Textarea 
                placeholder="Write about your day..."
                value={newJournal.content}
                onChange={(e) => setNewJournal({ ...newJournal, content: e.target.value })}
                rows={5}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Photo URL (optional)</label>
              <Input 
                placeholder="https://example.com/photo.jpg"
                value={newJournal.imageUrl}
                onChange={(e) => setNewJournal({ ...newJournal, imageUrl: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowJournalDialog(false)}>Cancel</Button>
            <Button onClick={addJournalEntry} className="bg-gradient-to-r from-stone-600 to-stone-700">Save Entry</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Offline Indicator */}
      <OfflineIndicator />
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
};

export default ManifestationDashboard;
