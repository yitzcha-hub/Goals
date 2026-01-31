// Utility functions for calendar integration and .ics file generation

export interface CalendarEvent {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  reminders?: number[]; // minutes before event
}

// Generate .ics file content for a single event
export function generateICS(event: CalendarEvent): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DEPO Goal Tracker//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(event.startDate)}`,
    `DTEND:${formatDate(event.endDate)}`,
    `SUMMARY:${event.title}`,
    event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
    event.location ? `LOCATION:${event.location}` : '',
    `DTSTAMP:${formatDate(new Date())}`,
    `UID:${Date.now()}@depgoaltracker.com`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n');

  return icsContent;
}

// Download .ics file
export function downloadICS(event: CalendarEvent, filename: string = 'event.ics'): void {
  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// Generate .ics for multiple events
export function generateMultipleICS(events: CalendarEvent[]): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const eventBlocks = events.map((event, index) => [
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(event.startDate)}`,
    `DTEND:${formatDate(event.endDate)}`,
    `SUMMARY:${event.title}`,
    event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
    event.location ? `LOCATION:${event.location}` : '',
    `DTSTAMP:${formatDate(new Date())}`,
    `UID:${Date.now()}-${index}@depogoaltracker.com`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT'
  ].filter(Boolean).join('\r\n'));

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DEPO Goal Tracker//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...eventBlocks,
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
}
