import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReminders, ReminderPreferences as ReminderPrefs } from '@/hooks/useReminders';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Mail, Smartphone, Clock, Calendar, Users, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const ReminderPreferences = () => {
  const { preferences, loading, savePreferences } = useReminders();
  const { permission, requestPermission } = useNotifications();
  const [localPrefs, setLocalPrefs] = useState<ReminderPrefs | null>(null);

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    }
  }, [preferences]);

  const handleSave = async () => {
    if (!localPrefs) return;
    if (localPrefs.push_enabled && permission === 'default') {
      const token = await requestPermission();
      if (!token) return; // requestPermission already shows "Permission denied" toast
    }
    await savePreferences(localPrefs);
    toast.success('Reminder preferences saved!');
  };

  if (loading || !localPrefs) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </CardTitle>
          <CardDescription>Choose how you want to receive reminders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="push">Push Notifications</Label>
            </div>
            <Switch
              id="push"
              checked={localPrefs.push_enabled}
              onCheckedChange={(checked) => {
                setLocalPrefs({ ...localPrefs, push_enabled: checked });
                if (checked && permission === 'default') {
                  toast.info('Click "Save Preferences" to enable push notifications and grant permission.');
                }
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="email">Email Notifications</Label>
            </div>
            <Switch
              id="email"
              checked={localPrefs.email_enabled}
              onCheckedChange={(checked) => setLocalPrefs({ ...localPrefs, email_enabled: checked })}
            />
          </div>
          {localPrefs.email_enabled && (
            <Input
              type="email"
              placeholder="Email address"
              value={localPrefs.email_address}
              onChange={(e) => setLocalPrefs({ ...localPrefs, email_address: e.target.value })}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Goal Deadline Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="goal-deadline">Enable Reminders</Label>
            <Switch
              id="goal-deadline"
              checked={localPrefs.goal_deadline_enabled}
              onCheckedChange={(checked) => setLocalPrefs({ ...localPrefs, goal_deadline_enabled: checked })}
            />
          </div>
          {localPrefs.goal_deadline_enabled && (
            <div className="space-y-2">
              <Label>Remind me before deadline</Label>
              <Select
                value={localPrefs.goal_deadline_timing.toString()}
                onValueChange={(value) => setLocalPrefs({ ...localPrefs, goal_deadline_timing: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="6">6 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="48">2 days</SelectItem>
                  <SelectItem value="168">1 week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Habit Check-in Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="habit-checkin">Enable Reminders</Label>
            <Switch
              id="habit-checkin"
              checked={localPrefs.habit_checkin_enabled}
              onCheckedChange={(checked) => setLocalPrefs({ ...localPrefs, habit_checkin_enabled: checked })}
            />
          </div>
          {localPrefs.habit_checkin_enabled && (
            <div className="space-y-2">
              <Label>Daily reminder time</Label>
              <Input
                type="time"
                value={localPrefs.habit_checkin_time}
                onChange={(e) => setLocalPrefs({ ...localPrefs, habit_checkin_time: e.target.value })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Family Activity Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="family-activity">Enable Reminders</Label>
            <Switch
              id="family-activity"
              checked={localPrefs.family_activity_enabled}
              onCheckedChange={(checked) => setLocalPrefs({ ...localPrefs, family_activity_enabled: checked })}
            />
          </div>
          {localPrefs.family_activity_enabled && (
            <div className="space-y-2">
              <Label>Remind me before activity</Label>
              <Select
                value={localPrefs.family_activity_timing.toString()}
                onValueChange={(value) => setLocalPrefs({ ...localPrefs, family_activity_timing: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="2">2 hours</SelectItem>
                  <SelectItem value="6">6 hours</SelectItem>
                  <SelectItem value="24">1 day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Smart Reminders
          </CardTitle>
          <CardDescription>
            Get intelligent reminders based on your progress patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="smart-reminders">Enable Smart Reminders</Label>
            <Switch
              id="smart-reminders"
              checked={localPrefs.smart_reminders_enabled}
              onCheckedChange={(checked) => setLocalPrefs({ ...localPrefs, smart_reminders_enabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full">
        Save Preferences
      </Button>
    </div>
  );
};
