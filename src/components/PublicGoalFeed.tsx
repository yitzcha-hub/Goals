import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ShareGoalDialog } from './ShareGoalDialog';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

export function PublicGoalFeed() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareGoal, setShareGoal] = useState<any>(null);
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadPublicGoals();
  }, []);

  const loadPublicGoals = async () => {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('privacy', 'public')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const goalsWithCounts = await Promise.all(
        data.map(async (goal) => {
          const { count: likes } = await supabase
            .from('goal_likes')
            .select('*', { count: 'exact', head: true })
            .eq('goal_id', goal.id);

          const { data: comments } = await supabase
            .from('goal_comments')
            .select('*')
            .eq('goal_id', goal.id);

          const { data: userLike } = await supabase
            .from('goal_likes')
            .select('*')
            .eq('goal_id', goal.id)
            .eq('user_id', user?.id)
            .single();

          return { ...goal, likes: likes || 0, comments: comments || [], liked: !!userLike };
        })
      );
      setGoals(goalsWithCounts);
    }
    setLoading(false);
  };

  const toggleLike = async (goalId: string, liked: boolean) => {
    if (!user) {
      toast.error('Please sign in to like goals');
      return;
    }

    if (liked) {
      await supabase.from('goal_likes').delete().eq('goal_id', goalId).eq('user_id', user.id);
    } else {
      await supabase.from('goal_likes').insert({ goal_id: goalId, user_id: user.id });
    }
    loadPublicGoals();
  };

  const addComment = async (goalId: string) => {
    if (!user || !comment.trim()) return;

    await supabase.from('goal_comments').insert({
      goal_id: goalId,
      user_id: user.id,
      content: comment.trim()
    });

    setComment('');
    setCommentingOn(null);
    loadPublicGoals();
    toast.success('Comment added!');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <Card key={goal.id} className="p-6">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">{goal.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
              <div className="flex items-center gap-4 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleLike(goal.id, goal.liked)}
                  className={goal.liked ? 'text-red-500' : ''}
                >
                  <Heart className={`h-4 w-4 mr-1 ${goal.liked ? 'fill-current' : ''}`} />
                  {goal.likes}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setCommentingOn(goal.id)}>
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {goal.comments.length}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShareGoal(goal)}>
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
                <div className="ml-auto flex items-center text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {goal.progress}%
                </div>
              </div>
              {commentingOn === goal.id && (
                <div className="mt-4 space-y-2">
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => addComment(goal.id)}>Post</Button>
                    <Button size="sm" variant="outline" onClick={() => setCommentingOn(null)}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
      {shareGoal && (
        <ShareGoalDialog
          open={!!shareGoal}
          onOpenChange={() => setShareGoal(null)}
          goalId={shareGoal.id}
          goalTitle={shareGoal.title}
        />
      )}
    </div>
  );
}
