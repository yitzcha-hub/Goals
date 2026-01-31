import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Globe, Lock, Share2, MessageCircle } from 'lucide-react';
import { PublicGoalFeed } from './PublicGoalFeed';

const CommunityFeed: React.FC = () => {
  const [activeView, setActiveView] = useState<'public' | 'friends'>('public');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              Community Goals
            </h2>
            <p className="text-gray-600 mb-4">
              Share your journey and get inspired by others. Choose what you want to share!
            </p>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-white">
                <Lock className="h-3 w-3 mr-1" />
                Your goals are private by default
              </Badge>
              <Badge variant="outline" className="bg-white">
                <Share2 className="h-3 w-3 mr-1" />
                Share selectively
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-gray-900 mb-1">Your Privacy Matters</h4>
              <p className="text-sm text-gray-600">
                All your goals are private by default. You can choose to share specific goals with the community 
                or with friends when you want feedback, support, or to inspire others.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Community Feed Tabs */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'public' | 'friends')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="public">
            <Globe className="h-4 w-4 mr-2" />
            Public Goals
          </TabsTrigger>
          <TabsTrigger value="friends">
            <Users className="h-4 w-4 mr-2" />
            Friends Only
          </TabsTrigger>
        </TabsList>

        <TabsContent value="public" className="space-y-4">
          <PublicGoalFeed filter="public" />
        </TabsContent>

        <TabsContent value="friends" className="space-y-4">
          <PublicGoalFeed filter="friends" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityFeed;
