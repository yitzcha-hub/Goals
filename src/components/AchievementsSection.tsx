import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import AchievementBadge from './AchievementBadge';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: number;
  maxProgress?: number;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedDate?: string;
}

interface AchievementsSectionProps {
  achievements: Achievement[];
  totalPoints: number;
}

const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  achievements,
  totalPoints
}) => {
  const earnedAchievements = achievements.filter(a => a.earned);
  const unearned = achievements.filter(a => !a.earned);
  
  const categories = ['all', 'goals', 'streaks', 'progress', 'tasks'];

  const getAchievementsByCategory = (category: string, earned: boolean) => {
    const filtered = earned ? earnedAchievements : unearned;
    return category === 'all' ? filtered : filtered.filter(a => a.category === category);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🏆 Achievements</span>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                {earnedAchievements.length}/{achievements.length} Earned
              </Badge>
              <Badge className="bg-slate-600 hover:bg-slate-700 text-white">
                {totalPoints} Points
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="earned" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="earned">Earned ({earnedAchievements.length})</TabsTrigger>
              <TabsTrigger value="progress">In Progress ({unearned.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="earned" className="mt-6">
              <Tabs defaultValue="all" orientation="horizontal">
                <TabsList className="mb-4">
                  {categories.map(cat => (
                    <TabsTrigger key={cat} value={cat} className="capitalize">
                      {cat} ({getAchievementsByCategory(cat, true).length})
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {categories.map(category => (
                  <TabsContent key={category} value={category}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getAchievementsByCategory(category, true).map(achievement => (
                        <AchievementBadge key={achievement.id} {...achievement} />
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </TabsContent>
            
            <TabsContent value="progress" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unearned.map(achievement => (
                  <AchievementBadge key={achievement.id} {...achievement} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementsSection;