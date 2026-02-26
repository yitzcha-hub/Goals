import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedLayout } from '@/components/AuthenticatedLayout';
import { LandingContent } from '@/components/LandingContent';
import { ChooseYourPath } from '@/components/ChooseYourPath';
import { InspirationSection } from '@/components/InspirationSection';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { GoalTemplateData } from '@/data/goalTemplatesData';
import { useManifestationDatabase } from '@/hooks/useManifestationDatabase';
import { useToast } from '@/hooks/use-toast';

/**
 * Get Started page: Landing content + Personalization + Inspiration.
 * Shown when authenticated users click "Getting Started" in the help dropdown.
 */
const GetStarted: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addGoal } = useManifestationDatabase();

  const handleSelectTemplate = (template: GoalTemplateData) => {
    const timelineMap: Record<string, '30' | '60' | '90' | '1year' | '5year'> = {
      '8 weeks': '60',
      '12 weeks': '90',
      '16 weeks': '90',
      '20 weeks': '90',
      '6 months': '1year',
      '12 months': '1year',
      '18 months': '1year',
    };
    const duration = template.duration;
    const timeline = timelineMap[duration] || '90';

    addGoal({
      title: template.title,
      description: template.description,
      timeline,
      priority: template.difficulty === 'Hard' ? 'high' : 'medium',
      imageUrl: '',
      progress: 0,
      recommendations: template.bestPractices || [],
    });
    toast({ title: 'Goal added!', description: `"${template.title}" has been added to your goals.` });
    navigate('/');
  };

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen landing" style={{ backgroundColor: 'var(--landing-bg)', color: 'var(--landing-text)' }}>
        <LandingContent />

        {/* Personalization: Choose who you want to become */}
        <section className="py-16 px-4" style={{ backgroundColor: 'var(--landing-bg)', borderTop: '1px solid var(--landing-border)' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <ChooseYourPath />
          </div>
        </section>

        {/* Inspiration: Examples from successful people */}
        <section className="py-16 px-4" style={{ backgroundColor: 'var(--landing-accent)' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <InspirationSection
              title="Inspired by successful people"
              subtitle="Authenticity and purpose plans from entrepreneurs, professionals, athletes, and creators. Use them as a starting point."
              onSelectTemplate={handleSelectTemplate}
              showAddButton={true}
            />
          </div>
        </section>

        {/* CTA to Goals */}
        <section className="py-12 px-4" style={{ backgroundColor: 'var(--landing-bg)' }}>
          <div className="max-w-2xl mx-auto text-center">
            <Button
              size="lg"
              onClick={() => navigate('/')}
              className="hero-cta-primary font-semibold rounded-xl"
            >
              Go to your goals
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </section>
      </div>
    </AuthenticatedLayout>
  );
};

export default GetStarted;
