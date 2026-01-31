import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Pencil, Square, Circle, Type, Eraser, Download } from 'lucide-react';
import { toast } from 'sonner';

interface SharedWhiteboardProps {
  goalId: string;
}

export const SharedWhiteboard = ({ goalId }: SharedWhiteboardProps) => {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'square' | 'circle' | 'text' | 'eraser'>('pen');
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    createSession();
  }, []);

  const createSession = async () => {
    const { data } = await supabase
      .from('whiteboard_sessions')
      .insert({ goal_id: goalId, name: 'Whiteboard Session', created_by: user?.id })
      .select()
      .single();
    if (data) setSessionId(data.id);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      ctx.stroke();
    }
  };

  const stopDrawing = async () => {
    setIsDrawing(false);
    if (sessionId) {
      await supabase.from('whiteboard_elements').insert({
        session_id: sessionId,
        element_type: tool,
        element_data: { tool },
        created_by: user?.id
      });
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shared Whiteboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button size="sm" variant={tool === 'pen' ? 'default' : 'outline'} onClick={() => setTool('pen')}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant={tool === 'square' ? 'default' : 'outline'} onClick={() => setTool('square')}>
            <Square className="h-4 w-4" />
          </Button>
          <Button size="sm" variant={tool === 'circle' ? 'default' : 'outline'} onClick={() => setTool('circle')}>
            <Circle className="h-4 w-4" />
          </Button>
          <Button size="sm" variant={tool === 'eraser' ? 'default' : 'outline'} onClick={() => setTool('eraser')}>
            <Eraser className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={clearCanvas}>Clear</Button>
        </div>
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="border rounded-lg w-full cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </CardContent>
    </Card>
  );
};
