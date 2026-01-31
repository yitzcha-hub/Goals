import { Card } from '@/components/ui/card';
import { Trophy, Star, Target, Zap, Heart, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned_at: string;
}

interface FamilyAchievementsProps {
  achievements: Achievement[];
}

const iconMap: Record<string, any> = {
  trophy: Trophy,
  star: Star,
  target: Target,
  zap: Zap,
  heart: Heart,
  award: Award,
};

export function FamilyAchievements({ achievements }: FamilyAchievementsProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-bold">Family Achievements</h2>
        <Badge className="ml-auto bg-purple-600">{achievements.length}</Badge>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Complete goals together to earn achievements!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => {
            const IconComponent = iconMap[achievement.icon] || Trophy;
            return (
              <div
                key={achievement.id}
                className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200"
              >
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{achievement.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                  <p className="text-xs text-purple-600">
                    Earned {new Date(achievement.earned_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
