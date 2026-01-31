import React, { useState } from 'react';
import { GoalCard } from './GoalCard';
import { TaskItem } from './TaskItem';
import { GratitudeEntry } from './GratitudeEntry';

const WellnessLayout: React.FC = () => {
  const [goals, setGoals] = useState([
    { id: '1', title: 'Daily Meditation', description: '20 minutes mindfulness practice', progress: 9, category: 'wellness', timeframe: '30 days', imageUrl: 'https://d64gsuwffb70l.cloudfront.net/68c468b90879cba7ca0dcccd_1757703337273_2dced4c4.webp' },
    { id: '2', title: 'Lose 20 Pounds', description: 'Healthy weight loss journey', progress: 5, category: 'health', timeframe: '6 months', imageUrl: 'https://d64gsuwffb70l.cloudfront.net/68c468b90879cba7ca0dcccd_1757702384626_a69fcdca.webp' },
    { id: '3', title: 'Yoga Teacher Certification', description: '200-hour YTT program', progress: 3, category: 'skill', timeframe: '1 year', imageUrl: 'https://d64gsuwffb70l.cloudfront.net/68c468b90879cba7ca0dcccd_1757703337273_2dced4c4.webp' }
  ]);

  const [tasks, setTasks] = useState([
    { id: '1', title: 'Morning yoga session', completed: true, priority: 'high' as const, points: 20 },
    { id: '2', title: 'Prepare healthy meals', completed: false, priority: 'medium' as const, points: 15 },
    { id: '3', title: 'Evening walk in nature', completed: false, priority: 'low' as const, points: 10 }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50">
      <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 px-4 text-center">
        <p className="font-semibold">🧘‍♀️ WELLNESS JOURNEY - Mind, Body & Soul</p>
      </div>

      <section className="relative h-screen flex items-center justify-center text-center px-4"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://d64gsuwffb70l.cloudfront.net/68c468b90879cba7ca0dcccd_1757703337273_2dced4c4.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
        <div className="max-w-4xl mx-auto text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Nurture Your <span className="text-green-400">Wellbeing</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Holistic approach to health, mindfulness, and personal wellness
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Wellness Goals</h2>
          
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
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Daily Wellness</h3>
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
            entries={["Peaceful morning meditation", "Nourishing healthy food", "Beautiful sunset walk", "Feeling strong and centered"]}
            photos={['https://d64gsuwffb70l.cloudfront.net/68c468b90879cba7ca0dcccd_1757703337273_2dced4c4.webp']}
            onAddEntry={(entry) => console.log('New gratitude:', entry)}
            onAddPhoto={(file) => console.log('Photo added:', file)}
          />
        </div>
      </section>
    </div>
  );
};

export default WellnessLayout;