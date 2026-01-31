import { JournalTemplate } from '@/types/journalTemplate';

export const prebuiltTemplates: JournalTemplate[] = [
  {
    id: 'gratitude-daily',
    name: 'Daily Gratitude',
    description: 'Reflect on the positive moments and things you\'re grateful for today',
    category: 'gratitude',
    icon: '🙏',
    prompts: [
      { id: 'g1', question: 'What are three things you\'re grateful for today?', placeholder: 'List three things...' },
      { id: 'g2', question: 'Who made a positive impact on your day?', placeholder: 'Describe the person and their impact...' },
      { id: 'g3', question: 'What small moment brought you joy today?', placeholder: 'Describe the moment...' }
    ]
  },
  {
    id: 'goal-reflection-weekly',
    name: 'Weekly Goal Reflection',
    description: 'Review your progress and plan for the week ahead',
    category: 'goal-reflection',
    icon: '🎯',
    prompts: [
      { id: 'gr1', question: 'What goals did you make progress on this week?', placeholder: 'List your accomplishments...' },
      { id: 'gr2', question: 'What challenges did you face?', placeholder: 'Describe the challenges...' },
      { id: 'gr3', question: 'What will you focus on next week?', placeholder: 'Set your priorities...' },
      { id: 'gr4', question: 'What lessons did you learn?', placeholder: 'Reflect on insights...' }
    ]
  },
  {
    id: 'daily-planning',
    name: 'Daily Planner',
    description: 'Structure your day with intention and clarity',
    category: 'daily-planning',
    icon: '📅',
    prompts: [
      { id: 'dp1', question: 'What are your top 3 priorities today?', placeholder: 'List your priorities...' },
      { id: 'dp2', question: 'What time blocks will you dedicate to each priority?', placeholder: 'Schedule your day...' },
      { id: 'dp3', question: 'What potential obstacles might you face?', placeholder: 'Anticipate challenges...' },
      { id: 'dp4', question: 'How will you take care of yourself today?', placeholder: 'Plan self-care...' }
    ]
  },
  {
    id: 'mood-check',
    name: 'Mood Check-In',
    description: 'Track and understand your emotional state',
    category: 'mood-tracking',
    icon: '😊',
    prompts: [
      { id: 'mc1', question: 'How are you feeling right now? (1-10)', placeholder: 'Rate your mood...' },
      { id: 'mc2', question: 'What emotions are you experiencing?', placeholder: 'Name your emotions...' },
      { id: 'mc3', question: 'What triggered these feelings?', placeholder: 'Identify triggers...' },
      { id: 'mc4', question: 'What do you need right now?', placeholder: 'Express your needs...' }
    ]
  },
  {
    id: 'creative-prompt',
    name: 'Creative Writing',
    description: 'Explore your creativity with open-ended prompts',
    category: 'creative-writing',
    icon: '✍️',
    prompts: [
      { id: 'cw1', question: 'If you could have dinner with anyone, who would it be and why?', placeholder: 'Write freely...' },
      { id: 'cw2', question: 'Describe a place that makes you feel at peace', placeholder: 'Paint a picture with words...' },
      { id: 'cw3', question: 'What would you do if you had no fear?', placeholder: 'Dream big...' }
    ]
  }
];
