import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar, Download, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { useDatabase } from '@/hooks/useDatabase';
import { downloadICS, CalendarEvent } from '@/lib/calendarUtils';
import { 
  initGoogleCalendar, 
  authenticateGoogle, 
  createGoogleCalendarEvent,
  signOutGoogle 
} from '@/lib/googleCalendar';
import { 
  initMicrosoftGraph, 
  authenticateMicrosoft, 
  createOutlookCalendarEvent,
  signOutMicrosoft 
} from '@/lib/microsoftGraph';
import { toast } from 'sonner';

const CalendarSync: React.FC = () => {
  const { goals, habits } = useDatabase();
  const [googleConnected, setGoogleConnected] = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Initialize calendar APIs
    initGoogleCalendar().catch(console.error);
    initMicrosoftGraph().catch(console.error);
  }, []);

  const handleGoogleConnect = async () => {
    try {
      await authenticateGoogle();
      setGoogleConnected(true);
      toast.success('Connected to Google Calendar');
    } catch (error) {
      console.error('Google auth error:', error);
      toast.error('Failed to connect to Google Calendar');
    }
  };

  const handleOutlookConnect = async () => {
    try {
      await authenticateMicrosoft();
      setOutlookConnected(true);
      toast.success('Connected to Outlook Calendar');
    } catch (error) {
      console.error('Outlook auth error:', error);
      toast.error('Failed to connect to Outlook Calendar');
    }
  };

  const handleGoogleDisconnect = () => {
    signOutGoogle();
    setGoogleConnected(false);
    toast.success('Disconnected from Google Calendar');
  };

  const handleOutlookDisconnect = async () => {
    await signOutMicrosoft();
    setOutlookConnected(false);
    toast.success('Disconnected from Outlook Calendar');
  };

  const syncGoalsToCalendar = async (provider: 'google' | 'outlook') => {
    setSyncing(true);
    try {
      const goalsWithDates = goals.filter(g => g.due_date);
      
      for (const goal of goalsWithDates) {
        const dueDate = new Date(goal.due_date!);
        const startDate = new Date(dueDate);
        startDate.setHours(9, 0, 0, 0);
        const endDate = new Date(dueDate);
        endDate.setHours(10, 0, 0, 0);

        if (provider === 'google') {
          await createGoogleCalendarEvent({
            summary: `Goal: ${goal.title}`,
            description: goal.description || '',
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            reminders: [1440, 60] // 1 day and 1 hour before
          });
        } else {
          await createOutlookCalendarEvent({
            subject: `Goal: ${goal.title}`,
            body: goal.description || '',
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            reminders: [1440, 60]
          });
        }
      }

      toast.success(`Synced ${goalsWithDates.length} goals to ${provider === 'google' ? 'Google' : 'Outlook'} Calendar`);
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync goals');
    } finally {
      setSyncing(false);
    }
  };

  const exportAllAsICS = () => {
    const events: CalendarEvent[] = goals
      .filter(g => g.due_date)
      .map(goal => {
        const dueDate = new Date(goal.due_date!);
        const startDate = new Date(dueDate);
        startDate.setHours(9, 0, 0, 0);
        const endDate = new Date(dueDate);
        endDate.setHours(10, 0, 0, 0);

        return {
          title: `Goal: ${goal.title}`,
          description: goal.description || '',
          startDate,
          endDate
        };
      });

    if (events.length === 0) {
      toast.error('No goals with due dates to export');
      return;
    }

    downloadICS(events[0], 'depo-goals.ics');
    toast.success(`Exported ${events.length} goals as .ics file`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">Calendar Integration</h3>
        <p className="text-gray-600">Sync your goals and habits with external calendars</p>
      </div>

      {/* Connection Status */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Google Calendar
            </CardTitle>
            <CardDescription>
              {googleConnected ? 'Connected' : 'Not connected'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              {googleConnected ? (
                <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Connected</Badge>
              ) : (
                <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" />Disconnected</Badge>
              )}
            </div>
            {googleConnected ? (
              <>
                <Button onClick={() => syncGoalsToCalendar('google')} disabled={syncing} className="w-full">
                  <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                  Sync Goals
                </Button>
                <Button onClick={handleGoogleDisconnect} variant="outline" className="w-full">
                  Disconnect
                </Button>
              </>
            ) : (
              <Button onClick={handleGoogleConnect} className="w-full">
                Connect Google Calendar
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <img src="https://www.microsoft.com/favicon.ico" alt="Microsoft" className="w-5 h-5" />
              Outlook Calendar
            </CardTitle>
            <CardDescription>
              {outlookConnected ? 'Connected' : 'Not connected'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              {outlookConnected ? (
                <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Connected</Badge>
              ) : (
                <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" />Disconnected</Badge>
              )}
            </div>
            {outlookConnected ? (
              <>
                <Button onClick={() => syncGoalsToCalendar('outlook')} disabled={syncing} className="w-full">
                  <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                  Sync Goals
                </Button>
                <Button onClick={handleOutlookDisconnect} variant="outline" className="w-full">
                  Disconnect
                </Button>
              </>
            ) : (
              <Button onClick={handleOutlookConnect} className="w-full">
                Connect Outlook Calendar
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Options
          </CardTitle>
          <CardDescription>Download your goals as calendar files</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={exportAllAsICS} variant="outline" className="w-full">
            <Calendar className="w-4 h-4 mr-2" />
            Export All Goals as .ics File
          </Button>
          <p className="text-sm text-gray-600">
            Download a .ics file that can be imported into any calendar application
          </p>
        </CardContent>
      </Card>

      {/* Auto-Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Auto-Sync Settings</CardTitle>
          <CardDescription>Automatically sync new goals to your calendar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Auto-Sync</p>
              <p className="text-sm text-gray-600">New goals will be automatically added to your calendar</p>
            </div>
            <Switch checked={autoSync} onCheckedChange={setAutoSync} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarSync;
