import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageItem } from './MessageItem';
import { EmojiPicker } from './EmojiPicker';
import { Send, Image, Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  message_text: string;
  message_type: string;
  photo_url?: string;
  created_at: string;
}

export function FamilyChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedMessageForReaction, setSelectedMessageForReaction] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMessages();
    subscribeToMessages();
  }, []);

  const loadMessages = async () => {
    const demoMessages: Message[] = [
      { id: '1', sender_id: '1', sender_name: 'Mom', message_text: 'Great job on completing the morning routine! 🌟', message_type: 'text', created_at: new Date(Date.now() - 3600000).toISOString() },
      { id: '2', sender_id: '2', sender_name: 'Dad', message_text: 'Who wants to help with the garden goal today?', message_type: 'text', created_at: new Date(Date.now() - 1800000).toISOString() },
      { id: '3', sender_id: '3', sender_name: 'Sarah', message_text: 'I can help after school!', message_type: 'text', created_at: new Date(Date.now() - 900000).toISOString() }
    ];
    setMessages(demoMessages);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('family_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'family_messages' }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages(prev => [...prev, newMsg]);
        toast('New message', { description: `${newMsg.sender_name}: ${newMsg.message_text}` });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const tempMsg: Message = {
      id: Date.now().toString(),
      sender_id: 'current',
      sender_name: 'You',
      message_text: newMessage,
      message_type: 'text',
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMsg]);
    setNewMessage('');
    toast.success('Message sent!');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    toast.info('Uploading photo...');
    
    setTimeout(() => {
      const photoMsg: Message = {
        id: Date.now().toString(),
        sender_id: 'current',
        sender_name: 'You',
        message_text: 'Shared a photo',
        message_type: 'photo',
        photo_url: URL.createObjectURL(file),
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, photoMsg]);
      setUploading(false);
      toast.success('Photo shared!');
    }, 1000);
  };

  const handleReact = (messageId: string, emoji: string) => {
    toast.success(`Reacted with ${emoji}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Family Chat</span>
          <Button variant="ghost" size="sm"><Bell className="h-4 w-4" /></Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                reactions={[]}
                isCurrentUser={msg.sender_id === 'current'}
                onReact={handleReact}
                onAddReaction={(id) => setSelectedMessageForReaction(id)}
              />
            ))}
          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
          <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Image className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
