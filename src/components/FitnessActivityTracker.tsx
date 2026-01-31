import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Footprints, Flame, Clock, TrendingUp, Plus, Calendar, BarChart3 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { WeeklyFitnessChart } from './WeeklyFitnessChart';
import { FitnessCalendarView } from './FitnessCalendarView';

interface DailyActivity {
  date: string;
  steps: number;
  calories: number;
  distance: number;
  activeMinutes: number;
}

export const FitnessActivityTracker = () => {
  const [todayActivity, setTodayActivity] = useState<DailyActivity>({
    date: new Date().toISOString().split('T')[0],
    steps: 0,
    calories: 0,
    distance: 0,
    activeMinutes: 0
  });

  const [activityHistory, setActivityHistory] = useState<Record<string, DailyActivity>>({});
  const [manualSteps, setManualSteps] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualMinutes, setManualMinutes] = useState('');

  const goals = {
    steps: 10000,
    calories: 500,
    activeMinutes: 30
  };

  useEffect(() => {
    loadActivityData();
    requestMotionPermission();
  }, []);

  const loadActivityData = () => {
    const historyStored = localStorage.getItem('fitness_activity_history');
    if (historyStored) {
      const history = JSON.parse(historyStored);
      setActivityHistory(history);
      
      const today = new Date().toISOString().split('T')[0];
      if (history[today]) {
        setTodayActivity(history[today]);
      }
    }
  };

  const saveActivity = (activity: DailyActivity) => {
    const updated = { ...activityHistory, [activity.date]: activity };
    localStorage.setItem('fitness_activity_history', JSON.stringify(updated));
    setActivityHistory(updated);
    setTodayActivity(activity);
  };


  const requestMotionPermission = async () => {
    if (typeof (DeviceMotionEvent as any)?.requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        if (permission === 'granted') {
          startStepCounting();
        }
      } catch (error) {
        console.log('Motion permission denied');
      }
    }
  };

  const startStepCounting = () => {
    // Simplified step detection
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleMotion);
    }
  };

  const handleMotion = (event: DeviceMotionEvent) => {
    // Basic step detection logic
    const acceleration = event.accelerationIncludingGravity;
    if (acceleration && Math.abs(acceleration.y || 0) > 12) {
      incrementSteps(1);
    }
  };

  const incrementSteps = (count: number) => {
    const updated = { ...todayActivity, steps: todayActivity.steps + count };
    updated.distance = (updated.steps * 0.0005).toFixed(2) as any;
    updated.calories = Math.floor(updated.steps * 0.04);
    saveActivity(updated);
  };

  const handleManualEntry = () => {
    const steps = parseInt(manualSteps) || 0;
    const calories = parseInt(manualCalories) || 0;
    const minutes = parseInt(manualMinutes) || 0;

    const updated = {
      ...todayActivity,
      steps: todayActivity.steps + steps,
      calories: todayActivity.calories + calories,
      activeMinutes: todayActivity.activeMinutes + minutes,
      distance: ((todayActivity.steps + steps) * 0.0005).toFixed(2) as any
    };

    saveActivity(updated);
    setManualSteps('');
    setManualCalories('');
    setManualMinutes('');
    toast.success('Activity logged!');
  };

  const getWeekData = (): DailyActivity[] => {
    const week: DailyActivity[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      week.push(activityHistory[dateStr] || { date: dateStr, steps: 0, calories: 0, distance: 0, activeMinutes: 0 });
    }
    return week;
  };

  const calculateStreaks = () => {
    const dates = Object.keys(activityHistory).sort().reverse();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date().toISOString().split('T')[0];
    let checkDate = new Date();
    
    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const activity = activityHistory[dateStr];
      
      if (activity && activity.steps >= goals.steps) {
        tempStreak++;
        if (dateStr <= today && currentStreak === i) {
          currentStreak = tempStreak;
        }
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (dateStr < today) {
          tempStreak = 0;
        }
      }
      
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    return { currentStreak, longestStreak };
  };

  const { currentStreak, longestStreak } = calculateStreaks();

  const stepsProgress = (todayActivity.steps / goals.steps) * 100;
  const caloriesProgress = (todayActivity.calories / goals.calories) * 100;
  const minutesProgress = (todayActivity.activeMinutes / goals.activeMinutes) * 100;

  return (
    <Tabs defaultValue="today" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="today" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Today
        </TabsTrigger>
        <TabsTrigger value="week" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Week
        </TabsTrigger>
        <TabsTrigger value="calendar" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Calendar
        </TabsTrigger>
      </TabsList>

      <TabsContent value="today" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Footprints className="h-8 w-8 text-blue-500" />
                <Badge variant={stepsProgress >= 100 ? "default" : "secondary"}>
                  {stepsProgress.toFixed(0)}%
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{todayActivity.steps.toLocaleString()}</p>
                <p className="text-sm text-gray-600">of {goals.steps.toLocaleString()} steps</p>
                <Progress value={Math.min(stepsProgress, 100)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Flame className="h-8 w-8 text-orange-500" />
                <Badge variant={caloriesProgress >= 100 ? "default" : "secondary"}>
                  {caloriesProgress.toFixed(0)}%
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{todayActivity.calories}</p>
                <p className="text-sm text-gray-600">of {goals.calories} calories</p>
                <Progress value={Math.min(caloriesProgress, 100)} className="bg-orange-100" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-8 w-8 text-green-500" />
                <Badge variant={minutesProgress >= 100 ? "default" : "secondary"}>
                  {minutesProgress.toFixed(0)}%
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{todayActivity.activeMinutes}</p>
                <p className="text-sm text-gray-600">of {goals.activeMinutes} minutes</p>
                <Progress value={Math.min(minutesProgress, 100)} className="bg-green-100" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{todayActivity.distance}</p>
                <p className="text-sm text-gray-600">miles traveled</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Log Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Steps</Label>
                <Input type="number" placeholder="Enter steps" value={manualSteps}
                  onChange={(e) => setManualSteps(e.target.value)} />
              </div>
              <div>
                <Label>Calories Burned</Label>
                <Input type="number" placeholder="Enter calories" value={manualCalories}
                  onChange={(e) => setManualCalories(e.target.value)} />
              </div>
              <div>
                <Label>Active Minutes</Label>
                <Input type="number" placeholder="Enter minutes" value={manualMinutes}
                  onChange={(e) => setManualMinutes(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleManualEntry} className="mt-4 w-full">Log Activity</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="week">
        <WeeklyFitnessChart weekData={getWeekData()} goals={goals} />
      </TabsContent>

      <TabsContent value="calendar">
        <FitnessCalendarView activityData={activityHistory} goals={goals} 
          currentStreak={currentStreak} longestStreak={longestStreak} />
      </TabsContent>
    </Tabs>
  );
};

