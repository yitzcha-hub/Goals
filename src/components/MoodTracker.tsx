import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Smile, Meh, Frown, TrendingUp } from 'lucide-react';

interface MoodData {
  date: string;
  mood: string;
}

interface MoodTrackerProps {
  entries: MoodData[];
}

const moods = [
  { value: 'amazing', label: 'Amazing', icon: Heart, color: 'bg-pink-500', textColor: 'text-pink-500' },
  { value: 'happy', label: 'Happy', icon: Smile, color: 'bg-green-500', textColor: 'text-green-500' },
  { value: 'neutral', label: 'Neutral', icon: Meh, color: 'bg-gray-500', textColor: 'text-gray-500' },
  { value: 'sad', label: 'Sad', icon: Frown, color: 'bg-blue-500', textColor: 'text-blue-500' },
];

const MoodTracker: React.FC<MoodTrackerProps> = ({ entries }) => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const getMoodForDate = (date: string) => {
    const entry = entries.find(e => e.date === date);
    return entry?.mood || null;
  };

  const getMoodStats = () => {
    const moodCounts = moods.reduce((acc, mood) => {
      acc[mood.value] = entries.filter(e => e.mood === mood.value).length;
      return acc;
    }, {} as Record<string, number>);

    const total = entries.length;
    return moods.map(mood => ({
      ...mood,
      count: moodCounts[mood.value] || 0,
      percentage: total > 0 ? Math.round((moodCounts[mood.value] || 0) / total * 100) : 0
    }));
  };

  const moodStats = getMoodStats();
  const recentMood = entries.length > 0 ? entries[entries.length - 1]?.mood : null;
  const recentMoodData = moods.find(m => m.value === recentMood);

  return (
    <div className="space-y-6">
      {/* Current Mood */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Mood Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            {recentMoodData ? (
              <>
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${recentMoodData.color} mb-2`}>
                  <recentMoodData.icon className="h-8 w-8 text-white" />
                </div>
                <p className="text-lg font-medium">Latest mood: {recentMoodData.label}</p>
              </>
            ) : (
              <p className="text-gray-500">No mood entries yet</p>
            )}
          </div>

          {/* Last 7 Days */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">Last 7 Days</h4>
            <div className="flex gap-1 justify-center">
              {last7Days.map((date, index) => {
                const mood = getMoodForDate(date);
                const moodData = moods.find(m => m.value === mood);
                const dayName = new Date(date).toLocaleDateString('en', { weekday: 'short' });
                
                return (
                  <div key={date} className="flex flex-col items-center gap-1">
                    <div className="text-xs text-gray-500">{dayName}</div>
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      moodData 
                        ? `${moodData.color} border-transparent` 
                        : 'border-gray-200 bg-gray-50'
                    }`}>
                      {moodData && (
                        <moodData.icon className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mood Distribution */}
          <div>
            <h4 className="text-sm font-medium mb-3">Mood Distribution</h4>
            <div className="space-y-2">
              {moodStats.map((mood) => (
                <div key={mood.value} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${mood.color}`}></div>
                  <span className="text-sm flex-1">{mood.label}</span>
                  <span className="text-sm text-gray-500">{mood.count} ({mood.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MoodTracker;