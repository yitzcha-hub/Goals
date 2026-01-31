import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Calendar as CalendarIcon, List, Download, Upload, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

import { MonthlyCalendarView } from '@/components/MonthlyCalendarView';
import { DailyPlanner } from '@/components/DailyPlanner';
import { EventDialog, CalendarEvent } from '@/components/EventDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { exportToICS, parseICS, downloadICS } from '@/lib/icsUtils';
import { useToast } from '@/hooks/use-toast';


export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent>();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();


  const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    if (editingEvent) {
      setEvents(events.map(e => e.id === editingEvent.id ? { ...eventData, id: editingEvent.id } : e));
      setEditingEvent(undefined);
    } else {
      const newEvent: CalendarEvent = {
        ...eventData,
        id: Math.random().toString(36).substr(2, 9),
      };
      setEvents([...events, newEvent]);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(undefined);
    setEditingEvent(undefined);
    setDialogOpen(true);
  };

  const handleTimeSlotClick = (time: string) => {
    setSelectedTime(time);
    setEditingEvent(undefined);
    setDialogOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setSelectedDate(new Date(event.startTime));
    setDialogOpen(true);
  };

  const handleNewEvent = () => {
    setEditingEvent(undefined);
    setSelectedDate(new Date());
    setSelectedTime(undefined);
    setDialogOpen(true);
  };

  const handleExportAll = () => {
    const icsContent = exportToICS(events);
    downloadICS(icsContent, 'calendar-export.ics');
    toast({
      title: 'Export Successful',
      description: `Exported ${events.length} events to calendar-export.ics`,
    });
  };

  const handleExportRange = () => {
    if (!exportStartDate || !exportEndDate) {
      toast({
        title: 'Error',
        description: 'Please select both start and end dates',
        variant: 'destructive',
      });
      return;
    }
    const icsContent = exportToICS(events, exportStartDate, exportEndDate);
    const filteredCount = events.filter(e => {
      const d = new Date(e.date);
      return d >= new Date(exportStartDate) && d <= new Date(exportEndDate);
    }).length;
    downloadICS(icsContent, `calendar-export-${exportStartDate}-to-${exportEndDate}.ics`);
    setExportDialogOpen(false);
    toast({
      title: 'Export Successful',
      description: `Exported ${filteredCount} events from ${exportStartDate} to ${exportEndDate}`,
    });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const icsContent = event.target?.result as string;
        const importedEvents = parseICS(icsContent);
        setEvents([...events, ...importedEvents]);
        toast({
          title: 'Import Successful',
          description: `Imported ${importedEvents.length} events from ${file.name}`,
        });
      } catch (error) {
        toast({
          title: 'Import Failed',
          description: 'Could not parse the .ics file. Please check the file format.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Calendar & Planner
            </h1>
            <p className="text-gray-600 mt-2">Organize your schedule and plan your day</p>
          </div>
          <div className="flex gap-2">
            <Link to="/">
              <Button variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <input
              ref={fileInputRef}
              type="file"
              accept=".ics"
              onChange={handleImport}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export Calendar</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Button onClick={handleExportAll} className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    Export All Events
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or export date range</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={exportStartDate}
                      onChange={(e) => setExportStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={exportEndDate}
                      onChange={(e) => setExportEndDate(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleExportRange} className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    Export Date Range
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={handleNewEvent} size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              New Event
            </Button>
          </div>
        </div>


        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              Calendar View
            </TabsTrigger>
            <TabsTrigger value="planner" className="gap-2">
              <List className="h-4 w-4" />
              Daily Planner
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <MonthlyCalendarView
              events={events}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
            />
          </TabsContent>

          <TabsContent value="planner">
            <DailyPlanner
              selectedDate={selectedDate}
              events={events}
              onTimeSlotClick={handleTimeSlotClick}
              onEventClick={handleEventClick}
            />
          </TabsContent>
        </Tabs>

        <EventDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleSaveEvent}
          event={editingEvent}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
        />
      </div>
    </div>
  );
}
