import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Briefcase, TrendingUp, Sparkles, Dumbbell, GraduationCap, Heart } from 'lucide-react';
import { successfulPaths } from '@/data/successfulPathsData';

const PATH_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  TrendingUp,
  Sparkles,
  Dumbbell,
  GraduationCap,
  Heart,
};

const STORAGE_KEY_PATH = 'goals_app_chosen_path';

export function getChosenPath(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_PATH);
  } catch {
    return null;
  }
}

export function setChosenPath(pathId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_PATH, pathId);
  } catch {}
}

interface ChooseYourPathProps {
  onSelect?: (pathId: string) => void;
  compact?: boolean;
}

export const ChooseYourPath: React.FC<ChooseYourPathProps> = ({ onSelect, compact = false }) => {
  const handleSelect = (pathId: string) => {
    setChosenPath(pathId);
    onSelect?.(pathId);
  };

  return (
    <Card
      className={`rounded-2xl overflow-hidden border-2 ${compact ? '' : 'shadow-xl'}`}
      style={{ borderColor: 'var(--landing-primary)', backgroundColor: 'var(--landing-accent)' }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg" style={{ color: 'var(--landing-text)' }}>
          <Target className="h-5 w-5" style={{ color: 'var(--landing-primary)' }} />
          Choose who you want to become
        </CardTitle>
        <p className="text-sm mt-1" style={{ color: 'var(--landing-text)', opacity: 0.85 }}>
          Select your path and we&apos;ll tailor goal structures and development plans to your direction.
        </p>
      </CardHeader>
      <CardContent className="p-4">
        <div className={`grid gap-3 ${compact ? 'grid-cols-2 sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          {successfulPaths.map((path) => {
            const Icon = PATH_ICONS[path.icon] || Target;
            return (
              <button
                key={path.id}
                type="button"
                onClick={() => handleSelect(path.id)}
                className="flex items-start gap-3 p-4 rounded-xl text-left transition-all hover:shadow-md border-2"
                style={{
                  borderColor: 'var(--landing-border)',
                  backgroundColor: 'white',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--landing-accent)' }}
                >
                  <Icon className="h-5 w-5" style={{ color: 'var(--landing-primary)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: 'var(--landing-text)' }}>
                    {path.title}
                  </p>
                  {!compact && (
                    <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--landing-text)', opacity: 0.8 }}>
                      {path.description}
                    </p>
                  )}
                  <p className="text-[10px] mt-1 font-medium" style={{ color: 'var(--landing-primary)' }}>
                    {path.tagline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
