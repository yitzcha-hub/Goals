import React, { useState } from 'react';
import { GoalCard } from './GoalCard';
import { TaskItem } from './TaskItem';
import { GratitudeEntry } from './GratitudeEntry';

const BusinessLayout: React.FC = () => {
  const [goals, setGoals] = useState([
    { id: '1', title: 'Increase Revenue 50%', description: 'Scale business operations', progress: 7, category: 'business', timeframe: '1 year', imageUrl: 'https://d64gsuwffb70l.cloudfront.net/68c468b90879cba7ca0dcccd_1757703335687_2cec7799.webp' },
    { id: '2', title: 'Build Team of 10', description: 'Hire key personnel', progress: 4, category: 'career', timeframe: '6 months', imageUrl: 'https://d64gsuwffb70l.cloudfront.net/68c468b90879cba7ca0dcccd_1757702374900_fddb27a2.webp' },
    { id: '3', title: 'Launch New Product', description: 'MVP to market', progress: 8, category: 'business', timeframe: '90 days', imageUrl: 'https://d64gsuwffb70l.cloudfront.net/68c468b90879cba7ca0dcccd_1757702384626_a69fcdca.webp' }
  ]);

  const [tasks, setTasks] = useState([
    { id: '1', title: 'Finalize Q4 budget', completed: false, priority: 'high' as const, points: 40 },
    { id: '2', title: 'Schedule investor meeting', completed: true, priority: 'high' as const, points: 35 },
    { id: '3', title: 'Review team performance', completed: false, priority: 'medium' as const, points: 25 }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gold-50">
      <div className="bg-gradient-to-r from-blue-600 to-gold-600 text-white py-3 px-4 text-center">
        <p className="font-semibold">🚀 BUSINESS FOCUS - Achieve Professional Excellence</p>
      </div>

      <section className="relative h-screen flex items-center justify-center text-center px-4"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://d64gsuwffb70l.cloudfront.net/68c468b90879cba7ca0dcccd_1757703335687_2cec7799.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
        <div className="max-w-4xl mx-auto text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Scale Your <span className="text-gold-400">Business</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Strategic goal setting for professional growth and business success
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Business Goals</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {goals.map(goal => (
              <GoalCard
                key={goal.id}
                {...goal}
                onProgressUpdate={(progress) => {
                  setGoals(goals.map(g => g.id === goal.id ? {...g, progress} : g));
                }}
                onImageUpload={(file) => console.log('Image uploaded:', file)}
              />
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-12">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Strategic Tasks</h3>
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

          <GratitudeEntry
            date="Today"
            entries={["Strong team collaboration", "New partnership opportunity", "Positive client feedback"]}
            photos={['https://d64gsuwffb70l.cloudfront.net/68c468b90879cba7ca0dcccd_1757703335687_2cec7799.webp']}
            onAddEntry={(entry) => console.log('New gratitude:', entry)}
            onAddPhoto={(file) => console.log('Photo added:', file)}
          />
        </div>
      </section>
    </div>
  );
};

export default BusinessLayout;