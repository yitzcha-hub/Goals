/**
 * AI integration for progress analysis and coaching.
 *
 * Provider priority:
 *   1. OpenAI  — if VITE_OPENAI_API_KEY is set (paid)
 *   2. Gemini  — if VITE_GEMINI_API_KEY is set (free tier: 15 RPM)
 *   3. null    — no AI features available
 *
 * Includes: response caching, request deduplication, client-side rate
 * limiting, and exponential-backoff retry on 429 responses.
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
/*  Response cache (in-memory + sessionStorage)                        */
/* ------------------------------------------------------------------ */

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CACHE_STORAGE_KEY = 'ai_response_cache';

interface CacheEntry {
  value: string;
  expiry: number; // epoch ms
}

/** Simple hash for cache keys — fast, not cryptographic. */
function hashPrompt(prompt: string): string {
  let h = 0;
  for (let i = 0; i < prompt.length; i++) {
    h = ((h << 5) - h + prompt.charCodeAt(i)) | 0;
  }
  return `ai_${h >>> 0}`;
}

/** In-memory cache (survives component re-mounts within session). */
const memoryCache = new Map<string, CacheEntry>();

function loadSessionCache(): Record<string, CacheEntry> {
  try {
    const raw = sessionStorage.getItem(CACHE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSessionCache(cache: Record<string, CacheEntry>): void {
  try {
    sessionStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cache));
  } catch {
    /* quota exceeded — ignore */
  }
}

function getCached(key: string): string | null {
  const now = Date.now();

  // 1. Memory cache
  const mem = memoryCache.get(key);
  if (mem && mem.expiry > now) return mem.value;
  if (mem) memoryCache.delete(key);

  // 2. Session storage
  const session = loadSessionCache();
  const entry = session[key];
  if (entry && entry.expiry > now) {
    memoryCache.set(key, entry); // promote to memory
    return entry.value;
  }

  return null;
}

function setCache(key: string, value: string): void {
  const entry: CacheEntry = { value, expiry: Date.now() + CACHE_TTL_MS };
  memoryCache.set(key, entry);

  const session = loadSessionCache();
  session[key] = entry;
  // Evict expired entries to avoid unbounded growth
  const now = Date.now();
  for (const k of Object.keys(session)) {
    if (session[k].expiry <= now) delete session[k];
  }
  saveSessionCache(session);
}

/* ------------------------------------------------------------------ */
/*  Request deduplication (in-flight map)                              */
/* ------------------------------------------------------------------ */

const inflightRequests = new Map<string, Promise<string | null>>();

/* ------------------------------------------------------------------ */
/*  Client-side rate limiter                                           */
/* ------------------------------------------------------------------ */

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 8; // max requests per window
const requestTimestamps: number[] = [];

function canMakeRequest(): boolean {
  const now = Date.now();
  // Remove timestamps outside the window
  while (requestTimestamps.length > 0 && requestTimestamps[0] <= now - RATE_LIMIT_WINDOW_MS) {
    requestTimestamps.shift();
  }
  return requestTimestamps.length < RATE_LIMIT_MAX;
}

function recordRequest(): void {
  requestTimestamps.push(Date.now());
}

/* ------------------------------------------------------------------ */
/*  Exponential backoff retry                                          */
/* ------------------------------------------------------------------ */

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ------------------------------------------------------------------ */
/*  Unified chat completion                                            */
/* ------------------------------------------------------------------ */

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const GEMINI_MODEL = 'gemini-2.0-flash';

function geminiUrl(key: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2_000; // 2 s → 4 s → 8 s

/**
 * Send a prompt and get back a text response from whichever provider is
 * available. Returns `null` when no provider is configured or on error.
 *
 * Features:
 *  - Checks in-memory + sessionStorage cache first
 *  - Deduplicates identical in-flight requests
 *  - Enforces a client-side rate limit (8 req/min)
 *  - Retries with exponential backoff on HTTP 429
 */
async function chatCompletion(
  prompt: string,
  { maxTokens = 800, temperature = 0.7 }: { maxTokens?: number; temperature?: number } = {},
): Promise<string | null> {
  const provider = getProvider();
  if (!provider) return null;

  // --- Cache check ---
  const cacheKey = hashPrompt(prompt + maxTokens + temperature);
  const cached = getCached(cacheKey);
  if (cached) {
    console.debug('[AI] cache hit');
    return cached;
  }

  // --- Deduplication ---
  const inflight = inflightRequests.get(cacheKey);
  if (inflight) {
    console.debug('[AI] dedup — reusing in-flight request');
    return inflight;
  }

  // --- Rate limit ---
  if (!canMakeRequest()) {
    console.warn('[AI] client-side rate limit reached — try again in a moment');
    throw new Error(
      provider.type === 'openai'
        ? 'Too many AI requests. Please wait a moment before trying again.'
        : 'Too many AI requests. Please wait a moment before trying again.',
    );
  }

  // --- Build the actual request (with retry) ---
  const execute = async (): Promise<string | null> => {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        recordRequest();

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

          if (res.status === 429) {
            // Parse Retry-After header if present, otherwise exponential backoff
            const retryAfter = res.headers.get('Retry-After');
            const delayMs = retryAfter
              ? parseInt(retryAfter, 10) * 1000
              : BASE_DELAY_MS * Math.pow(2, attempt);

            if (attempt < MAX_RETRIES) {
              console.warn(`[AI] 429 from OpenAI — retrying in ${delayMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
              await sleep(delayMs);
              continue;
            }
            throw new Error('OpenAI rate limit exceeded. Please wait a minute and try again, or check your plan at platform.openai.com.');
          }

          if (!res.ok) {
            if (res.status === 401)
              throw new Error('Invalid OpenAI API key. Please check your key in Settings.');
            const err = await res.text();
            console.error('OpenAI API error:', res.status, err);
            return null;
          }

          const data = await res.json();
          const text = data.choices?.[0]?.message?.content ?? null;
          if (text) setCache(cacheKey, text);
          return text;
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

        if (res.status === 429) {
          const delayMs = BASE_DELAY_MS * Math.pow(2, attempt);
          if (attempt < MAX_RETRIES) {
            console.warn(`[AI] 429 from Gemini — retrying in ${delayMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
            await sleep(delayMs);
            continue;
          }
          throw new Error('Gemini rate limit reached. Free tier allows 15 requests/min — please wait a moment.');
        }

        if (!res.ok) {
          if (res.status === 400 || res.status === 403)
            throw new Error('Invalid Gemini API key. Get a free key at aistudio.google.com/apikey');
          const err = await res.text();
          console.error('Gemini API error:', res.status, err);
          return null;
        }

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
        if (text) setCache(cacheKey, text);
        return text;
      } catch (e) {
        // Re-throw user-facing errors so hooks can display them
        if (
          e instanceof Error &&
          (e.message.includes('rate limit') ||
            e.message.includes('quota') ||
            e.message.includes('Too many AI') ||
            e.message.includes('Invalid'))
        ) {
          throw e;
        }
        // On final attempt, give up
        if (attempt === MAX_RETRIES) {
          console.error('AI chat completion error (all retries exhausted):', e);
          return null;
        }
        // Transient error — retry
        const delayMs = BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(`[AI] transient error — retrying in ${delayMs}ms`, e);
        await sleep(delayMs);
      }
    }
    return null;
  };

  const promise = execute().finally(() => {
    inflightRequests.delete(cacheKey);
  });

  inflightRequests.set(cacheKey, promise);
  return promise;
}

/** Message for multi-turn chat (no caching; used by site chatbot). */
export type ChatMessage = { role: 'user' | 'assistant'; content: string };

/**
 * Send a conversation to the AI and get the next assistant reply.
 * Uses the same provider (OpenAI or Gemini) and rate limiting as chatCompletion.
 */
export async function chatCompletionWithMessages(
  messages: ChatMessage[],
  { maxTokens = 600, temperature = 0.7 }: { maxTokens?: number; temperature?: number } = {},
): Promise<string | null> {
  const provider = getProvider();
  if (!provider) return null;

  if (!canMakeRequest()) {
    throw new Error('Too many AI requests. Please wait a moment before trying again.');
  }

  const execute = async (): Promise<string | null> => {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        recordRequest();

        if (provider.type === 'openai') {
          const res = await fetch(OPENAI_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${provider.key}`,
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: messages.map((m) => ({ role: m.role, content: m.content })),
              temperature,
              max_tokens: maxTokens,
            }),
          });

          if (res.status === 429) {
            const retryAfter = res.headers.get('Retry-After');
            const delayMs = retryAfter
              ? parseInt(retryAfter, 10) * 1000
              : BASE_DELAY_MS * Math.pow(2, attempt);
            if (attempt < MAX_RETRIES) {
              await sleep(delayMs);
              continue;
            }
            throw new Error('OpenAI rate limit exceeded. Please wait a minute and try again.');
          }

          if (!res.ok) {
            if (res.status === 401)
              throw new Error('Invalid OpenAI API key. Please check your key in Settings.');
            const err = await res.text();
            console.error('OpenAI API error:', res.status, err);
            return null;
          }

          const data = await res.json();
          return data.choices?.[0]?.message?.content ?? null;
        }

        /* ---------- Gemini: map messages to contents ---------- */
        const contents = messages.map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        }));
        const res = await fetch(geminiUrl(provider.key), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens,
            },
          }),
        });

        if (res.status === 429) {
          const delayMs = BASE_DELAY_MS * Math.pow(2, attempt);
          if (attempt < MAX_RETRIES) {
            await sleep(delayMs);
            continue;
          }
          throw new Error('Gemini rate limit reached. Please wait a moment.');
        }

        if (!res.ok) {
          if (res.status === 400 || res.status === 403)
            throw new Error('Invalid Gemini API key. Get a free key at aistudio.google.com/apikey');
          const err = await res.text();
          console.error('Gemini API error:', res.status, err);
          return null;
        }

        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
      } catch (e) {
        if (
          e instanceof Error &&
          (e.message.includes('rate limit') ||
            e.message.includes('quota') ||
            e.message.includes('Too many AI') ||
            e.message.includes('Invalid'))
        ) {
          throw e;
        }
        if (attempt === MAX_RETRIES) {
          console.error('AI chat (messages) error:', e);
          return null;
        }
        await sleep(BASE_DELAY_MS * Math.pow(2, attempt));
      }
    }
    return null;
  };

  return execute();
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

/* ------------------------------------------------------------------ */
/*  Image recommendation for generated goals (CDN pool)                */
/* ------------------------------------------------------------------ */

const CDN_BASE = 'https://d64gsuwffb70l.cloudfront.net/';

/** URLs already used in mock/demo data (DEFAULT_DEMO_GOALS, MOCK_IMAGES, DemoGoalDetailView). Recommendation will exclude these so generated goals get distinct, non-demo images. */
const DEMO_REGISTERED_IMAGE_URLS = new Set([
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760313364420_116e655c.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760313346309_a977d9c8.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760313355593_1366f9cc.webp`,
  `${CDN_BASE}68c468b90879cba7ca0dcccd_1757703340244_c4563a20.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760313337681_8f380009.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760531037278_55604682.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760313391802_60649dba.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760313372407_435111e0.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760313381569_d052cb92.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760313400738_0397d33b.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760313356469_7d5cbb6c.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760313357732_45dc90f0.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760313338490_d34ce5f7.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760313339293_90544afc.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760313347064_15ae5b20.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760313347821_2f491fc4.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760313365234_ba8c7e8e.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760313365979_65d24337.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760313373329_3bd1e9fc.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760313374079_754e70fb.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760313382703_29eb08a7.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760313384066_98016a1d.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760313393555_473380cf.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760313394327_57e28b17.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760313401543_1e9a42f2.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760313402336_36dc20cf.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760531038069_b2a3394d.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760531039095_6b7be7f5.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1760530848740_26e90107.webp`,
  `${CDN_BASE}68c468b90879cba7ca0dcccd_1757702374900_fddb27a2.webp`,
  `${CDN_BASE}68c468b90879cba7ca0dcccd_1757702384626_a69fcdca.webp`,
  `${CDN_BASE}68c468b90879cba7ca0dcccd_1757702389056_af014788.webp`,
  `${CDN_BASE}68c468b90879cba7ca0dcccd_1757703337273_2dced4c4.webp`,
  `${CDN_BASE}68c468b90879cba7ca0dcccd_1757703338555_17e75cdc.webp`,
  `${CDN_BASE}68c468b90879cba7ca0dcccd_1757703335687_2cec7799.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1759372135118_4c9c2359.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1759372137380_e7047228.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1759372139359_be9a5c69.webp`,
  `${CDN_BASE}68dab31588d806ca5c085b8d_1759372142163_71220ea3.webp`,
  `${CDN_BASE}692dfc7e4cdd91a34e5e367b_1768963852567_f1acdb0c.jpg`,
]);

/** Curated pool of goal images from CDN with semantic keywords for AI matching. Each image used at most once per batch. */
export const GOAL_IMAGE_POOL: { url: string; keywords: string[] }[] = [
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760313364420_116e655c.webp`, keywords: ['business', 'career', 'office', 'professional', 'work'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760313365234_ba8c7e8e.webp`, keywords: ['business', 'team', 'meeting', 'growth'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760313365979_65d24337.webp`, keywords: ['business', 'success', 'leadership'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760313346309_a977d9c8.webp`, keywords: ['health', 'fitness', 'exercise', 'workout'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760313347064_15ae5b20.webp`, keywords: ['health', 'wellness', 'active', 'running'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760313347821_2f491fc4.webp`, keywords: ['health', 'fitness', 'strength'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760313355593_1366f9cc.webp`, keywords: ['personal', 'growth', 'reflection', 'mindset'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760313356469_7d5cbb6c.webp`, keywords: ['personal', 'development', 'goals'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760313357732_45dc90f0.webp`, keywords: ['personal', 'achievement', 'success'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760313337681_8f380009.webp`, keywords: ['purpose', 'community', 'volunteer', 'giving', 'contribute'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760313338490_d34ce5f7.webp`, keywords: ['purpose', 'meaning', 'impact'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760313339293_90544afc.webp`, keywords: ['purpose', 'community', 'donate'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760313372407_435111e0.webp`, keywords: ['education', 'learning', 'study', 'books'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760313373329_3bd1e9fc.webp`, keywords: ['education', 'course', 'skill'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760313374079_754e70fb.webp`, keywords: ['education', 'graduation', 'achievement'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760313381569_d052cb92.webp`, keywords: ['creative', 'art', 'music', 'design'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760313382703_29eb08a7.webp`, keywords: ['creative', 'painting', 'expression'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760313384066_98016a1d.webp`, keywords: ['creative', 'portfolio', 'project'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760313391802_60649dba.webp`, keywords: ['finance', 'money', 'savings', 'budget'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760313393555_473380cf.webp`, keywords: ['finance', 'investment', 'growth'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760313394327_57e28b17.webp`, keywords: ['finance', 'financial freedom', 'planning'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760313400738_0397d33b.webp`, keywords: ['wellness', 'meditation', 'mindfulness', 'yoga'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760313401543_1e9a42f2.webp`, keywords: ['wellness', 'balance', 'calm'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760313402336_36dc20cf.webp`, keywords: ['wellness', 'self-care', 'peace'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760531037278_55604682.webp`, keywords: ['travel', 'adventure', 'explore', 'journey'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760531038069_b2a3394d.webp`, keywords: ['travel', 'destination', 'culture'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760531039095_6b7be7f5.webp`, keywords: ['travel', 'trip', 'vacation'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1760530848740_26e90107.webp`, keywords: ['travel', 'Japan', 'Asia', 'culture'] },
  { url: `${CDN_BASE}68c468b90879cba7ca0dcccd_1757703340244_c4563a20.webp`, keywords: ['family', 'friends', 'relationships', 'connection', 'together'] },
  { url: `${CDN_BASE}68c468b90879cba7ca0dcccd_1757702374900_fddb27a2.webp`, keywords: ['writing', 'book', 'author', 'creative writing'] },
  { url: `${CDN_BASE}68c468b90879cba7ca0dcccd_1757702384626_a69fcdca.webp`, keywords: ['photography', 'skill', 'portfolio', 'creative'] },
  { url: `${CDN_BASE}68c468b90879cba7ca0dcccd_1757702389056_af014788.webp`, keywords: ['travel', 'Europe', 'adventure'] },
  { url: `${CDN_BASE}68c468b90879cba7ca0dcccd_1757703337273_2dced4c4.webp`, keywords: ['wellness', 'yoga', 'meditation', 'mindfulness'] },
  { url: `${CDN_BASE}68c468b90879cba7ca0dcccd_1757703338555_17e75cdc.webp`, keywords: ['creative', 'art', 'music', 'expression'] },
  { url: `${CDN_BASE}68c468b90879cba7ca0dcccd_1757703335687_2cec7799.webp`, keywords: ['business', 'startup', 'entrepreneur'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1759582856408_5daccfe2.webp`, keywords: ['goal', 'target', 'achievement'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1759582857210_3b046c70.webp`, keywords: ['growth', 'progress', 'development'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1759582857965_f943f4b3.webp`, keywords: ['success', 'milestone', 'celebration'] },
  { url: `${CDN_BASE}68dab31588d806ca5c085b8d_1759582858737_2de0bd37.webp`, keywords: ['planning', 'strategy', 'roadmap'] },
  { url: `${CDN_BASE}692dfc7e4cdd91a34e5e367b_1768963852567_f1acdb0c.jpg`, keywords: ['finance', 'savings', 'emergency fund', 'money'] },
];

/**
 * Use AI to recommend one image per goal. Uses only images NOT already registered in mock/demo data,
 * and picks the best-matching image for each goal. No duplicate images across goals.
 */
export async function recommendImagesForGoals(goals: AIGeneratedGoal[]): Promise<string[]> {
  if (goals.length === 0) return [];
  const poolToUse = GOAL_IMAGE_POOL.filter((img) => !DEMO_REGISTERED_IMAGE_URLS.has(img.url));
  if (poolToUse.length === 0) return goals.map(() => GOAL_IMAGE_POOL[0]?.url ?? '');
  const imageList = poolToUse
    .map((img, i) => `  ${i}: ${img.keywords.join(', ')}`)
    .join('\n');

  const goalsDesc = goals
    .map(
      (g, i) =>
        `Goal ${i}: title="${g.title}" description="${g.description}" category=${g.category} steps=[${(g.steps ?? []).map((s) => s.title).join('; ')}]`,
    )
    .join('\n');

  const prompt = `You are matching goals to the best-suited image. We have ${poolToUse.length} images (index 0 to ${poolToUse.length - 1}) with these themes. Pick the image that best fits each goal.
${imageList}

Goals to match (one image index per goal; use each image at most once):
${goalsDesc}

Return a JSON array of ${goals.length} integers: the image index for goal 0, then goal 1, etc. Use only indices 0-${poolToUse.length - 1}. Prefer no duplicate indices when possible; if there are more goals than images, reuse the best-matching index. Choose the image that best suits each goal. Example: [0, 1, 2, 3]`;

  const raw = await chatCompletion(prompt, { maxTokens: 150, temperature: 0.3 });
  if (!raw) {
    const used = new Set<number>();
    return goals.map((g) => {
      const match = poolToUse.findIndex((img, i) => !used.has(i) && img.keywords.some((k) => g.category.toLowerCase().includes(k) || g.title.toLowerCase().includes(k)));
      const firstUnused = poolToUse.findIndex((_, i) => !used.has(i));
      const idx = match >= 0 ? match : (firstUnused >= 0 ? firstUnused : 0);
      used.add(idx);
      return poolToUse[idx]?.url ?? poolToUse[0]?.url ?? GOAL_IMAGE_POOL[0].url;
    });
  }

  const indices = parseJsonResponse<number[]>(raw);
  if (!Array.isArray(indices) || indices.length !== goals.length) {
    return goals.map((_, i) => poolToUse[i % poolToUse.length]?.url ?? poolToUse[0]?.url ?? GOAL_IMAGE_POOL[0].url);
  }

  return indices.map((idx) => {
    const n = Math.max(0, Math.min(poolToUse.length - 1, Math.floor(Number(idx))));
    return poolToUse[n]?.url ?? poolToUse[0]?.url ?? GOAL_IMAGE_POOL[0].url;
  });
}

/* ------------------------------------------------------------------ */
/*  generateGoalsWithOpenAI (dashboard onboarding)                     */
/* ------------------------------------------------------------------ */

export interface AIGeneratedGoalStep {
  title: string;
  predictDate: string; // YYYY-MM-DD
  predictPrice?: number;
}

export interface AIGeneratedGoal {
  title: string;
  description: string;
  timeline: '30' | '60' | '90' | '1year' | '5year';
  priority: 'high' | 'medium' | 'low';
  category: string;
  targetDate: string; // YYYY-MM-DD
  budget: number;
  steps: AIGeneratedGoalStep[];
}

export async function generateGoalsWithOpenAI(
  occupation: string,
  aspiration: string,
  description: string,
): Promise<AIGeneratedGoal[] | null> {
  const prompt = `You are a personal development coach. Based on the user's current occupation and aspiration, generate 1-3 concrete, achievable goals with steps.

User context:
- Occupation: ${occupation}
- Aspiration / what they want to become or do: ${aspiration}
${description ? `- Description of intended actions: ${description}` : ''}

For each goal, provide:
- title: clear, specific goal title
- description: 1-2 sentences
- timeline: one of "30", "60", "90", "1year", "5year"
- priority: "high", "medium", or "low"
- category: e.g. Career, Health, Finance, Education, Personal, Business
- targetDate: ISO date YYYY-MM-DD (realistic deadline)
- budget: total estimated cost in USD (number, 0 if free)
- steps: array of 3-5 steps, each with title, predictDate (YYYY-MM-DD), predictPrice (number, optional)

Respond with a JSON array only, no markdown. Example:
[
  {
    "title": "Land My Dream Job",
    "description": "Prepare and secure a role that aligns with my skills.",
    "timeline": "90",
    "priority": "high",
    "category": "Career",
    "targetDate": "2026-05-15",
    "budget": 500,
    "steps": [
      { "title": "Polish resume and LinkedIn", "predictDate": "2026-02-28", "predictPrice": 0 },
      { "title": "Apply to 20 target companies", "predictDate": "2026-04-15", "predictPrice": 0 }
    ]
  }
]`;

  const raw = await chatCompletion(prompt, { maxTokens: 1200, temperature: 0.7 });
  if (!raw) return null;
  const parsed = parseJsonResponse<AIGeneratedGoal[]>(raw);
  return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
}

/* ------------------------------------------------------------------ */
/*  generateTodosWithOpenAI (dashboard: AI Today / AI Tomorrow)       */
/* ------------------------------------------------------------------ */

export interface AIGeneratedTodo {
  title: string;
  timeSlot?: string; // e.g. "09:00"
}

export async function generateTodosWithOpenAI(
  day: 'today' | 'tomorrow',
  goals: { title: string; progress: number }[],
  previousTodos: { title: string; completed: boolean }[],
): Promise<AIGeneratedTodo[] | null> {
  const prompt = `You are a personal development coach. Generate a short to-do list for ${day} to help the user make progress on their goals.

Current goals (title, progress out of 10):
${goals.length ? goals.map((g) => `- "${g.title}" (${g.progress}/10)`).join('\n') : '(No goals yet)'}

Recent to-dos (completed or not):
${previousTodos.length ? previousTodos.slice(-15).map((t) => `- ${t.completed ? '[done]' : '[ ]'} ${t.title}`).join('\n') : '(None)'}

Return 2-4 concrete, actionable tasks for ${day}. Each can optionally have a timeSlot in 24h format like "09:00" or "14:00".
Respond with a JSON array only, no markdown. Example:
[
  { "title": "Review weekly goals and pick one priority action", "timeSlot": "09:00" },
  { "title": "Work on [goal name] for 15 minutes", "timeSlot": "14:00" }
]`;

  const raw = await chatCompletion(prompt, { maxTokens: 500, temperature: 0.7 });
  if (!raw) return null;
  const parsed = parseJsonResponse<AIGeneratedTodo[]>(raw);
  return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
}
