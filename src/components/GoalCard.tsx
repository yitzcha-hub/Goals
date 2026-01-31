import React, { useState } from 'react';
import { ProgressSlider } from './ProgressSlider';
import { Users, Sparkles, Share2, Globe, Lock } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ShareGoalDialog } from './ShareGoalDialog';


interface GoalCardProps {
  id?: string;
  title: string;
  description: string;
  progress: number;
  category: string;
  imageUrl?: string;
  timeframe: string;
  privacy?: string;
  onProgressUpdate: (progress: number) => void;
  onImageUpload: (file: File) => void;
  isDemo?: boolean;
  collaborators?: Array<{ id: string; email?: string; role: string }>;
  onManageCollaborators?: () => void;
  onAICoach?: () => void;
}



export const GoalCard: React.FC<GoalCardProps> = ({
  id,
  title,
  description,
  progress,
  category,
  imageUrl,
  timeframe,
  privacy = 'private',
  onProgressUpdate,
  onImageUpload,
  isDemo = false,
  collaborators = [],
  onManageCollaborators,
  onAICoach
}) => {
  const safeCollaborators = Array.isArray(collaborators) ? collaborators : [];
  const [isExpanded, setIsExpanded] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const getCategoryColor = (cat: string) => {
    const colors: {
      [key: string]: string;
    } = {
      career: 'blue',
      health: 'green',
      relationships: 'pink',
      finance: 'yellow',
      personal: 'purple',
      purpose: 'emerald'
    };
    return colors[cat.toLowerCase()] || 'gray';
  };
  const color = getCategoryColor(category);
  return <>
    <div className={`bg-white rounded-xl shadow-lg border-l-4 border-${color}-500 p-6 hover:shadow-xl transition-all duration-300`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            {privacy === 'public' ? (
              <Globe className="h-4 w-4 text-gray-400" />
            ) : (
              <Lock className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <span className={`inline-block px-2 py-1 text-xs font-medium bg-${color}-100 text-${color}-800 rounded-full mt-1`}>
            {timeframe}
          </span>
        </div>
        <div className={`w-12 h-12 rounded-full bg-${color}-100 flex items-center justify-center`}>
          <div className={`w-8 h-8 rounded-full bg-${color}-500`} style={{
          background: `conic-gradient(rgb(59 130 246) ${progress * 36}deg, rgb(229 231 235) 0deg)`
        }} />
        </div>
      </div>


      {imageUrl && <img src={imageUrl} alt={title} className="w-full h-32 object-cover rounded-lg mb-4" />}

      <p className="text-gray-600 text-sm mb-4">{description}</p>
      
      <ProgressSlider value={progress} onChange={onProgressUpdate} label="Progress" color={color} />

      {safeCollaborators.length > 0 && (
        <div className="mt-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <div className="flex -space-x-2">
            {safeCollaborators.slice(0, 3).map((collab) => (
              <Avatar key={collab.id} className="h-6 w-6 border-2 border-white">
                <AvatarFallback className="text-xs">{collab.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          {safeCollaborators.length > 3 && (
            <span className="text-xs text-gray-500">+{safeCollaborators.length - 3} more</span>
          )}
          {onManageCollaborators && (
            <button onClick={onManageCollaborators} className="text-xs text-blue-600 hover:underline ml-2">
              Manage
            </button>
          )}
        </div>
      )}


      <div className="mt-4 flex gap-2 flex-wrap">
        <button onClick={() => setIsExpanded(!isExpanded)} className={`px-3 py-1 text-xs bg-${color}-500 text-white rounded-full hover:bg-${color}-600 transition-colors`}>
          {isExpanded ? 'Less' : 'More'}
        </button>
        <label className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors cursor-pointer">
          Add Photo
          <input type="file" className="hidden" onChange={e => e.target.files?.[0] && onImageUpload(e.target.files[0])} />
        </label>
        {id && privacy !== 'private' && (
          <Button onClick={() => setShareOpen(true)} size="sm" variant="outline" className="h-7 px-3 text-xs">
            <Share2 className="h-3 w-3 mr-1" />
            Share
          </Button>
        )}
        {onAICoach && (
          <Button onClick={onAICoach} size="sm" variant="outline" className="h-7 px-3 text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Coach
          </Button>
        )}
      </div>
    </div>
    {id && shareOpen && (
      <ShareGoalDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        goalId={id}
        goalTitle={title}
      />
    )}
  </>;
};
