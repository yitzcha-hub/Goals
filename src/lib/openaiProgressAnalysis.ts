/**
 * AI integration for progress analysis and coaching.
 *
 * Provider priority:
 *   1. OpenAI  — if VITE_OPENAI_API_KEY is set (paid)
 *   2. Gemini  — if VITE_GEMINI_API_KEY is set (free tier: 15 RPM)
 *   3. null    — no AI features available
 */

/* ------------------------------------------------------------------ */
/*  Provider detection                                                 */
/* ------------------------------------------------------------------ */

type Provider =
  | { type: 'openai'; key: string }
  | { type: 'gemini'; key: string };

function getProvider(): Provider | null {
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  if (openaiKey) return { type: 'openai', key: openaiKey };

  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (geminiKey) return { type: 'gemini', key: geminiKey };

  return null;
}

/** Returns which AI provider is active (useful for UI display). */
export function getActiveProvider(): string | null {
  const p = getProvider();
  return p ? p.type : null;
}

/* ------------------------------------------------------------------ */
/*  Unified chat completion                                            */
/* ------------------------------------------------------------------ */

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const GEMINI_MODEL = 'gemini-2.0-flash';

function geminiUrl(key: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
}

/**
 * Send a prompt and get back a text response from whichever provider is
 * available. Returns `null` when no provider is configured or on error.
 */
async function chatCompletion(
  prompt: string,
  { maxTokens = 800, temperature = 0.7 }: { maxTokens?: number; temperature?: number } = {},
): Promise<string | null> {
  const provider = getProvider();
  if (!provider) return null;

  try {
    if (provider.type === 'openai') {
      const res = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${provider.key}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!res.ok) {
        if (res.status === 429)
          throw new Error('OpenAI quota exceeded. Please check your plan and billing at platform.openai.com.');
        if (res.status === 401)
          throw new Error('Invalid OpenAI API key. Please check your key in Settings.');
        const err = await res.text();
        console.error('OpenAI API error:', res.status, err);
        return null;
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content ?? null;
    }

    /* ---------- Gemini ---------- */
    const res = await fetch(geminiUrl(provider.key), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      }),
    });

    if (!res.ok) {
      if (res.status === 429)
        throw new Error('Gemini rate limit reached. Free tier allows 15 requests/min — please wait a moment.');
      if (res.status === 400 || res.status === 403)
        throw new Error('Invalid Gemini API key. Get a free key at aistudio.google.com/apikey');
      const err = await res.text();
      console.error('Gemini API error:', res.status, err);
      return null;
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch (e) {
    // Re-throw user-facing errors so hooks can display them
    if (e instanceof Error && (e.message.includes('quota') || e.message.includes('rate limit') || e.message.includes('Invalid'))) {
      throw e;
    }
    console.error('AI chat completion error:', e);
    return null;
  }
}

