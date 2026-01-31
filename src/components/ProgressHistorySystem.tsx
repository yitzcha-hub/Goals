import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Calendar, Clock, Target, TrendingUp, CheckCircle2, XCircle, Edit, Plus, Minus, Trophy, Star } from 'lucide-react';
import { format } from 'date-fns';

interface HistoryEvent {
  id: string;
  goalId: string;
  goalTitle: string;
  type: 'created' | 'updated' | 'completed' | 'abandoned' | 'milestone' | 'progress';
  timestamp: Date;
  description: string;
  oldValue?: number;
  newValue?: number;
  notes?: string;
  icon: React.ReactNode;
  color: string;
}

interface ProgressHistorySystemProps {
  events: HistoryEvent[];
  goals: any[];
}

const ProgressHistorySystem: React.FC<ProgressHistorySystemProps> = ({ events, goals }) => {
  const [selectedGoal, setSelectedGoal] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'all' | 'week' | 'month' | 'year'>('all');

  const filteredEvents = events.filter(event => {
    const goalMatch = selectedGoal === 'all' || event.goalId === selectedGoal;
    const now = new Date();
    let timeMatch = true;
    
    if (timeRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      timeMatch = event.timestamp >= weekAgo;
    } else if (timeRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      timeMatch = event.timestamp >= monthAgo;
    } else if (timeRange === 'year') {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      timeMatch = event.timestamp >= yearAgo;
    }
    
    return goalMatch && timeMatch;
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'created': return <Plus className="h-4 w-4" />;
      case 'updated': return <Edit className="h-4 w-4" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'abandoned': return <XCircle className="h-4 w-4" />;
      case 'milestone': return <Trophy className="h-4 w-4" />;
      case 'progress': return <TrendingUp className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'created': return 'bg-slate-500';
      case 'updated': return 'bg-slate-600';
      case 'completed': return 'bg-slate-800';
      case 'abandoned': return 'bg-gray-500';
      case 'milestone': return 'bg-slate-700';
      default: return 'bg-gray-400';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Progress History & Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedGoal}
              onChange={(e) => setSelectedGoal(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">All Goals</option>
              {goals.map(goal => (
                <option key={goal.id} value={goal.id}>{goal.title}</option>
              ))}
            </select>
            
            <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
              <TabsList>
                <TabsTrigger value="all">All Time</TabsTrigger>
                <TabsTrigger value="week">This Week</TabsTrigger>
                <TabsTrigger value="month">This Month</TabsTrigger>
                <TabsTrigger value="year">This Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Timeline */}
          <ScrollArea className="h-[500px] pr-4">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              {/* Events */}
              <div className="space-y-6">
                {filteredEvents.map((event, index) => (
                  <div key={event.id} className="relative flex items-start">
                    {/* Timeline dot */}
                    <div className={`absolute left-2.5 w-3 h-3 rounded-full ${getEventColor(event.type)} ring-4 ring-white`}></div>
                    
                    {/* Event card */}
                    <div className="ml-10 flex-1">
                      <Card className="border-l-4" style={{ borderLeftColor: getEventColor(event.type).replace('bg-', '#').replace('500', '') }}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`p-1 rounded ${getEventColor(event.type)} text-white`}>
                                  {getEventIcon(event.type)}
                                </div>
                                <h4 className="font-semibold">{event.goalTitle}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {event.type}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                              
                              {event.oldValue !== undefined && event.newValue !== undefined && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-gray-500">{event.oldValue}%</span>
                                  <span>→</span>
                                  <span className="font-semibold text-slate-700">{event.newValue}%</span>
                                  <Badge className="bg-slate-100 text-slate-800">
                                    +{event.newValue - event.oldValue}%
                                  </Badge>
                                </div>
                              )}
                              {event.notes && (
                                <p className="text-sm text-gray-500 mt-2 italic">"{event.notes}"</p>
                              )}
                            </div>
                            
                            <div className="text-right text-xs text-gray-500">
                              <div>{format(event.timestamp, 'MMM d, yyyy')}</div>
                              <div>{format(event.timestamp, 'h:mm a')}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-slate-600">
                  {events.filter(e => e.type === 'created').length}
                </div>
                <div className="text-sm text-gray-500">Goals Created</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-slate-700">
                  {events.filter(e => e.type === 'completed').length}
                </div>
                <div className="text-sm text-gray-500">Completed</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-slate-800">
                  {events.filter(e => e.type === 'milestone').length}
                </div>
                <div className="text-sm text-gray-500">Milestones</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {events.length}
                </div>
                <div className="text-sm text-gray-500">Total Updates</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressHistorySystem;