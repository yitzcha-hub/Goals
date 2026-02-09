/**
 * Paths users can choose: "Who do you want to become?"
 * Used for personalization from the start.
 */
export interface SuccessfulPath {
  id: string;
  title: string;
  description: string;
  icon: string;
  categoryFilter: string[];
  tagline: string;
}

export const successfulPaths: SuccessfulPath[] = [
  {
    id: 'entrepreneur',
    title: 'Entrepreneur',
    description: 'Build a business, ship products, grow revenue. Goals and plans used by founders.',
    icon: 'Briefcase',
    categoryFilter: ['Business', 'Finance'],
    tagline: 'From idea to launch',
  },
  {
    id: 'professional',
    title: 'Professional',
    description: 'Advance your career, develop skills, lead teams. Plans from top professionals.',
    icon: 'TrendingUp',
    categoryFilter: ['Business', 'Education', 'Personal Development'],
    tagline: 'Level up your career',
  },
  {
    id: 'creator',
    title: 'Creator',
    description: 'Launch a side project, build an audience, monetize your craft.',
    icon: 'Sparkles',
    categoryFilter: ['Business', 'Personal Development'],
    tagline: 'Build and grow',
  },
  {
    id: 'athlete',
    title: 'Athlete / Fitness',
    description: 'Run a marathon, lose weight, build muscle. Plans used by dedicated athletes.',
    icon: 'Dumbbell',
    categoryFilter: ['Fitness', 'Health'],
    tagline: 'Reach peak performance',
  },
  {
    id: 'student',
    title: 'Student',
    description: 'Master skills, pass exams, land your first role. Structured learning plans.',
    icon: 'GraduationCap',
    categoryFilter: ['Education', 'Personal Development'],
    tagline: 'Learn and achieve',
  },
  {
    id: 'wellness',
    title: 'Wellness & Balance',
    description: 'Improve health, manage finances, build habits. Sustainable lifestyle goals.',
    icon: 'Heart',
    categoryFilter: ['Health', 'Finance', 'Personal Development'],
    tagline: 'Sustainable growth',
  },
];
