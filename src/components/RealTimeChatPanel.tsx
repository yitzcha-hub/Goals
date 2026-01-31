import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Send, Paperclip } from 'lucide-react';
import { toast } from 'sonner';

interface RealTimeChatPanelProps {
  goalId: string;
}

export const RealTimeChatPanel = ({ goalId }: RealTimeChatPanelProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    const subscription = supabase
      .channel(`chat:${goalId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'collaboration_messages',
        filter: `goal_id=eq.${goalId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [goalId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('collaboration_messages')
      .select('*')
      .eq('goal_id', goalId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const { error } = await supabase
      .from('collaboration_messages')
      .insert({
        goal_id: goalId,
        user_id: user?.id,
        message: newMessage,
        message_type: 'text'
      });

    if (!error) {
      setNewMessage('');
      await supabase.from('team_activity_logs').insert({
        goal_id: goalId,
        user_id: user?.id,
        activity_type: 'message_sent'
      });
    } else {
      toast.error('Failed to send message');
    }
  };

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader>
        <CardTitle>Team Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="flex-1 overflow-y-auto space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{msg.user_id?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-muted rounded-lg p-2">
                  <p className="text-sm">{msg.message}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button size="icon" onClick={sendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
