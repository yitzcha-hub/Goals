import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ForumCategoryCard } from '@/components/ForumCategoryCard';
import { ForumThreadCard } from '@/components/ForumThreadCard';
import { ForumReplyCard } from '@/components/ForumReplyCard';
import { CreateThreadDialog } from '@/components/CreateThreadDialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Search, Home } from 'lucide-react';


type View = 'categories' | 'threads' | 'thread';

export default function Forums() {
  const [view, setView] = useState<View>('categories');
  const [categories, setCategories] = useState<any[]>([]);
  const [threads, setThreads] = useState<any[]>([]);
  const [replies, setReplies] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userUpvotes, setUserUpvotes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase.from('forum_categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const loadThreads = async (categoryId: string) => {
    const { data } = await supabase
      .from('forum_threads')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });
    if (data) setThreads(data);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: upvotes } = await supabase
        .from('thread_upvotes')
        .select('thread_id')
        .eq('user_id', user.id);
      if (upvotes) setUserUpvotes(new Set(upvotes.map(u => u.thread_id)));
    }
  };

  const loadReplies = async (threadId: string) => {
    const { data } = await supabase
      .from('forum_replies')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });
    if (data) setReplies(data);
  };

  const handleCategoryClick = (category: any) => {
    setSelectedCategory(category);
    setView('threads');
    loadThreads(category.id);
  };

  const handleThreadClick = (thread: any) => {
    setSelectedThread(thread);
    setView('thread');
    loadReplies(thread.id);
  };

  const handleUpvoteThread = async (threadId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to upvote');
      return;
    }

    if (userUpvotes.has(threadId)) {
      await supabase.from('thread_upvotes').delete().match({ thread_id: threadId, user_id: user.id });
      await supabase.rpc('decrement', { row_id: threadId, table_name: 'forum_threads', column_name: 'upvotes' });
      setUserUpvotes(prev => { const next = new Set(prev); next.delete(threadId); return next; });
    } else {
      await supabase.from('thread_upvotes').insert({ thread_id: threadId, user_id: user.id });
      await supabase.from('forum_threads').update({ upvotes: threads.find(t => t.id === threadId).upvotes + 1 }).eq('id', threadId);
      setUserUpvotes(prev => new Set(prev).add(threadId));
    }
    loadThreads(selectedCategory.id);
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await supabase.from('forum_replies').insert({
        thread_id: selectedThread.id,
        user_id: user.id,
        content: replyContent,
      });

      await supabase.from('forum_threads').update({ 
        reply_count: selectedThread.reply_count + 1 
      }).eq('id', selectedThread.id);

      setReplyContent('');
      loadReplies(selectedThread.id);
      toast.success('Reply posted!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (view === 'categories') {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Community Forums</h1>
            <p className="text-muted-foreground">Ask questions, share tips, and discuss strategies with the community</p>
          </div>
          <Link to="/">
            <Button variant="outline">
              <Home className="h-4 w-4 mr-2" /> Home
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {categories.map(category => (
            <ForumCategoryCard key={category.id} category={category} onClick={() => handleCategoryClick(category)} />
          ))}
        </div>
      </div>
    );
  }

  if (view === 'threads') {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Button variant="ghost" onClick={() => setView('categories')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Categories
        </Button>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{selectedCategory?.name}</h1>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Thread
          </Button>
        </div>
        <div className="space-y-3">
          {threads.map(thread => (
            <ForumThreadCard
              key={thread.id}
              thread={thread}
              hasUpvoted={userUpvotes.has(thread.id)}
              onUpvote={() => handleUpvoteThread(thread.id)}
              onClick={() => handleThreadClick(thread)}
            />
          ))}
        </div>
        <CreateThreadDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          categoryId={selectedCategory?.id}
          onThreadCreated={() => loadThreads(selectedCategory.id)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button variant="ghost" onClick={() => setView('threads')} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Threads
      </Button>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{selectedThread?.title}</h1>
        <p className="text-muted-foreground">{selectedThread?.content}</p>
      </div>
      <div className="space-y-4 mb-6">
        {replies.map(reply => (
          <ForumReplyCard
            key={reply.id}
            reply={reply}
            hasUpvoted={false}
            isThreadAuthor={false}
            onUpvote={() => {}}
            onMarkHelpful={() => {}}
          />
        ))}
      </div>
      <form onSubmit={handleSubmitReply} className="space-y-3">
        <Textarea
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder="Share your thoughts..."
          rows={4}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Posting...' : 'Post Reply'}
        </Button>
      </form>
    </div>
  );
}
