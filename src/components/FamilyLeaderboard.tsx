import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LeaderboardEntry {
  user_id: string;
  name: string;
  points: number;
  tasks_completed: number;
  goals_contributed: number;
  rank: number;
}

interface FamilyLeaderboardProps {
  members: LeaderboardEntry[];
}

export function FamilyLeaderboard({ members }: FamilyLeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 border-yellow-200';
      case 2:
        return 'bg-gray-50 border-gray-200';
      case 3:
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-bold">Family Leaderboard</h2>
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.user_id}
            className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${getRankColor(member.rank)}`}
          >
            <div className="flex-shrink-0">
              {getRankIcon(member.rank)}
            </div>

            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-purple-600 text-white">
                {member.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h3 className="font-semibold">{member.name}</h3>
              <div className="flex gap-3 text-sm text-gray-600">
                <span>{member.tasks_completed} tasks</span>
                <span>•</span>
                <span>{member.goals_contributed} goals</span>
              </div>
            </div>

            <Badge className="bg-purple-600 text-white text-lg px-3 py-1">
              {member.points} pts
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
