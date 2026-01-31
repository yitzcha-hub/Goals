import { Activity } from '@/hooks/useCollaboration';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Target, TrendingUp, UserPlus, Edit, Trash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SharedActivityFeedProps {
  activities: Activity[];
}

export const SharedActivityFeed = ({ activities }: SharedActivityFeedProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'progress_updated': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'goal_created': return <Target className="h-4 w-4 text-purple-500" />;
      case 'collaborator_added': return <UserPlus className="h-4 w-4 text-indigo-500" />;
      case 'goal_edited': return <Edit className="h-4 w-4 text-orange-500" />;
      case 'task_deleted': return <Trash className="h-4 w-4 text-red-500" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityMessage = (activity: Activity) => {
    const details = activity.action_details || {};
    switch (activity.action_type) {
      case 'task_completed':
        return `completed task "${details.taskName}"`;
      case 'progress_updated':
        return `updated progress to ${details.progress}%`;
      case 'goal_created':
        return `created this goal`;
      case 'collaborator_added':
        return `added ${details.collaboratorEmail} as ${details.role}`;
      case 'goal_edited':
        return `edited goal details`;
      case 'task_deleted':
        return `deleted task "${details.taskName}"`;
      default:
        return activity.action_type.replace(/_/g, ' ');
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Recent Activity</h3>
      <ScrollArea className="h-64 pr-4">
        <div className="space-y-3">
          {activities.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No activity yet</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="mt-0.5">{getActivityIcon(activity.action_type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user_email || 'User'}</span>
                    {' '}{getActivityMessage(activity)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
