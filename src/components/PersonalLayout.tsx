import React, { useState } from 'react';
import { GoalCard } from './GoalCard';
import { TaskItem } from './TaskItem';
import { GratitudeEntry } from './GratitudeEntry';
import { PricingCard } from './PricingCard';
import { OnboardingChecklist } from './OnboardingChecklist';
import { CollaborationDashboard } from './CollaborationDashboard';
import { CollaborationManager } from './CollaborationManager';
import { SharedComments } from './SharedComments';
import { TaskAssignment } from './TaskAssignment';
import { useAuth } from '@/contexts/AuthContext';
import { useCollaboration } from '@/hooks/useCollaboration';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Target } from 'lucide-react';
import Journal from './Journal';

const PersonalLayout: React.FC = () => {
  const { user } = useAuth();

  const [goals, setGoals] = useState([
    { id: '1', title: 'Write a Book', description: 'Complete first novel manuscript', progress: 3, category: 'creative', timeframe: '1 year', imageUrl: 'https://d64gsuwffb70l.cloudfront.net/68c468b90879cba7ca0dcccd_1757702374900_fddb27a2.webp' },
    { id: '2', title: 'Master Photography', description: 'Build professional portfolio', progress: 7, category: 'skill', timeframe: '6 months', imageUrl: 'https://d64gsuwffb70l.cloudfront.net/68c468b90879cba7ca0dcccd_1757702384626_a69fcdca.webp' },
    { id: '3', title: 'Travel Europe', description: 'Visit 10 countries in 3 months', progress: 2, category: 'adventure', timeframe: '2 years', imageUrl: 'https://d64gsuwffb70l.cloudfront.net/68c468b90879cba7ca0dcccd_1757702389056_af014788.webp' }
  ]);

  const [tasks, setTasks] = useState([
    { id: '1', title: 'Write 500 words daily', completed: false, priority: 'high' as const, points: 30 },
    { id: '2', title: 'Practice portrait shots', completed: true, priority: 'medium' as const, points: 20 },
    { id: '3', title: 'Research travel destinations', completed: false, priority: 'low' as const, points: 10 }
  ]);

  const [showPricing, setShowPricing] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [showCollabManager, setShowCollabManager] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Personal Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 text-center">
        <p className="font-semibold">✨ Become Your Best Self</p>
      </div>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center px-4"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://d64gsuwffb70l.cloudfront.net/68c468b90879cba7ca0dcccd_1757703304946_044ba5ce.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
        <div className="max-w-4xl mx-auto text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Your <span className="text-pink-400">Personal</span> Journey
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            A private space to grow, reflect, and become the best version of yourself
          </p>

          <button 
            onClick={() => setShowPricing(true)}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-full hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-lg"
          >
            Upgrade Experience
          </button>
        </div>
      </section>

      {/* Personal Dashboard with Tabs */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {user && <OnboardingChecklist />}
          
          <Tabs defaultValue="my-goals" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="my-goals" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                My Goals
              </TabsTrigger>
              <TabsTrigger value="collaboration" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Collaboration
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-goals" className="space-y-12">
              <h2 className="text-3xl font-bold text-center text-gray-800">My Goals</h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map(goal => (
                  <GoalCard
                    key={goal.id}
                    {...goal}
                    onProgressUpdate={(progress) => {
                      setGoals(goals.map(g => g.id === goal.id ? {...g, progress} : g));
                    }}
                    onImageUpload={(file) => console.log('Image uploaded:', file)}
                    onManageCollaborators={() => {
                      setSelectedGoalId(goal.id);
                      setShowCollabManager(true);
                    }}
                  />
                ))}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">My Tasks</h3>
                <div className="space-y-3">
                  {tasks.map(task => (
                    <TaskItem
                      key={task.id}
                      {...task}
                      onToggle={(id) => {
                        setTasks(tasks.map(t => t.id === id ? {...t, completed: !t.completed} : t));
                      }}
                      onDelete={(id) => {
                        setTasks(tasks.filter(t => t.id !== id));
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Journal />
              </div>

              <GratitudeEntry
                date="Today"
                entries={["Progress on creative projects", "Time for self-reflection"]}
                photos={['https://d64gsuwffb70l.cloudfront.net/68c468b90879cba7ca0dcccd_1757703304946_044ba5ce.webp']}
                onAddEntry={(entry) => console.log('New gratitude:', entry)}
                onAddPhoto={(file) => console.log('Photo added:', file)}
              />
            </TabsContent>

            <TabsContent value="collaboration">
              <CollaborationDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Collaboration Manager Modal */}
      {showCollabManager && selectedGoalId && (
        <CollaborationManager
          goalId={selectedGoalId}
          open={showCollabManager}
          onOpenChange={setShowCollabManager}
        />
      )}





      {/* Pricing Modal */}
      {showPricing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Upgrade Your Journey</h2>
              <button 
                onClick={() => setShowPricing(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <PricingCard
                title="Free Trial"
                price="0"
                period="7 days"
                features={["All goal tracking", "Photo uploads", "Basic insights"]}
                onSelect={() => console.log('Free trial selected')}
              />
              <PricingCard
                title="Monthly"
                price="4.99"
                period="month"
                features={["Advanced analytics", "AI recommendations", "Priority support"]}
                isPopular={true}
                onSelect={() => console.log('Monthly selected')}
              />
              <PricingCard
                title="Annual"
                price="39.99"
                period="year"
                features={["Everything included", "Premium features", "Goal coaching"]}
                onSelect={() => console.log('Annual selected')}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalLayout;