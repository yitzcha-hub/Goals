/**
 * Mock data for demo onboarding flow (no OpenAI).
 * Generates goals with steps (predict date, predict price) based on occupation + aspiration.
 */

export const OCCUPATIONS = [
  { value: 'engineer', label: 'Engineer' },
  { value: 'process-tech', label: 'Process Tech' },
  { value: 'production-worker', label: 'Production worker' },
  { value: 'office-job', label: 'Office Job' },
  { value: 'sales-marketing', label: 'Sales/Marketing' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'other', label: 'Other' },
] as const;

export const ASPIRATION_PRESETS: Record<string, { value: string; label: string }[]> = {
  engineer: [
    { value: 'land-dream-job', label: 'Land my dream job' },
    { value: 'get-promotion', label: 'Get promoted' },
    { value: 'learn-leadership', label: 'Develop leadership skills' },
    { value: 'switch-career', label: 'Switch career path' },
  ],
  'process-tech': [
    { value: 'get-promotion', label: 'Get promoted' },
    { value: 'learn-skill', label: 'Master a new skill' },
    { value: 'personal-growth', label: 'Personal growth' },
    { value: 'work-remote', label: 'Move to remote work' },
  ],
  'production-worker': [
    { value: 'get-promotion', label: 'Get promoted' },
    { value: 'learn-skill', label: 'Master a new skill' },
    { value: 'personal-growth', label: 'Personal growth' },
    { value: 'switch-career', label: 'Switch career path' },
  ],
  'office-job': [
    { value: 'get-promotion', label: 'Get promoted' },
    { value: 'work-remote', label: 'Move to remote work' },
    { value: 'learn-leadership', label: 'Develop leadership skills' },
    { value: 'personal-growth', label: 'Personal growth' },
  ],
  'sales-marketing': [
    { value: 'reach-revenue', label: 'Hit revenue milestone' },
    { value: 'scale-business', label: 'Scale my business' },
    { value: 'double-clients', label: 'Grow client base' },
    { value: 'get-promotion', label: 'Get promoted' },
  ],
  doctor: [
    { value: 'get-promotion', label: 'Advance in my specialty' },
    { value: 'personal-growth', label: 'Personal growth' },
    { value: 'work-life-balance', label: 'Better work-life balance' },
    { value: 'health-goal', label: 'Health goal' },
  ],
  nurse: [
    { value: 'get-promotion', label: 'Advance my nursing career' },
    { value: 'learn-skill', label: 'Master a new skill' },
    { value: 'work-life-balance', label: 'Better work-life balance' },
    { value: 'personal-growth', label: 'Personal growth' },
  ],
  other: [
    { value: 'personal-growth', label: 'Personal growth' },
    { value: 'financial-goal', label: 'Financial goal' },
    { value: 'health-goal', label: 'Health goal' },
    { value: 'creative-project', label: 'Creative project' },
  ],
};

export interface DemoStep {
  id: string;
  title: string;
  completed: boolean;
  predictDate?: string;
  predictPrice?: number;
}

export interface DemoGoalGenerated {
  id: string;
  title: string;
  description: string;
  progress: number;
  timeline: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  targetDate: string;
  image: string;
  budget: number;
  spent: number;
  steps: DemoStep[];
}

/** Default image URL per category (for demo and for mapping AI-generated goals). Uses same "start" images as progress timeline. */
export const MOCK_IMAGES: Record<string, string> = {
  Business: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313364420_116e655c.webp',
  Health: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313346309_a977d9c8.webp',
  Personal: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313355593_1366f9cc.webp',
  Education: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313372407_435111e0.webp',
  Finance: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313391802_60649dba.webp',
  Career: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313364420_116e655c.webp',
  Travel: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760531037278_55604682.webp',
  Purpose: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313337681_8f380009.webp',
  Community: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313337681_8f380009.webp',
  Volunteer: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313337681_8f380009.webp',
  Contribute: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313337681_8f380009.webp',
  Donate: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313337681_8f380009.webp',
  Ideas: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313337681_8f380009.webp',
  Family: 'https://d64gsuwffb70l.cloudfront.net/68c468b90879cba7ca0dcccd_1757703340244_c4563a20.webp',
  Friends: 'https://d64gsuwffb70l.cloudfront.net/68c468b90879cba7ca0dcccd_1757703340244_c4563a20.webp',
  Relationships: 'https://d64gsuwffb70l.cloudfront.net/68c468b90879cba7ca0dcccd_1757703340244_c4563a20.webp',
  Wellness: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313400738_0397d33b.webp',
  Creative: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760313381569_d052cb92.webp',
};