/** Parse a JSON string from an AI response (strips markdown fences). */
function parseJsonResponse<T>(raw: string): T | null {
  try {
    const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned) as T;
  } catch {
    console.error('Failed to parse AI JSON response');
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Public types                                                       */
/* ------------------------------------------------------------------ */

export interface ProgressAnalysisInput {
  goals: { title: string; progress: number; timeline: string; description?: string }[];
  events: { title: string; status: string; startTime: string }[];
  todos: { title: string; completed: boolean; scheduledDate?: string | null }[];
  journalCount: number;
  gratitudeCount: number;
  streak: number;
}

export interface AIProgressInsight {
  category: 'completion' | 'consistency' | 'momentum' | 'suggestion' | 'encouragement';
  message: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AIProgressAnalysis {
  summary: string;
  insights: AIProgressInsight[];
  suggestedActions: string[];
  encouragement: string;
}

export interface GoalAnalysisInput {
  title: string;
  description?: string;
  timeline: string;
  progress: number;
}

export interface AIGoalAnalysis {
  successProbability: number;
  obstacles: string[];
  strategies: string[];
  motivation: string;
  suggestedDeadline?: string;
}

/* ------------------------------------------------------------------ */
/*  analyzeProgressWithAI                                              */
/* ------------------------------------------------------------------ */

export async function analyzeProgressWithAI(
  input: ProgressAnalysisInput,
): Promise<AIProgressAnalysis | null> {
  const prompt = `You are a supportive personal development coach. Analyze this user's progress data and provide meaningful, actionable insights.

User Data:
- Goals (${input.goals.length}): ${input.goals.map((g) => `${g.title} (${g.progress}/10 progress, ${g.timeline})`).join('; ')}
- Calendar events: ${input.events.length} total (${input.events.filter((e) => e.status === 'completed').length} completed, ${input.events.filter((e) => e.status === 'missed').length} missed)
- To-dos: ${input.todos.filter((t) => t.completed).length}/${input.todos.length} completed
- Journal entries this month: ${input.journalCount}
- Gratitude entries this month: ${input.gratitudeCount}
- Current streak: ${input.streak} days

Respond in JSON only, with this exact structure (no markdown):
{
  "summary": "2-3 sentence overview of their progress",
  "insights": [
    { "category": "completion|consistency|momentum|suggestion|encouragement", "message": "specific insight", "priority": "high|medium|low" }
  ],
  "suggestedActions": ["action 1", "action 2", "action 3"],
  "encouragement": "One uplifting sentence"
}`;

  const raw = await chatCompletion(prompt, { maxTokens: 800, temperature: 0.7 });
  if (!raw) return null;
  return parseJsonResponse<AIProgressAnalysis>(raw);
}

/* ------------------------------------------------------------------ */
/*  analyzeGoalWithAI                                                  */
/* ------------------------------------------------------------------ */

export async function analyzeGoalWithAI(
  input: GoalAnalysisInput,
): Promise<AIGoalAnalysis | null> {
  const prompt = `You are a personal development coach. Analyze this goal and provide feedback.

Goal: "${input.title}"
${input.description ? `Description: ${input.description}` : ''}
Timeline: ${input.timeline}
Current progress: ${input.progress}/10

Respond in JSON only:
{
  "successProbability": 0-100,
  "obstacles": ["obstacle 1", "obstacle 2"],
  "strategies": ["strategy 1", "strategy 2", "strategy 3"],
  "motivation": "One motivating sentence",
  "suggestedDeadline": "Optional ISO date or null"
}`;

  const raw = await chatCompletion(prompt, { maxTokens: 500, temperature: 0.7 });
  if (!raw) return null;
  return parseJsonResponse<AIGoalAnalysis>(raw);
}

/* ------------------------------------------------------------------ */
/*  getCheckInQuestionsWithAI                                          */
/* ------------------------------------------------------------------ */

const defaultCheckInQuestions = (title: string, progress: number) => [
  `What progress have you made on "${title}" recently?`,
  `What's one small step you could take today toward this goal?`,
  `How do you feel about your current progress (${progress}/10)?`,
];

export async function getCheckInQuestionsWithAI(
  goalTitle: string,
  progress: number,
): Promise<string[]> {
  const prompt = `Generate 3 reflective check-in questions for someone working on this goal: "${goalTitle}" (current progress: ${progress}/10). Be specific and encouraging. Return only a JSON array of strings, e.g. ["question 1", "question 2", "question 3"]`;

  try {
    const raw = await chatCompletion(prompt, { maxTokens: 300, temperature: 0.8 });
    if (!raw) return defaultCheckInQuestions(goalTitle, progress);

    const parsed = parseJsonResponse<string[]>(raw);
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : defaultCheckInQuestions(goalTitle, progress);
  } catch {
    return defaultCheckInQuestions(goalTitle, progress);
  }
}

/* ------------------------------------------------------------------ */
/*  getPersonalizedAdviceWithAI                                        */
/* ------------------------------------------------------------------ */

export async function getPersonalizedAdviceWithAI(
  goalData: { title: string; progress: number },
  userProgress: { eventsCompleted: number; todosCompleted: number; streak: number },
): Promise<{ message: string; nextSteps: string[] } | null> {
  const prompt = `As a personal development coach, give brief personalized advice for someone with:
- Goal: "${goalData.title}" (progress: ${goalData.progress}/10)
- Events completed recently: ${userProgress.eventsCompleted}
- To-dos completed: ${userProgress.todosCompleted}
- Streak: ${userProgress.streak} days

Respond in JSON: { "message": "2-3 sentence advice", "nextSteps": ["step 1", "step 2", "step 3"] }`;

  const raw = await chatCompletion(prompt, { maxTokens: 400, temperature: 0.7 });
  if (!raw) return null;
  return parseJsonResponse<{ message: string; nextSteps: string[] }>(raw);
}
