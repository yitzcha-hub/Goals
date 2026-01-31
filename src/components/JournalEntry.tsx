import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Heart, Smile, Meh, Frown, Save, Edit3 } from 'lucide-react';

interface JournalEntryProps {
  entry?: {
    id: string;
    date: string;
    title: string;
    content: string;
    mood: string;
    tags: string[];
  };
  onSave: (entry: any) => void;
  onCancel: () => void;
}

const moods = [
  { value: 'amazing', label: 'Amazing', icon: Heart, color: 'text-pink-500' },
  { value: 'happy', label: 'Happy', icon: Smile, color: 'text-green-500' },
  { value: 'neutral', label: 'Neutral', icon: Meh, color: 'text-gray-500' },
  { value: 'sad', label: 'Sad', icon: Frown, color: 'text-blue-500' },
];

const JournalEntry: React.FC<JournalEntryProps> = ({ entry, onSave, onCancel }) => {
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [mood, setMood] = useState(entry?.mood || 'neutral');
  const [tags, setTags] = useState(entry?.tags?.join(', ') || '');
  const [date, setDate] = useState(entry?.date || new Date().toISOString().split('T')[0]);

  const handleSave = () => {
    const newEntry = {
      id: entry?.id || Date.now().toString(),
      date,
      title: title || `Journal Entry - ${new Date(date).toLocaleDateString()}`,
      content,
      mood,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      createdAt: entry?.id ? entry.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onSave(newEntry);
  };

  const isValid = content.trim().length > 0;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit3 className="h-5 w-5" />
          {entry ? 'Edit Entry' : 'New Journal Entry'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Title (Optional)</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your entry a title..."
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">How are you feeling?</label>
          <div className="flex gap-2 flex-wrap">
            {moods.map((moodOption) => {
              const IconComponent = moodOption.icon;
              return (
                <Button
                  key={moodOption.value}
                  variant={mood === moodOption.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMood(moodOption.value)}
                  className="flex items-center gap-2"
                >
                  <IconComponent className={`h-4 w-4 ${moodOption.color}`} />
                  {moodOption.label}
                </Button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Your Thoughts</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind today? Write about your experiences, thoughts, feelings, or anything that matters to you..."
            className="min-h-[200px] resize-none"
          />
          <p className="text-sm text-gray-500 mt-1">
            {content.length} characters
          </p>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Tags (Optional)</label>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="work, family, travel, gratitude (comma separated)"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            <Save className="h-4 w-4 mr-2" />
            {entry ? 'Update Entry' : 'Save Entry'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JournalEntry;