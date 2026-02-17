import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Target, TrendingUp, CheckCircle2, DollarSign, Users } from 'lucide-react';
import VisualProgressTimeline, { TaggedImage } from './VisualProgressTimeline';
import { analyzeProgressImage } from '@/lib/aiImageAnalysis';
import { AIMilestoneSuggestions } from './AIMilestoneSuggestions';
import { analyzeAndSuggestMilestones } from '@/lib/aiMilestoneSuggestions';



interface Step {
  id: string;
  title: string;
  completed: boolean;
}

interface Note {
  id: string;
  content: string;
  date: string;
}

interface ProgressHistory {
  date: string;
  progress: number;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  targetDate?: string;
  steps?: Step[];
  images?: string[];
  budget?: number;
  budgetForPeople?: number;
  people?: string[];
}


interface DemoGoalDetailViewProps {
  goal: Goal;
  onBack: () => void;
  onUpdateGoal: (updatedGoal: Goal) => void;
}

export default function DemoGoalDetailView({ goal, onBack, onUpdateGoal }: DemoGoalDetailViewProps) {
  const [currentGoal, setCurrentGoal] = useState(goal);
  const [notes, setNotes] = useState<Note[]>([
    { id: '1', content: 'Started working on this goal today!', date: new Date().toISOString() }
  ]);
  const [newNote, setNewNote] = useState('');
  
  // Get category-specific images
  const getCategoryImages = (category: string): TaggedImage[] => {
    const imageMap: Record<string, { start: string; mid: string; advanced: string }> = {
      'Purpose': {
        start: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313337681_8f380009.webp',
        mid: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313338490_d34ce5f7.webp',
        advanced: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313339293_90544afc.webp'
      },
      'Health': {
        start: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313346309_a977d9c8.webp',
        mid: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313347064_15ae5b20.webp',
        advanced: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313347821_2f491fc4.webp'
      },
      'Personal': {
        start: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313355593_1366f9cc.webp',
        mid: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313356469_7d5cbb6c.webp',
        advanced: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313357732_45dc90f0.webp'
      },
      'Business': {
        start: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313364420_116e655c.webp',
        mid: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313365234_ba8c7e8e.webp',
        advanced: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313365979_65d24337.webp'
      },
      'Education': {
        start: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313372407_435111e0.webp',
        mid: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313373329_3bd1e9fc.webp',
        advanced: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313374079_754e70fb.webp'
      },
      'Creative': {
        start: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313381569_d052cb92.webp',
        mid: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313382703_29eb08a7.webp',
        advanced: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313384066_98016a1d.webp'
      },
      'Finance': {
        start: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313391802_60649dba.webp',
        mid: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313393555_473380cf.webp',
        advanced: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313394327_57e28b17.webp'
      },
      'Wellness': {
        start: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313400738_0397d33b.webp',
        mid: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313401543_1e9a42f2.webp',
        advanced: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313402336_36dc20cf.webp'
      },
      'Travel': {
        start: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760531037278_55604682.webp',
        mid: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760531038069_b2a3394d.webp',
        advanced: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760531039095_6b7be7f5.webp'
      }
    };


    const images = imageMap[category] || imageMap['Personal'];
    
    return [
      { 
        id: '1', 
        url: images.start, 
        date: '2025-09-15', 
        progress: 0, 
        label: 'Before',
        aiAnalysis: analyzeProgressImage('', 0, category, [])
      },
      { 
        id: '2', 
        url: images.mid, 
        date: '2025-09-25', 
        progress: 25, 
        label: 'Week 2',
        aiAnalysis: analyzeProgressImage('', 25, category, [{ url: '', progress: 0 }])
      },
      { 
        id: '3', 
        url: images.advanced, 
        date: '2025-10-02', 
        progress: 50, 
        label: 'Halfway!',
        aiAnalysis: analyzeProgressImage('', 50, category, [{ url: '', progress: 0 }, { url: '', progress: 25 }])
      }
    ];
  };
  
  const [taggedImages, setTaggedImages] = useState<TaggedImage[]>(getCategoryImages(goal.category));

  const [progressHistory] = useState<ProgressHistory[]>(() => {
    const p = currentGoal.progress;
    const base = Math.max(0, p - 3);
    return [
      { date: '2025-10-01', progress: base },
      { date: '2025-10-02', progress: Math.min(10, base + 1) },
      { date: '2025-10-03', progress: Math.min(10, base + 2) },
      { date: '2025-10-04', progress: p }
    ];
  });


  const handleAddImage = (image: TaggedImage) => {
    setTaggedImages([...taggedImages, image]);
  };

  const handleRemoveImage = (id: string) => {
    setTaggedImages(taggedImages.filter(img => img.id !== id));
  };

  const handleProgressUpdate = (value: number[]) => {
    const updated = { ...currentGoal, progress: value[0] };
    setCurrentGoal(updated);
    onUpdateGoal(updated);
  };

  const handleStepToggle = (stepId: string) => {
    const updatedSteps = currentGoal.steps?.map(step =>
      step.id === stepId ? { ...step, completed: !step.completed } : step
    );
    const completed = updatedSteps?.filter(s => s.completed).length || 0;
    const total = updatedSteps?.length || 1;
    const newProgress = Math.round((completed / total) * 10);
    
    const updated = { ...currentGoal, steps: updatedSteps, progress: newProgress };
    setCurrentGoal(updated);
    onUpdateGoal(updated);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, { id: Date.now().toString(), content: newNote, date: new Date().toISOString() }]);
      setNewNote('');
    }
  };

  // Generate AI milestone analysis
  const goalStartDate = currentGoal.targetDate 
    ? new Date(new Date(currentGoal.targetDate).getTime() - 90 * 24 * 60 * 60 * 1000) 
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const aiAnalysis = analyzeAndSuggestMilestones(
    currentGoal.category,
    currentGoal.progress * 10,
    100,
    goalStartDate,
    taggedImages
  );

  const handleAcceptMilestone = (milestoneId: string) => {
    console.log('Accepted milestone:', milestoneId);
    // In a real app, this would add the milestone to the goal's steps
  };



  return (
    <div className="min-h-screen landing p-6" style={{ backgroundColor: 'var(--landing-bg)', color: 'var(--landing-text)' }}>
      <div className="max-w-4xl mx-auto">
        <Button onClick={onBack} variant="ghost" className="mb-4" style={{ color: 'var(--landing-primary)' }}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Goals
        </Button>

        <Card className="p-6 mb-6" style={{ borderColor: 'var(--landing-border)', backgroundColor: 'white' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--landing-text)' }}>{currentGoal.title}</h1>
              <Badge className="mb-2" style={{ backgroundColor: 'var(--landing-accent)', color: 'var(--landing-primary)' }}>{currentGoal.category}</Badge>
              <p style={{ color: 'var(--landing-text)', opacity: 0.9 }}>{currentGoal.description}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold" style={{ color: 'var(--landing-primary)' }}>{currentGoal.progress}/10</div>
              <div className="text-sm" style={{ color: 'var(--landing-text)', opacity: 0.7 }}>Progress</div>
            </div>
          </div>
          
          {currentGoal.targetDate && (
            <div className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--landing-text)', opacity: 0.9 }}>
              <Calendar className="h-4 w-4" style={{ color: 'var(--landing-primary)' }} />
              Target: {new Date(currentGoal.targetDate).toLocaleDateString()}
            </div>
          )}

          {(currentGoal.budget != null && currentGoal.budget > 0) || (currentGoal.people?.length ?? 0) > 0 ? (
            <div className="flex flex-wrap gap-4 py-3 border-t mt-4" style={{ borderColor: 'var(--landing-border)' }}>
              {currentGoal.budget != null && currentGoal.budget > 0 && (
                <div className="flex items-center gap-2" style={{ color: 'var(--landing-text)' }}>
                  <DollarSign className="h-5 w-5" style={{ color: 'var(--landing-primary)' }} />
                  <span><strong>Budget:</strong> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(currentGoal.budget)}</span>
                  {currentGoal.budgetForPeople != null && currentGoal.budgetForPeople > 0 && (
                    <span className="opacity-80">(People: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(currentGoal.budgetForPeople)})</span>
                  )}
                </div>
              )}
              {currentGoal.people?.length ? (
                <div className="flex items-start gap-2" style={{ color: 'var(--landing-text)' }}>
                  <Users className="h-5 w-5 mt-0.5 shrink-0" style={{ color: 'var(--landing-primary)' }} />
                  <span><strong>People:</strong> {currentGoal.people.join(', ')}</span>
                </div>
              ) : null}
            </div>
          ) : null}
          
          <Progress value={currentGoal.progress * 10} className="h-3" style={{ backgroundColor: 'var(--landing-accent)' }} />
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6" style={{ borderColor: 'var(--landing-border)', backgroundColor: 'white' }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--landing-text)' }}>
              <Target className="h-5 w-5" style={{ color: 'var(--landing-primary)' }} />
              Steps to Complete
            </h2>
            <div className="space-y-3">
              {currentGoal.steps?.map(step => (
                <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg transition-colors" style={{ backgroundColor: step.completed ? 'var(--landing-accent)' : 'transparent' }}>
                  <Checkbox
                    checked={step.completed}
                    onCheckedChange={() => handleStepToggle(step.id)}
                  />
                  <span className={step.completed ? 'line-through opacity-70' : ''} style={{ color: 'var(--landing-text)' }}>
                    {step.title}
                  </span>
                  {step.completed && <CheckCircle2 className="h-4 w-4 ml-auto" style={{ color: 'var(--landing-primary)' }} />}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6" style={{ borderColor: 'var(--landing-border)', backgroundColor: 'white' }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--landing-text)' }}>
              <TrendingUp className="h-5 w-5" style={{ color: 'var(--landing-primary)' }} />
              Progress History
            </h2>
            <div className="space-y-3">
              {progressHistory.map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--landing-text)', opacity: 0.9 }}>
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <Progress value={entry.progress * 10} className="w-24 h-2" style={{ backgroundColor: 'var(--landing-accent)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--landing-primary)' }}>{entry.progress}/10</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6 mb-6" style={{ borderColor: 'var(--landing-border)', backgroundColor: 'white' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--landing-text)' }}>Update Progress (0–10 scale)</h2>
          <div className="flex items-center gap-4">
            <Slider
              value={[currentGoal.progress]}
              onValueChange={handleProgressUpdate}
              max={10}
              step={1}
              className="flex-1"
            />
            <span className="text-2xl font-bold w-16" style={{ color: 'var(--landing-primary)' }}>{currentGoal.progress}/10</span>
          </div>
        </Card>

        <div className="mb-6">
          <VisualProgressTimeline
            images={taggedImages}
            onAddImage={handleAddImage}
            onRemoveImage={handleRemoveImage}
            currentProgress={currentGoal.progress * 10}
            goalType={currentGoal.category}
          />
        </div>

        <div className="mb-6">
          <AIMilestoneSuggestions 
            analysis={aiAnalysis}
            onAcceptMilestone={handleAcceptMilestone}
          />
        </div>


        <Card className="p-6" style={{ borderColor: 'var(--landing-border)', backgroundColor: 'white' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--landing-text)' }}>Notes & Reflections</h2>
          <div className="space-y-4 mb-4">
            {notes.map(note => (
              <div key={note.id} className="p-4 rounded-lg" style={{ backgroundColor: 'var(--landing-accent)' }}>
                <div className="text-sm mb-1" style={{ color: 'var(--landing-text)', opacity: 0.7 }}>
                  {new Date(note.date).toLocaleString()}
                </div>
                <p style={{ color: 'var(--landing-text)' }}>{note.content}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Add a note about your progress..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
            <Button onClick={handleAddNote} className="w-full" style={{ backgroundColor: 'var(--landing-primary)' }}>Add Note</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
