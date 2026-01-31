import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JournalTemplate, JournalPrompt } from '@/types/journalTemplate';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface CustomTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (template: JournalTemplate) => void;
}

export default function CustomTemplateDialog({ open, onOpenChange, onSave }: CustomTemplateDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📝');
  const [prompts, setPrompts] = useState<JournalPrompt[]>([
    { id: '1', question: '', placeholder: '' }
  ]);

  const icons = ['📝', '🙏', '🎯', '📅', '😊', '✍️', '💭', '🌟', '💡', '❤️', '🌈', '🔥'];

  const addPrompt = () => {
    setPrompts([...prompts, { id: Date.now().toString(), question: '', placeholder: '' }]);
  };

  const removePrompt = (id: string) => {
    if (prompts.length > 1) {
      setPrompts(prompts.filter(p => p.id !== id));
    }
  };

  const updatePrompt = (id: string, field: 'question' | 'placeholder', value: string) => {
    setPrompts(prompts.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    if (prompts.some(p => !p.question.trim())) {
      toast.error('All prompts must have a question');
      return;
    }

    const template: JournalTemplate = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      category: 'custom',
      icon,
      prompts,
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    onSave(template);
    resetForm();
    onOpenChange(false);
    toast.success('Custom template created!');
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setIcon('📝');
    setPrompts([{ id: '1', question: '', placeholder: '' }]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Template Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Custom Template" />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this template for?" rows={2} />
          </div>

          <div>
            <Label>Icon</Label>
            <div className="flex gap-2 flex-wrap mt-2">
              {icons.map(i => (
                <Button key={i} variant={icon === i ? 'default' : 'outline'} size="sm" onClick={() => setIcon(i)} className="text-xl">
                  {i}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Prompts</Label>
              <Button size="sm" variant="outline" onClick={addPrompt}>
                <Plus className="h-4 w-4 mr-1" /> Add Prompt
              </Button>
            </div>

            <div className="space-y-3">
              {prompts.map((prompt, idx) => (
                <div key={prompt.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Prompt {idx + 1}</Label>
                    {prompts.length > 1 && (
                      <Button size="sm" variant="ghost" onClick={() => removePrompt(prompt.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <Input value={prompt.question} onChange={(e) => updatePrompt(prompt.id, 'question', e.target.value)} placeholder="Enter your question..." />
                  <Input value={prompt.placeholder} onChange={(e) => updatePrompt(prompt.id, 'placeholder', e.target.value)} placeholder="Placeholder text (optional)" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Template</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
