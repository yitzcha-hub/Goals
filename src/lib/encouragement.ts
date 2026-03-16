/**
 * Auto-encouragement messages for when users complete tasks, work on goals, or make progress.
 * Picks a random message per context so it stays fresh.
 */

export type EncouragementContext =
  | 'taskComplete'
  | 'taskAdded'
  | 'goalComplete'
  | 'goalAdded'
  | 'goalProgress'
  | 'welcomeBack';

const MESSAGES: Record<EncouragementContext, string[]> = {
  taskComplete: [
    "Nice! One less thing on your list.",
    "You're getting it done.",
    "That's a win. Keep going!",
    "Done! Small steps add up.",
    "Checked off. You're on a roll!",
    "Another one down. Proud of you!",
    "You're making progress.",
    "That counts. Keep the momentum!",
  ],
  taskAdded: [
    "Good call—you're planning ahead.",
    "Added. One step at a time.",
    "Nice. Your future self will thank you.",
    "You're building your day.",
  ],
  goalComplete: [
    "You did it! Huge win.",
    "Goal completed. Celebrate this one!",
    "You stuck with it. Well done!",
    "That's real progress. Congratulations!",
    "You finished what you started. Amazing!",
  ],
  goalAdded: [
    "New goal set. You're moving forward.",
    "Love it. You're building something real.",
    "Another step toward who you want to be.",
    "Goal added. You've got this.",
  ],
  goalProgress: [
    "Every step counts. Keep going!",
    "You're moving the needle.",
    "Progress is progress. Nice work!",
    "You're staying with it. That matters.",
  ],
  welcomeBack: [
    "You've got momentum. Keep it going!",
    "Good to see you back. Pick up where you left off.",
    "You're making progress. Keep showing up!",
    "Every day you show up counts.",
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Returns a random encouragement message for the given context.
 * Use when the user completes a task, adds a goal, marks a goal complete, etc.
 */
export function getEncouragement(context: EncouragementContext): string {
  return pick(MESSAGES[context]);
}

/**
 * Returns a contextual welcome message when the user has completed tasks today.
 * Pass the count of tasks completed today (e.g. from todos.filter(t => t.completed && t.scheduledDate === todayIso).length).
 */
export function getWelcomeEncouragement(completedTodayCount: number): string | null {
  if (completedTodayCount <= 0) return null;
  const messages = [
    `You've completed ${completedTodayCount} task${completedTodayCount === 1 ? '' : 's'} today. Keep it up!`,
    `${completedTodayCount} done today. You're on a roll!`,
    `Nice—${completedTodayCount} task${completedTodayCount === 1 ? '' : 's'} in the books today.`,
  ];
  return pick(messages);
}