export function getDefaultImageForCategory(category: string): string {
  return MOCK_IMAGES[category] ?? MOCK_IMAGES['Personal'] ?? '';
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/**
 * Generate 1–2 mock goals with steps (predict date, predict price) based on occupation and aspiration.
 * No API calls — pure mock.
 */
export function generateRecommendedGoals(
  occupation: string,
  aspiration: string,
  description: string
): DemoGoalGenerated[] {
  const now = new Date();
  const baseDate = now.toISOString().split('T')[0];
  const id = () => `rec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const goals: DemoGoalGenerated[] = [];
  const imageFor = (cat: string) => MOCK_IMAGES[cat] ?? MOCK_IMAGES['Personal'] ?? '';

  // Goal 1 — primary (based on aspiration)
  const primaryTemplates: Record<string, Partial<DemoGoalGenerated> & { steps: { title: string; predictDateOffset: number; predictPrice: number }[] }> = {
    'land-dream-job': {
      title: 'Land My Dream Job',
      description: description || 'Prepare and secure a role that aligns with my skills and values.',
      category: 'Career',
      timeline: '90',
      priority: 'high',
      targetDate: addDays(baseDate, 90),
      budget: 500,
      spent: 0,
      steps: [
        { title: 'Polish resume and LinkedIn', predictDateOffset: 14, predictPrice: 0 },
        { title: 'Apply to 20 target companies', predictDateOffset: 45, predictPrice: 0 },
        { title: 'Complete 5 interviews', predictDateOffset: 75, predictPrice: 100 },
        { title: 'Accept and sign offer', predictDateOffset: 90, predictPrice: 0 },
      ],
    },
    'scale-business': {
      title: 'Scale My Business to Next Level',
      description: description || 'Systematize operations and grow revenue by 50%.',
      category: 'Business',
      timeline: '1year',
      priority: 'high',
      targetDate: addDays(baseDate, 365),
      budget: 15000,
      spent: 2000,
      steps: [
        { title: 'Define KPIs and weekly reviews', predictDateOffset: 30, predictPrice: 0 },
        { title: 'Launch new offer or product', predictDateOffset: 120, predictPrice: 3000 },
        { title: 'Hire first part-time help', predictDateOffset: 180, predictPrice: 5000 },
        { title: 'Hit 50% revenue increase', predictDateOffset: 365, predictPrice: 0 },
      ],
    },
    'get-promotion': {
      title: 'Get Promoted to Senior Role',
      description: description || 'Demonstrate impact and secure a promotion.',
      category: 'Career',
      timeline: '90',
      priority: 'high',
      targetDate: addDays(baseDate, 90),
      budget: 300,
      spent: 0,
      steps: [
        { title: 'Document achievements and metrics', predictDateOffset: 14, predictPrice: 0 },
        { title: 'Request feedback from manager', predictDateOffset: 30, predictPrice: 0 },
        { title: 'Lead one visible project', predictDateOffset: 60, predictPrice: 100 },
        { title: 'Formal review and promotion', predictDateOffset: 90, predictPrice: 0 },
      ],
    },
    'double-clients': {
      title: 'Double My Freelance Client Base',
      description: description || 'Consistent outreach and delivery to attract more clients.',
      category: 'Business',
      timeline: '90',
      priority: 'high',
      targetDate: addDays(baseDate, 90),
      budget: 800,
      spent: 200,
      steps: [
        { title: 'Update portfolio and case studies', predictDateOffset: 21, predictPrice: 0 },
        { title: 'Reach out to 50 prospects', predictDateOffset: 45, predictPrice: 200 },
        { title: 'Close 3 new clients', predictDateOffset: 75, predictPrice: 400 },
        { title: 'Maintain 2x client count', predictDateOffset: 90, predictPrice: 0 },
      ],
    },
    'personal-growth': {
      title: 'Meaningful Personal Growth',
      description: description || 'Build habits and skills that matter to me.',
      category: 'Personal',
      timeline: '90',
      priority: 'medium',
      targetDate: addDays(baseDate, 90),
      budget: 200,
      spent: 0,
      steps: [
        { title: 'Set 3 key habits and track daily', predictDateOffset: 14, predictPrice: 0 },
        { title: 'Complete one course or book', predictDateOffset: 45, predictPrice: 80 },
        { title: 'Monthly review and adjust', predictDateOffset: 90, predictPrice: 0 },
      ],
    },
  };

  const templateKey = aspiration in primaryTemplates ? aspiration : 'personal-growth';
  const template = primaryTemplates[templateKey] || primaryTemplates['personal-growth'];
  if (template && template.steps) {
    const steps: DemoStep[] = template.steps.map((s, i) => ({
      id: `s${i + 1}`,
      title: s.title,
      completed: false,
      predictDate: addDays(baseDate, s.predictDateOffset),
      predictPrice: s.predictPrice,
    }));
    goals.push({
      id: id(),
      title: template.title!,
      description: template.description!,
      progress: 0,
      timeline: template.timeline!,
      priority: template.priority!,
      category: template.category!,
      targetDate: template.targetDate!,
      image: MOCK_IMAGES[template.category!] || MOCK_IMAGES.Personal,
      budget: template.budget ?? 0,
      spent: template.spent ?? 0,
      steps,
    });
  }

  // Second goal — generic "support" goal (e.g. health or finance)
  goals.push({
    id: id(),
    title: 'Build a Sustainable Routine',
    description: 'Support your main goal with consistent habits: sleep, movement, and reflection.',
    progress: 2,
    timeline: '30',
    priority: 'medium',
    category: 'Health',
    targetDate: addDays(baseDate, 30),
    image: MOCK_IMAGES.Health,
    budget: 0,
    spent: 0,
    steps: [
      { id: 's1', title: 'Define morning and evening routine', completed: false, predictDate: addDays(baseDate, 7), predictPrice: 0 },
      { id: 's2', title: 'Track for 2 weeks', completed: false, predictDate: addDays(baseDate, 21), predictPrice: 0 },
      { id: 's3', title: 'Lock in habit', completed: false, predictDate: addDays(baseDate, 30), predictPrice: 0 },
    ],
  });

  return goals;
}

/** Mock AI insights for a goal (no OpenAI). */
export function getMockGoalInsights(goalTitle: string, progress: number): {
  status: string;
  improvements: string[];
  todoToday: string[];
  todoTomorrow: string[];
} {
  return {
    status: progress >= 7
      ? 'You\'re on track. Keep the momentum.'
      : progress >= 4
        ? 'Good progress. Focus on the next step.'
        : 'Getting started. Pick one step to complete this week.',
    improvements: [
      'Break the next step into 2–3 smaller tasks.',
      'Schedule a fixed time block for this goal each week.',
      'Add one note or photo to the Progress Timeline this week.',
    ],
    todoToday: [
      'Review your current step and complete one small action.',
      'Add a 15-minute block to your calendar for this goal tomorrow.',
    ],
    todoTomorrow: [
      'Spend 15 minutes on the next sub-task.',
      'Update your progress (0–10) if you made progress.',
    ],
  };
}

/** Mock to-do list by day (AI-generated style, no API). */
export function getMockTodosForDay(day: 'today' | 'tomorrow', goals: { title: string }[]): { title: string; timeSlot?: string }[] {
  const goalTitles = goals.slice(0, 2).map(g => g.title);
  if (day === 'today') {
    return [
      { title: 'Review goals and pick one priority action', timeSlot: '09:00' },
      { title: goalTitles[0] ? `Work on: ${goalTitles[0]} (15 min)` : 'Work on primary goal (15 min)', timeSlot: '14:00' },
      { title: 'Quick reflection or note in journal', timeSlot: '20:00' },
    ];
  }
  return [
    { title: 'Block 30 min for your top goal', timeSlot: '10:00' },
    { title: goalTitles[1] ? `Next step for: ${goalTitles[1]}` : 'Next step for second goal', timeSlot: '15:00' },
    { title: 'Plan next day priorities', timeSlot: '21:00' },
  ];
}
