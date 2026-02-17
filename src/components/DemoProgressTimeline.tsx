import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, TrendingUp, Target, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface HistoryEvent {
  id: string;
  goalTitle: string;
  type: 'created' | 'progress' | 'milestone';
  timestamp: Date;
  description: string;
  oldValue?: number;
  newValue?: number;
}

const DEMO_EVENTS: HistoryEvent[] = [
  { id: '1', goalTitle: 'Launch My Dream Business', type: 'created', timestamp: new Date('2025-09-01'), description: 'Started goal' },
  { id: '2', goalTitle: 'Launch My Dream Business', type: 'progress', timestamp: new Date('2025-09-15'), description: 'Progress update', oldValue: 2, newValue: 5 },
  { id: '3', goalTitle: 'Run a Marathon', type: 'created', timestamp: new Date('2025-09-10'), description: 'Started goal' },
  { id: '4', goalTitle: 'Launch My Dream Business', type: 'milestone', timestamp: new Date('2025-10-01'), description: 'Website launched', oldValue: 5, newValue: 7 },
  { id: '5', goalTitle: 'Save $50,000 Emergency Fund', type: 'progress', timestamp: new Date('2025-10-10'), description: 'Reached $25k', oldValue: 5, newValue: 8 },
];

const DemoProgressTimeline: React.FC = () => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'created': return <Target className="h-4 w-4" />;
      case 'progress': return <TrendingUp className="h-4 w-4" />;
      case 'milestone': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'created': return 'var(--landing-primary)';
      case 'progress': return '#3b82f6';
      case 'milestone': return '#8b5cf6';
      default: return 'var(--landing-primary)';
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--landing-text)' }}>
        <Clock className="h-7 w-7" style={{ color: 'var(--landing-primary)' }} />
        Progress Timeline
      </h3>
      <Card style={{ borderColor: 'var(--landing-border)', backgroundColor: 'white' }}>
        <CardContent className="p-6">
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5" style={{ backgroundColor: 'var(--landing-border)' }} />
            <div className="space-y-6">
              {DEMO_EVENTS.map((event, i) => (
                <div key={event.id} className="relative flex items-start gap-4">
                  <div
                    className="absolute left-2 w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0 z-10"
                    style={{ backgroundColor: getEventColor(event.type) }}
                  >
                    {getEventIcon(event.type)}
                  </div>
                  <div className="ml-10 flex-1 p-4 rounded-xl border" style={{ backgroundColor: 'var(--landing-accent)', borderColor: 'var(--landing-border)' }}>
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h4 className="font-semibold" style={{ color: 'var(--landing-text)' }}>{event.goalTitle}</h4>
                        <p className="text-sm mt-1 opacity-90" style={{ color: 'var(--landing-text)' }}>{event.description}</p>
                        {event.oldValue != null && event.newValue != null && (
                          <p className="text-sm mt-2 font-medium" style={{ color: 'var(--landing-primary)' }}>
                            {event.oldValue}/10 → {event.newValue}/10
                          </p>
                        )}
                      </div>
                      <span className="text-xs opacity-70 whitespace-nowrap" style={{ color: 'var(--landing-text)' }}>
                        {format(event.timestamp, 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoProgressTimeline;
