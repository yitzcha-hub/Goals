import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, MessageCircle, Share2, Star, TrendingUp, Clock, Users, Trophy } from 'lucide-react';

interface CommunityTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  likes: number;
  comments: number;
  shares: number;
  rating: number;
  successRate: number;
  timeCreated: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: string;
  milestones: string[];
  tags: string[];
}

const communityTemplates: CommunityTemplate[] = [
  {
    id: 'c1',
    title: '30-Day Minimalism Challenge',
    description: 'Transform your life by embracing minimalism one day at a time',
    category: 'Lifestyle',
    author: {
      name: 'Sarah Chen',
      avatar: 'SC',
      verified: true
    },
    likes: 3420,
    comments: 156,
    shares: 892,
    rating: 4.8,
    successRate: 78,
    timeCreated: '2 weeks ago',
    difficulty: 'Easy',
    duration: '30 days',
    milestones: ['Declutter wardrobe', 'Digital detox', 'Mindful purchases', 'Simplified routine'],
    tags: ['minimalism', 'lifestyle', 'organization']
  },
  {
    id: 'c2',
    title: 'Side Hustle to $5K/Month',
    description: 'Build a profitable side business while keeping your day job',
    category: 'Business',
    author: {
      name: 'Marcus Johnson',
      avatar: 'MJ',
      verified: true
    },
    likes: 5670,
    comments: 423,
    shares: 1205,
    rating: 4.6,
    successRate: 62,
    timeCreated: '1 month ago',
    difficulty: 'Hard',
    duration: '6 months',
    milestones: ['Find niche', 'First client', '$1K month', '$5K month'],
    tags: ['business', 'income', 'entrepreneurship']
  },
  {
    id: 'c3',
    title: 'Morning Routine Mastery',
    description: 'Create a powerful morning routine that sets you up for success',
    category: 'Productivity',
    author: {
      name: 'Alex Rivera',
      avatar: 'AR',
      verified: false
    },
    likes: 2890,
    comments: 98,
    shares: 567,
    rating: 4.9,
    successRate: 85,
    timeCreated: '3 days ago',
    difficulty: 'Medium',
    duration: '21 days',
    milestones: ['Wake early', 'Exercise habit', 'Meditation', 'Planning ritual'],
    tags: ['productivity', 'habits', 'morning']
  },
  {
    id: 'c4',
    title: 'Plant-Based Transition',
    description: 'Gradually transition to a healthy plant-based diet',
    category: 'Health',
    author: {
      name: 'Emma Green',
      avatar: 'EG',
      verified: true
    },
    likes: 1980,
    comments: 234,
    shares: 445,
    rating: 4.7,
    successRate: 71,
    timeCreated: '1 week ago',
    difficulty: 'Medium',
    duration: '8 weeks',
    milestones: ['Meatless Mondays', '50% plant-based', '75% plant-based', 'Full transition'],
    tags: ['health', 'nutrition', 'vegan']
  }
];

interface CommunityTemplatesProps {
  onSelectTemplate: (template: CommunityTemplate) => void;
}

const CommunityTemplates: React.FC<CommunityTemplatesProps> = ({ onSelectTemplate }) => {
  const [selectedTab, setSelectedTab] = useState('trending');
  const [likedTemplates, setLikedTemplates] = useState<Set<string>>(new Set());

  const toggleLike = (templateId: string) => {
    setLikedTemplates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(templateId)) {
        newSet.delete(templateId);
      } else {
        newSet.add(templateId);
      }
      return newSet;
    });
  };

  const sortedTemplates = [...communityTemplates].sort((a, b) => {
    switch (selectedTab) {
      case 'trending':
        return b.likes - a.likes;
      case 'newest':
        return 0; // Would sort by date in real app
      case 'top-rated':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Community Templates</h2>
        <Button variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Share Your Template
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="trending">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="newest">
            <Clock className="w-4 h-4 mr-2" />
            Newest
          </TabsTrigger>
          <TabsTrigger value="top-rated">
            <Star className="w-4 h-4 mr-2" />
            Top Rated
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {sortedTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{template.title}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                    <Badge variant={template.difficulty === 'Easy' ? 'secondary' : 
                                   template.difficulty === 'Medium' ? 'default' : 'destructive'}>
                      {template.difficulty}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{template.author.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{template.author.name}</span>
                      {template.author.verified && (
                        <Trophy className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <span className="text-sm text-gray-500 ml-auto">{template.timeCreated}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{template.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>{template.successRate}% success</span>
                    </div>
                    <span className="text-gray-500">{template.duration}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLike(template.id)}
                        className={likedTemplates.has(template.id) ? 'text-red-500' : ''}
                      >
                        <Heart className={`w-4 h-4 mr-1 ${likedTemplates.has(template.id) ? 'fill-current' : ''}`} />
                        {template.likes}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {template.comments}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4 mr-1" />
                        {template.shares}
                      </Button>
                    </div>
                    <Button size="sm" onClick={() => onSelectTemplate(template)}>
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityTemplates;
export type { CommunityTemplate };