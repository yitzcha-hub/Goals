import { Globe, Lock, Users } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface GoalPrivacySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function GoalPrivacySelector({ value, onChange }: GoalPrivacySelectorProps) {
  return (
    <div className="space-y-3">
      <Label>Privacy Settings</Label>
      <RadioGroup value={value} onValueChange={onChange}>
        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
          <RadioGroupItem value="private" id="private" />
          <Lock className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <label htmlFor="private" className="font-medium cursor-pointer">Private</label>
            <p className="text-sm text-muted-foreground">Only you can see this goal</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
          <RadioGroupItem value="friends" id="friends" />
          <Users className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <label htmlFor="friends" className="font-medium cursor-pointer">Friends</label>
            <p className="text-sm text-muted-foreground">Share with specific users</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
          <RadioGroupItem value="public" id="public" />
          <Globe className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <label htmlFor="public" className="font-medium cursor-pointer">Public</label>
            <p className="text-sm text-muted-foreground">Anyone can see and interact</p>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
}
