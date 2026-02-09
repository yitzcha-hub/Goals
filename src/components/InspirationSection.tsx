import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Sparkles, Briefcase, Heart, DollarSign, GraduationCap, TrendingUp, Dumbbell } from 'lucide-react';
import { goalTemplatesData, type GoalTemplateData } from '@/data/goalTemplatesData';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Dumbbell,
  Heart,
  Briefcase,
  TrendingUp,
  DollarSign,
};

interface InspirationSectionProps {
  title?: string;
  subtitle?: string;
  onSelectTemplate?: (template: GoalTemplateData) => void;
  showAddButton?: boolean;
}

export const InspirationSection: React.FC<InspirationSectionProps> = ({
  title = 'Inspired by successful people',
  subtitle = 'Goals and development plans used by entrepreneurs, professionals, athletes, and creators. Use them as a starting point.',
  onSelectTemplate,
  showAddButton = true,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(goalTemplatesData.map((t) => t.category)));
  const filtered = selectedCategory
    ? goalTemplatesData.filter((t) => t.category === selectedCategory)
    : goalTemplatesData;

  const displayed = filtered.slice(0, 6);

  return (
    <Card className="rounded-2xl overflow-hidden border-0 shadow-xl" style={{ borderColor: 'var(--landing-border)' }}>
      <CardHeader style={{ backgroundColor: 'var(--landing-accent)' }}>
        <CardTitle className="flex items-center gap-2 text-lg" style={{ color: 'var(--landing-text)' }}>
          <Sparkles className="h-5 w-5" style={{ color: 'var(--landing-primary)' }} />
          {title}
        </CardTitle>
        <p className="text-sm mt-1" style={{ color: 'var(--landing-text)', opacity: 0.85 }}>
          {subtitle}
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full text-xs font-medium ${
              selectedCategory === null ? 'bg-[var(--landing-primary)] text-white' : ''
            }`}
            style={selectedCategory === null ? {} : { color: 'var(--landing-text)' }}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant="ghost"
              size="sm"
              className={`rounded-full text-xs font-medium ${
                selectedCategory === cat ? 'bg-[var(--landing-primary)] text-white' : ''
              }`}
              style={selectedCategory === cat ? {} : { color: 'var(--landing-text)' }}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((template) => {
            const Icon = iconMap[template.icon] || Target;
            return (
              <div
                key={template.id}
                className="rounded-xl p-4 border transition-all hover:shadow-md"
                style={{
                  borderColor: 'var(--landing-border)',
                  backgroundColor: 'white',
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--landing-accent)' }}
                  >
                    <Icon className="h-5 w-5" style={{ color: 'var(--landing-primary)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: 'var(--landing-text)' }}>
                      {template.title}
                    </p>
                    <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--landing-text)', opacity: 0.8 }}>
                      {template.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-[10px] rounded-full" style={{ backgroundColor: 'var(--landing-accent)' }}>
                        {template.duration}
                      </Badge>
                      <span className="text-[10px] opacity-60" style={{ color: 'var(--landing-text)' }}>
                        {template.popularity} used
                      </span>
                    </div>
                    {showAddButton && onSelectTemplate && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3 rounded-lg text-xs"
                        style={{ borderColor: 'var(--landing-primary)', color: 'var(--landing-primary)' }}
                        onClick={() => onSelectTemplate(template)}
                      >
                        <Target className="h-3.5 w-3.5 mr-1.5" />
                        Use this plan
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
