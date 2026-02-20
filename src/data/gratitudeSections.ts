/**
 * Default 10 gratitude journal sections (from product spec).
 * Users can write in each and add custom sections.
 */
export const GRATITUDE_DEFAULT_SECTIONS: { key: string; label: string }[] = [
  { key: 'good-health', label: 'Good Health' },
  { key: 'family-friends-loved-ones', label: 'Family, Friends and Loved ones' },
  { key: 'food-water', label: 'Food & Water' },
  { key: 'safe-shelter', label: 'Safe Shelter' },
  { key: 'education-knowledge', label: 'Education & Knowledge' },
  { key: 'freedom-of-choice', label: 'Freedom of Choice' },
  { key: 'nature', label: 'Nature' },
  { key: 'modern-convenience', label: 'Modern Convenience' },
  { key: 'moments-of-joy', label: 'Moments of Joy' },
  { key: 'personal-resilience', label: 'Personal Resilience' },
];

export function getGratitudeSectionLabel(key: string): string {
  const found = GRATITUDE_DEFAULT_SECTIONS.find((s) => s.key === key);
  return found ? found.label : key;
}
