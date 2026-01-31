import { useState, useRef } from 'react';
import { Mic, Square, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface VoiceNote {
  id: string;
  url: string;
  date: string;
  duration: number;
}

export function VoiceNotes() {
  const [recording, setRecording] = useState(false);
  const [notes, setNotes] = useState<VoiceNote[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const newNote: VoiceNote = {
          id: Date.now().toString(),
          url,
          date: new Date().toISOString(),
          duration: 0,
        };
        setNotes([...notes, newNote]);
        toast({ title: 'Voice note saved!' });
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      toast({ title: 'Microphone access denied', variant: 'destructive' });
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold">Voice Notes</h4>
        {!recording ? (
          <Button size="sm" onClick={startRecording}>
            <Mic className="h-4 w-4 mr-1" />
            Record
          </Button>
        ) : (
          <Button size="sm" variant="destructive" onClick={stopRecording}>
            <Square className="h-4 w-4 mr-1" />
            Stop
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {notes.map(note => (
          <div key={note.id} className="flex items-center justify-between p-2 bg-muted rounded">
            <audio src={note.url} controls className="flex-1" />
            <Button size="sm" variant="ghost" onClick={() => deleteNote(note.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
