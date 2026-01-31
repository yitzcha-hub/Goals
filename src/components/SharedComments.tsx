import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Send, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Comment {
  id: string;
  user_id: string;
  user_email: string;
  content: string;
  created_at: string;
}

interface SharedCommentsProps {
  goalId: string;
}

export const SharedComments = ({ goalId }: SharedCommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!goalId) return;
    fetchComments();
    subscribeToComments();
  }, [goalId]);

  const fetchComments = async () => {
    const { data } = await supabase
      .from('goal_comments')
      .select('*')
      .eq('goal_id', goalId)
      .order('created_at', { ascending: true });
    if (data) setComments(data);
    else setComments([]);
  };


  const subscribeToComments = () => {
    const channel = supabase
      .channel(`comments-${goalId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'goal_comments', filter: `goal_id=eq.${goalId}` },
        () => fetchComments()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    
    setLoading(true);
    const { error } = await supabase.from('goal_comments').insert({
      goal_id: goalId,
      user_id: user.id,
      user_email: user.email,
      content: newComment.trim()
    });

    if (!error) {
      setNewComment('');
      toast.success('Comment added');
    } else {
      toast.error('Failed to add comment');
    }
    setLoading(false);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2 font-semibold">
        <MessageCircle className="h-5 w-5" />
        Comments ({comments.length})
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{comment.user_email?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-medium">{comment.user_email}</div>
              <div className="text-sm text-muted-foreground">{comment.content}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(comment.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="min-h-[60px]"
        />
        <Button type="submit" disabled={loading || !newComment.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
};
