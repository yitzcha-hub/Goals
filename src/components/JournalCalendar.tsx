import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface JournalEntry {
  id: string;
  date: string;
  mood: string;
}

interface JournalCalendarProps {
  entries: JournalEntry[];
}

const JournalCalendar: React.FC<JournalCalendarProps> = ({ entries }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const hasEntryForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return entries.some(e => e.date === dateStr);
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startingDayOfWeek }, (_, i) => i);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Journal Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[140px] text-center">
              {currentDate.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
            </span>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          {blanks.map(i => (
            <div key={`blank-${i}`} className="aspect-square" />
          ))}
          {days.map(day => {
            const date = new Date(year, month, day);
            const hasEntry = hasEntryForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={day}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  hasEntry
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                } ${isToday ? 'ring-2 ring-purple-400' : ''}`}
              >
                {day}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-500"></div>
            <span className="text-gray-600">Has Entry</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-50 border border-gray-200"></div>
            <span className="text-gray-600">No Entry</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JournalCalendar;
