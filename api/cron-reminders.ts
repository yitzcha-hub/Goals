/**
 * Vercel Cron: Send due push reminders via Firebase Cloud Messaging.
 * Schedule: Run every minute (configure in vercel.json crons).
 *
 * Setup:
 * 1. Add FIREBASE_SERVICE_ACCOUNT_JSON to Vercel env (Firebase Console → Project Settings → Service accounts → Generate new private key; paste JSON string)
 * 2. Add SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (already present for Stripe webhook)
 * 3. Add cron in vercel.json: { "path": "/api/cron-reminders", "schedule": "* * * * *" }
 */
import { createClient } from '@supabase/supabase-js';
import * as admin from 'firebase-admin';

type Req = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
};

type Res = {
  status: (code: number) => { json: (body: unknown) => void };
};

export default async function handler(req: Req, res: Res): Promise<void> {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Verify cron secret (Vercel sets CRON_SECRET automatically when using cron)
  const authHeader = req.headers?.['authorization'];
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase config');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  if (!serviceAccountJson) {
    console.error('Missing FIREBASE_SERVICE_ACCOUNT_JSON. Add Firebase service account key to Vercel env.');
    res.status(500).json({ error: 'Firebase not configured' });
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Initialize Firebase Admin (lazy, once)
  if (!admin.apps.length) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson) as admin.ServiceAccount;
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } catch (e) {
      console.error('Firebase Admin init error:', e);
      res.status(500).json({ error: 'Firebase init failed' });
      return;
    }
  }

  const now = new Date().toISOString();

  // Fetch due reminders that are unsent
  const { data: reminders, error: remindersError } = await supabase
    .from('reminders')
    .select('id, user_id, message, type, entity_id, entity_type')
    .eq('is_sent', false)
    .lte('reminder_time', now)
    .limit(100);

  if (remindersError) {
    console.error('Supabase reminders fetch error:', remindersError);
    res.status(500).json({ error: remindersError.message });
    return;
  }

  if (!reminders?.length) {
    res.status(200).json({ sent: 0, message: 'No due reminders' });
    return;
  }

  // Fetch FCM tokens for users with due reminders
  const userIds = [...new Set(reminders.map((r) => r.user_id))];
  const { data: prefs } = await supabase
    .from('reminder_preferences')
    .select('user_id, fcm_token, push_enabled')
    .in('user_id', userIds)
    .eq('push_enabled', true);

  const tokenByUser = new Map<string, string>();
  for (const p of prefs || []) {
    if (p.fcm_token) tokenByUser.set(p.user_id, p.fcm_token);
  }

  let sent = 0;

  for (const reminder of reminders) {
    const token = tokenByUser.get(reminder.user_id);
    if (!token) continue;

    try {
      await admin.messaging().send({
        token,
        notification: {
          title: 'Goal Reminder',
          body: reminder.message,
        },
        data: {
          type: reminder.type,
          entity_id: reminder.entity_id || '',
          entity_type: reminder.entity_type || '',
          url: '/',
        },
        webpush: {
          fcmOptions: {
            link: '/',
          },
        },
      });

      await supabase
        .from('reminders')
        .update({ is_sent: true })
        .eq('id', reminder.id);

      sent++;
    } catch (e) {
      console.error('FCM send error for reminder', reminder.id, e);
    }
  }

  res.status(200).json({ sent, total: reminders.length });
}
