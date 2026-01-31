import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock } from 'lucide-react';
import { CalendarEvent } from './EventDialog';

interface DailyPlannerProps {
  selectedDate: Date;
  events: CalendarEvent[];
  onTimeSlotClick: (time: string) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function DailyPlanner({ selectedDate, events, onTimeSlotClick, onEventClick }: DailyPlannerProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const getEventsForHour = (hour: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      const isSameDay = eventDate.toDateString() === selectedDate.toDateString();
      const eventHour = eventDate.getHours();
      return isSameDay && eventHour === hour;
    });
  };

  const formatEventTime = (event: CalendarEvent) => {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    return `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Daily Schedule</h2>
          <p className="text-gray-600">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {hours.map(hour => {
          const hourEvents = getEventsForHour(hour);
          const timeString = `${hour.toString().padStart(2, '0')}:00`;
          
          return (
            <div key={hour} className="flex gap-4 border-b pb-2">
              <div className="w-24 flex-shrink-0 pt-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Clock className="h-3 w-3" />
                  {formatHour(hour)}
                </div>
              </div>
              
              <div className="flex-1 min-h-[60px]">
                {hourEvents.length > 0 ? (
                  <div className="space-y-2">
                    {hourEvents.map(event => (
                      <div
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className="p-3 rounded-lg cursor-pointer hover:opacity-90 transition-opacity text-white"
                        style={{ backgroundColor: event.color }}
                      >
                        <div className="font-semibold">{event.title}</div>
                        <div className="text-sm opacity-90">{formatEventTime(event)}</div>
                        {event.location && (
                          <div className="text-sm opacity-90 mt-1">📍 {event.location}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={() => onTimeSlotClick(timeString)}
                    className="w-full h-full flex items-center justify-center text-gray-400 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
