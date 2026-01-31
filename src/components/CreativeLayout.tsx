import React, { useState } from 'react';
import { GoalCard } from './GoalCard';
import { TaskItem } from './TaskItem';
import { GratitudeEntry } from './GratitudeEntry';

const CreativeLayout: React.FC = () => {
  const [goals, setGoals] = useState([
    { id: '1', title: 'Release Music Album', description: '12 original songs', progress: 6, category: 'creative', timeframe: '1 year', imageUrl: 'https://d64gsuwffb70l.cloudfront.net/68c468b90879cba7ca0dcccd_1757703338555_17e75cdc.webp' },
    { id: '2', title: 'Art Exhibition', description: 'Solo gallery show', progress: 4, category: 'creative', timeframe: '8 months', imageUrl: 'https://d64gsuwffb70l.cloudfront.net/68c468b90879cba7ca0dcccd_1757703338555_17e75cdc.webp' },
    { id: '3', title: 'Learn Pottery', description: 'Master wheel throwing', progress: 2, category: 'skill', timeframe: '6 months', imageUrl: 'https://d64gsuwffb70l.cloudfront.net/68c468b90879cba7ca0dcccd_1757703338555_17e75cdc.webp' }
  ]);

  const [tasks, setTasks] = useState([
    { id: '1', title: 'Practice guitar 1 hour', completed: true, priority: 'high' as const, points: 25 },
    { id: '2', title: 'Sketch daily ideas', completed: false, priority: 'medium' as const, points: 15 },
    { id: '3', title: 'Visit art supply store', completed: false, priority: 'low' as const, points: 10 }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 text-center">
        <p className="font-semibold">🎨 CREATIVE SPACE - Express Your Artistic Vision</p>
      </div>

      <section className="relative h-screen flex items-center justify-center text-center px-4"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://d64gsuwffb70l.cloudfront.net/68c468b90879cba7ca0dcccd_1757703338555_17e75cdc.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
        <div className="max-w-4xl mx-auto text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Unleash Your <span className="text-orange-400">Creativity</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Transform inspiration into artistic achievements and creative mastery
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Creative Goals</h2>
          
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
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Creative Practice</h3>
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
            entries={["Breakthrough in songwriting", "Beautiful color combinations", "Inspiring art museum visit"]}
            photos={['https://d64gsuwffb70l.cloudfront.net/68c468b90879cba7ca0dcccd_1757703338555_17e75cdc.webp']}
            onAddEntry={(entry) => console.log('New gratitude:', entry)}
            onAddPhoto={(file) => console.log('Photo added:', file)}
          />
        </div>
      </section>
    </div>
  );
};

export default CreativeLayout;