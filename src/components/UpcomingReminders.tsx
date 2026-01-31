import { useReminders } from '@/hooks/useReminders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, Clock, Users, Sparkles, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export const UpcomingReminders = () => {
  const { reminders, deleteReminder } = useReminders();

  const getIcon = (type: string) => {
    switch (type) {
      case 'goal_deadline':
        return <Calendar className="h-4 w-4" />;
      case 'habit_checkin':
        return <Clock className="h-4 w-4" />;
      case 'family_activity':
        return <Users className="h-4 w-4" />;
      case 'smart_reminder':
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'goal_deadline':
        return 'Goal Deadline';
      case 'habit_checkin':
        return 'Habit Check-in';
      case 'family_activity':
        return 'Family Activity';
      case 'smart_reminder':
        return 'Smart Reminder';
      default:
        return type;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Upcoming Reminders
        </CardTitle>
        <CardDescription>
          {reminders.length} reminder{reminders.length !== 1 ? 's' : ''} scheduled
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No upcoming reminders. Create goals and habits to get started!
          </p>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    {getIcon(reminder.type)}
                    <Badge variant="outline">{getTypeLabel(reminder.type)}</Badge>
                  </div>
                  <p className="text-sm font-medium">{reminder.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(reminder.reminder_time), 'PPp')}
                  </p>
                  <div className="flex gap-1">
                    {reminder.channels.map((channel) => (
                      <Badge key={channel} variant="secondary" className="text-xs">
                        {channel}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => reminder.id && deleteReminder(reminder.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
