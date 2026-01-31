import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUp, MessageSquare, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ForumThreadCardProps {
  thread: {
    id: string;
    title: string;
    content: string;
    upvotes: number;
    reply_count: number;
    created_at: string;
    user_id: string;
  };
  hasUpvoted: boolean;
  onUpvote: () => void;
  onClick: () => void;
}

export function ForumThreadCard({ thread, hasUpvoted, onUpvote, onClick }: ForumThreadCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1">
            <Button
              variant={hasUpvoted ? 'default' : 'outline'}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onUpvote();
              }}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{thread.upvotes}</span>
          </div>
          <div className="flex-1" onClick={onClick}>
            <h3 className="font-semibold text-lg mb-2 hover:text-primary">{thread.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{thread.content}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{thread.reply_count} replies</span>
              </div>
              <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
