export interface JournalPrompt {
  id: string;
  question: string;
  placeholder?: string;
}

export interface JournalTemplate {
  id: string;
  name: string;
  description: string;
  category: 'gratitude' | 'goal-reflection' | 'daily-planning' | 'mood-tracking' | 'creative-writing' | 'custom';
  icon: string;
  prompts: JournalPrompt[];
  isCustom?: boolean;
  createdAt?: string;
}

export interface JournalTemplateResponse {
  promptId: string;
  response: string;
}
