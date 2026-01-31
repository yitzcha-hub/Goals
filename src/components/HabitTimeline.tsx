import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';

interface Habit {
  id: number;
  name: string;
  color: string;
  streak: number;
}

interface HabitTimelineProps {
  habits: Habit[];
}

const HabitTimeline: React.FC<HabitTimelineProps> = ({ habits }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Generate mock data for the timeline (last 30 days)
  const generateTimelineData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const dayData = {
        date: date,
        habits: habits.map(habit => ({
          ...habit,
          completed: Math.random() > 0.3, // Random completion for demo
          completionTime: Math.random() > 0.5 ? `${Math.floor(Math.random() * 12) + 8}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} AM` : null
        }))
      };
      
      data.push(dayData);
    }
    
    return data;
  };

  const timelineData = generateTimelineData();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const getWeekData = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const dayData = timelineData.find(d => 
        d.date.toDateString() === date.toDateString()
      );
      
      return dayData || {
        date,
        habits: habits.map(habit => ({ ...habit, completed: false, completionTime: null }))
      };
    });
  };

  const weekData = getWeekData();

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Timeline
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {weekData[0]?.date.toLocaleDateString()} - {weekData[6]?.date.toLocaleDateString()}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekData.map((day, dayIndex) => (
              <div key={dayIndex} className="space-y-2">
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-600">
                    {weekDays[day.date.getDay()]}
                  </div>
                  <div className="text-sm font-semibold">
                    {day.date.getDate()}
                  </div>
                </div>
                
                <div className="space-y-1">
                  {day.habits.map((habit) => (
                    <div
                      key={habit.id}
                      className={`w-full h-8 rounded flex items-center justify-center ${
                        habit.completed 
                          ? habit.color 
                          : 'bg-gray-200'
                      }`}
                      title={`${habit.name} - ${habit.completed ? 'Completed' : 'Not completed'}`}
                    >
                      {habit.completed ? (
                        <Check className="h-3 w-3 text-white" />
                      ) : (
                        <X className="h-3 w-3 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Habit Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Habit Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {habits.map((habit) => (
              <div key={habit.id} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${habit.color}`}></div>
                <span className="text-sm font-medium">{habit.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Details */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {habits.map((habit) => {
              const todayData = weekData.find(d => 
                d.date.toDateString() === new Date().toDateString()
              )?.habits.find(h => h.id === habit.id);
              
              return (
                <div key={habit.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${habit.color}`}></div>
                    <span className="font-medium">{habit.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {todayData?.completed ? (
                      <>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Completed
                        </Badge>
                        {todayData.completionTime && (
                          <span className="text-xs text-gray-600">
                            at {todayData.completionTime}
                          </span>
                        )}
                      </>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HabitTimeline;