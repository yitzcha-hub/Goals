import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Hammer, Home, Zap, Wrench, Palette } from 'lucide-react';

interface MilestonePhase {
  id: string;
  name: string;
  description: string;
  percentage: number;
  icon: React.ReactNode;
  completed: boolean;
}

export function ConstructionMilestones() {
  const [phases, setPhases] = useState<MilestonePhase[]>([
    {
      id: 'foundation',
      name: 'Foundation Complete',
      description: 'Excavation, concrete pouring, and foundation inspection',
      percentage: 20,
      icon: <Home className="w-5 h-5" />,
      completed: true
    },
    {
      id: 'framing',
      name: 'Framing Done',
      description: 'Structural framing, walls, and roof structure',
      percentage: 25,
      icon: <Hammer className="w-5 h-5" />,
      completed: true
    },
    {
      id: 'roofing',
      name: 'Roofing Finished',
      description: 'Roof installation, gutters, and weatherproofing',
      percentage: 15,
      icon: <Circle className="w-5 h-5" />,
      completed: false
    },
    {
      id: 'utilities',
      name: 'Electrical/Plumbing',
      description: 'Electrical wiring, plumbing, HVAC installation',
      percentage: 20,
      icon: <Zap className="w-5 h-5" />,
      completed: false
    },
    {
      id: 'finishing',
      name: 'Interior Finishing',
      description: 'Drywall, flooring, painting, fixtures, and final touches',
      percentage: 20,
      icon: <Palette className="w-5 h-5" />,
      completed: false
    }
  ]);

  const togglePhase = (phaseId: string) => {
    setPhases(prev => prev.map(phase => 
      phase.id === phaseId 
        ? { ...phase, completed: !phase.completed }
        : phase
    ));
  };

  const completedPhases = phases.filter(phase => phase.completed);
  const totalProgress = completedPhases.reduce((sum, phase) => sum + phase.percentage, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="w-6 h-6 text-orange-600" />
          Construction Milestones
        </CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span className="font-medium">{totalProgress}% Complete</span>
          </div>
          <Progress value={totalProgress} className="h-3" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {phases.map((phase) => (
            <div key={phase.id} className="border rounded-lg p-4 transition-all hover:shadow-md">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={phase.completed}
                  onCheckedChange={() => togglePhase(phase.id)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {phase.icon}
                      <h3 className={`font-medium ${phase.completed ? 'line-through text-gray-500' : ''}`}>
                        {phase.name}
                      </h3>
                      {phase.completed && <CheckCircle className="w-4 h-4 text-green-600" />}
                    </div>
                    <Badge variant={phase.completed ? 'default' : 'secondary'}>
                      {phase.percentage}%
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{phase.description}</p>
                  <Progress 
                    value={phase.completed ? 100 : 0} 
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}