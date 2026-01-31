import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SmilePlus } from 'lucide-react';
import { format } from 'date-fns';

interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface MessageItemProps {
  message: {
    id: string;
    sender_name: string;
    message_text: string;
    message_type: string;
    photo_url?: string;
    created_at: string;
  };
  reactions: Reaction[];
  isCurrentUser: boolean;
  onReact: (messageId: string, emoji: string) => void;
  onAddReaction: (messageId: string) => void;
}

export function MessageItem({ message, reactions, isCurrentUser, onReact, onAddReaction }: MessageItemProps) {
  const initials = message.sender_name.split(' ').map(n => n[0]).join('');
  
  return (
    <div className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium">{message.sender_name}</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(message.created_at), 'h:mm a')}
          </span>
        </div>
        <div className={`rounded-lg p-3 ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          {message.photo_url && (
            <img src={message.photo_url} alt="Shared" className="rounded mb-2 max-w-full" />
          )}
          <p className="text-sm">{message.message_text}</p>
        </div>
        {reactions.length > 0 && (
          <div className="flex gap-1 mt-1">
            {reactions.map((reaction, idx) => (
              <button
                key={idx}
                onClick={() => onReact(message.id, reaction.emoji)}
                className={`text-xs px-2 py-1 rounded-full ${
                  reaction.userReacted ? 'bg-primary/20' : 'bg-muted'
                } hover:bg-primary/30 transition-colors`}
              >
                {reaction.emoji} {reaction.count}
              </button>
            ))}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddReaction(message.id)}
          className="h-6 px-2 mt-1"
        >
          <SmilePlus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
