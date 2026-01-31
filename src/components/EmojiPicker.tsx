import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  trigger: React.ReactNode;
}

const COMMON_EMOJIS = [
  '👍', '❤️', '😂', '😊', '🎉', '🔥', '👏', '💪',
  '🙌', '✨', '⭐', '💯', '🎯', '🏆', '👌', '🤝'
];

export function EmojiPicker({ onEmojiSelect, trigger }: EmojiPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="grid grid-cols-8 gap-1">
          {COMMON_EMOJIS.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-lg hover:bg-primary/10"
              onClick={() => onEmojiSelect(emoji)}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
