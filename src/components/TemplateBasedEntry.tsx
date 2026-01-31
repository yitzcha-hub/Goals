import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { JournalTemplate, JournalTemplateResponse } from '@/types/journalTemplate';
import { Save, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TemplateBasedEntryProps {
  template: JournalTemplate;
  onSave: (entry: any) => void;
  onCancel: () => void;
}

export default function TemplateBasedEntry({ template, onSave, onCancel }: TemplateBasedEntryProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [responses, setResponses] = useState<JournalTemplateResponse[]>(
    template.prompts.map(p => ({ promptId: p.id, response: '' }))
  );

  const updateResponse = (promptId: string, response: string) => {
    setResponses(prev => prev.map(r => r.promptId === promptId ? { ...r, response } : r));
  };

  const handleSave = () => {
    const content = template.prompts.map((prompt, idx) => {
      const response = responses.find(r => r.promptId === prompt.id)?.response || '';
      return `**${prompt.question}**\n${response}`;
    }).join('\n\n');

    const entry = {
      id: Date.now().toString(),
      date,
      title: `${template.name} - ${new Date(date).toLocaleDateString()}`,
      content,
      mood: 'neutral',
      tags: [template.category, template.name],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateId: template.id,
      templateName: template.name
    };


    onSave(entry);
  };

  const isValid = responses.some(r => r.response.trim().length > 0);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{template.icon}</span>
              {template.name}
            </CardTitle>
            <CardDescription>{template.description}</CardDescription>
          </div>
          <Badge>{template.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="pl-10" />
          </div>
        </div>

        <div className="space-y-6">
          {template.prompts.map((prompt, idx) => (
            <div key={prompt.id} className="space-y-2">
              <label className="text-sm font-medium block">
                {idx + 1}. {prompt.question}
              </label>
              <Textarea
                value={responses.find(r => r.promptId === prompt.id)?.response || ''}
                onChange={(e) => updateResponse(prompt.id, e.target.value)}
                placeholder={prompt.placeholder || 'Write your response...'}
                className="min-h-[100px]"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave} disabled={!isValid}>
            <Save className="h-4 w-4 mr-2" />
            Save Entry
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
