import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Sparkles, Users, TrendingUp, Zap } from 'lucide-react';
import { useTrial } from '@/hooks/useTrial';
import { useSubscription } from '@/hooks/useSubscription';

interface UpgradePromptProps {
  feature: 'ai-coach' | 'advanced-analytics' | 'family-groups' | 'collaboration';
  inline?: boolean;
}

const featureConfig = {
  'ai-coach': {
    title: 'AI Coach',
    description: 'Get personalized recommendations and insights powered by AI',
    icon: Sparkles,
    benefits: ['Smart goal suggestions', 'Progress analysis', 'Personalized tips'],
    planType: 'premium' as const,
  },
  'advanced-analytics': {
    title: 'Advanced Analytics',
    description: 'Deep insights into your progress with comprehensive charts and reports',
    icon: TrendingUp,
    benefits: ['Detailed progress tracking', 'Custom reports', 'Trend analysis'],
    planType: 'premium' as const,
  },
  'family-groups': {
    title: 'Family Groups',
    description: 'Collaborate with family members and achieve goals together',
    icon: Users,
    benefits: ['Shared goals', 'Family chat', 'Group achievements'],
    planType: 'family' as const,
  },
  'collaboration': {
    title: 'Collaboration Tools',
    description: 'Work together with others on shared goals and projects',
    icon: Zap,
    benefits: ['Real-time collaboration', 'Shared whiteboards', 'Team chat'],
    planType: 'premium' as const,
  },
};

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ feature, inline = false }) => {
  const config = featureConfig[feature];
  const Icon = config.icon;
  const { startTrial, loading } = useTrial();
  const { refresh } = useSubscription();

  const handleStartTrial = async () => {
    const success = await startTrial(config.planType);
    if (success) {
      await refresh();
      window.location.reload();
    }
  };

  if (inline) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="bg-purple-100 p-3 rounded-lg">
            <Lock className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{config.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{config.description}</p>
            <div className="flex gap-2">
              <Button 
                onClick={handleStartTrial} 
                disabled={loading}
                className="trial-cta"
              >
                {loading ? 'Starting...' : 'Start 7-Day Free Trial'}
              </Button>
              <Button 
                onClick={() => window.location.href = '/pricing'} 
                variant="outline"
              >
                View Plans
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-white to-purple-50">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge className="bg-purple-600">Premium Feature</Badge>
          <Icon className="h-8 w-8 text-purple-600" />
        </div>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          {config.title}
        </CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Unlock this feature to:</p>
          <ul className="space-y-1">
            {config.benefits.map((benefit, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <Button 
            onClick={handleStartTrial}
            disabled={loading}
            className="w-full trial-cta"
          >
            {loading ? 'Starting Trial...' : '🎉 Start 7-Day Free Trial'}
          </Button>
          <Button 
            onClick={() => window.location.href = '/pricing'} 
            variant="outline"
            className="w-full"
          >
            View All Plans
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpgradePrompt;

