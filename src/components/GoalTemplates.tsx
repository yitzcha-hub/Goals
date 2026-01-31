import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Heart, DollarSign, BookOpen, Brain, Briefcase, Dumbbell, GraduationCap, TrendingUp, Users, Clock, Target, CheckCircle2, Lightbulb } from 'lucide-react';
import { goalTemplatesData, GoalTemplateData } from '@/data/goalTemplatesData';
import { moreGoalTemplates } from '@/data/goalTemplatesData2';
import { additionalGoalTemplates } from '@/data/goalTemplatesData3';
import GoalTemplateCustomizer from './GoalTemplateCustomizer';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const allTemplates = [...goalTemplatesData, ...moreGoalTemplates, ...additionalGoalTemplates];


const iconMap: Record<string, React.ReactNode> = {
  Heart: <Heart className="w-5 h-5" />,
  DollarSign: <DollarSign className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
  Brain: <Brain className="w-5 h-5" />,
  Briefcase: <Briefcase className="w-5 h-5" />,
  Dumbbell: <Dumbbell className="w-5 h-5" />,
  GraduationCap: <GraduationCap className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  Target: <Target className="w-5 h-5" />
};

interface GoalTemplatesProps {
  onSelectTemplate: (template: any) => void;
}

const GoalTemplates: React.FC<GoalTemplatesProps> = ({ onSelectTemplate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplateData | null>(null);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUseTemplate = (template: GoalTemplateData) => {
    setSelectedTemplate(template);
    setCustomizerOpen(true);
  };

  const handleSaveCustomized = (customizedGoal: any) => {
    onSelectTemplate(customizedGoal);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-100">
        <h2 className="text-3xl font-bold mb-2">Goal Templates Library</h2>
        <p className="text-gray-600">Choose from {allTemplates.length}+ pre-built goals with tasks, milestones, and best practices</p>
        <div className="flex gap-2 mt-3 text-sm text-gray-600">
          <Badge variant="secondary">{allTemplates.filter(t => t.category === 'Fitness').length} Fitness</Badge>
          <Badge variant="secondary">{allTemplates.filter(t => t.category === 'Business').length} Business</Badge>
          <Badge variant="secondary">{allTemplates.filter(t => t.category === 'Education').length} Education</Badge>
          <Badge variant="secondary">{allTemplates.filter(t => t.category === 'Finance').length} Finance</Badge>
          <Badge variant="secondary">{allTemplates.filter(t => t.category === 'Health').length} Health</Badge>
          <Badge variant="secondary">{allTemplates.filter(t => t.category === 'Personal Development').length} Personal Dev</Badge>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search goal templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"

          />
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="Fitness">Fitness</TabsTrigger>
          <TabsTrigger value="Business">Business</TabsTrigger>
          <TabsTrigger value="Education">Education</TabsTrigger>
          <TabsTrigger value="Personal Development">Personal</TabsTrigger>
          <TabsTrigger value="Finance">Finance</TabsTrigger>
          <TabsTrigger value="Health">Health</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {iconMap[template.icon]}
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                </div>
                <Badge className={getDifficultyColor(template.difficulty)}>
                  {template.difficulty}
                </Badge>
              </div>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{template.duration}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{template.popularity.toLocaleString()}</span>
                </div>
              </div>

              <Collapsible open={expandedCard === template.id} onOpenChange={(open) => setExpandedCard(open ? template.id : null)}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full">
                    {expandedCard === template.id ? 'Hide Details' : 'View Details'}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 mt-3">
                  <div>
                    <div className="flex items-center gap-1 text-sm font-medium mb-1">
                      <Target className="w-3 h-3" />
                      <span>Milestones</span>
                    </div>
                    <ul className="text-xs space-y-1 text-gray-600">
                      {template.milestones.slice(0, 3).map((m, i) => (
                        <li key={i}>• {m}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-sm font-medium mb-1">
                      <Lightbulb className="w-3 h-3" />
                      <span>Best Practices</span>
                    </div>
                    <ul className="text-xs space-y-1 text-gray-600">
                      {template.bestPractices.slice(0, 2).map((p, i) => (
                        <li key={i}>• {p}</li>
                      ))}
                    </ul>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Button 
                className="w-full"
                onClick={() => handleUseTemplate(template)}
              >
                Use This Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No templates found. Try adjusting your search or filters.
        </div>
      )}

      <GoalTemplateCustomizer
        template={selectedTemplate}
        open={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
        onSave={handleSaveCustomized}
      />
    </div>
  );
};

export default GoalTemplates;
export type { GoalTemplateData };
