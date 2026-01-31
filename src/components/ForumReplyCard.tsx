import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUp, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ForumReplyCardProps {
  reply: {
    id: string;
    content: string;
    upvotes: number;
    is_helpful: boolean;
    created_at: string;
    user_id: string;
  };
  hasUpvoted: boolean;
  isThreadAuthor: boolean;
  onUpvote: () => void;
  onMarkHelpful: () => void;
}

export function ForumReplyCard({ reply, hasUpvoted, isThreadAuthor, onUpvote, onMarkHelpful }: ForumReplyCardProps) {
  return (
    <Card className={reply.is_helpful ? 'border-green-500 bg-green-50/50' : ''}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1">
            <Button
              variant={hasUpvoted ? 'default' : 'outline'}
              size="sm"
              onClick={onUpvote}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{reply.upvotes}</span>
          </div>
          <div className="flex-1">
            {reply.is_helpful && (
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Marked as helpful</span>
              </div>
            )}
            <p className="text-sm mb-3">{reply.content}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
              </span>
              {isThreadAuthor && !reply.is_helpful && (
                <Button size="sm" variant="outline" onClick={onMarkHelpful}>
                  Mark as Helpful
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
