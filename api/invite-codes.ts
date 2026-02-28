import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function normalizeEmail(email: string | undefined): string {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

async function isAdmin(
  supabaseService: SupabaseClient,
  email: string | undefined
): Promise<boolean> {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;
  const { data: rows, error } = await supabaseService
    .from('admins')
    .select('id, email');
  if (error) {
    console.error('Admins lookup error:', error);
    return false;
  }
  const list = (rows ?? []) as { id: string; email: string }[];
  return list.some((row) => normalizeEmail(row.email) === normalized);
}

/** Generate a random 10-digit numeric string (no leading zero for clarity). */
function random10DigitCode(): string {
  const first = Math.floor(Math.random() * 9) + 1;
  const rest = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
  return first + rest;
}

export default async function handler(
  req: { method?: string; headers?: Record<string, string | string[] | undefined>; body?: { code?: string; label?: string; assigned_to?: string; uses_remaining?: number; count?: number } },
  res: { status: (n: number) => { json: (o: unknown) => void }; setHeader: (k: string, v: string) => void }
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).json({});
    return;
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const authHeader = req.headers?.authorization;
  const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Missing Authorization token' });
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    res.status(500).json({ error: 'Server not configured' });
    return;
  }

  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error: userError } = await anonClient.auth.getUser(token);
  if (userError || !user) {
    res.status(401).json({ error: 'Invalid or missing token' });
    return;
  }

  const emailToCheck = (user.email ?? (user.user_metadata?.email as string | undefined) ?? '').trim() || undefined;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const adminOk = await isAdmin(supabase, emailToCheck);
  if (!adminOk) {
    res.status(403).json({
      error: 'Admin access required',
      hint: emailToCheck
        ? `Add this email to public.admins in Supabase: ${emailToCheck}`
        : 'Your account has no email; add your admin email to public.admins.',
    });
    return;
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('invite_codes')
      .select('id, code, label, assigned_to, is_lifetime, uses_remaining, used_count, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Invite codes list error:', error);
      res.status(500).json({ error: 'Failed to list invite codes' });
      return;
    }
    res.status(200).json({ codes: data ?? [] });
    return;
  }

  const count = typeof req.body?.count === 'number' ? Math.min(Math.max(1, Math.floor(req.body.count)), 100) : null;

  if (count != null && count > 0) {
    // Generate N random 10-digit single-use codes (no duplicates with existing)
    const { data: existingRows } = await supabase.from('invite_codes').select('code');
    const existingSet = new Set((existingRows ?? []).map((r: { code: string }) => r.code));

    const toInsert: string[] = [];
    let attempts = 0;
    const maxAttempts = count * 50;
    while (toInsert.length < count && attempts < maxAttempts) {
      attempts++;
      const c = random10DigitCode();
      if (!existingSet.has(c) && !toInsert.includes(c)) {
        toInsert.push(c);
        existingSet.add(c);
      }
    }

    if (toInsert.length === 0) {
      res.status(500).json({ error: 'Could not generate unique codes; try a smaller count' });
      return;
    }

    const rows = toInsert.map((code) => ({
      code,
      label: null,
      assigned_to: null,
      is_lifetime: true,
      uses_remaining: 1,
      created_by: user.id,
    }));

    const { data: inserted, error } = await supabase
      .from('invite_codes')
      .insert(rows)
      .select('id, code, created_at');

    if (error) {
      console.error('Invite codes bulk create error:', error);
      res.status(500).json({ error: 'Failed to create invite codes' });
      return;
    }

    res.status(200).json({ codes: inserted ?? [], created: (inserted ?? []).length });
    return;
  }

  // POST: create single invite code (manual)
  const code = typeof req.body?.code === 'string' ? req.body.code.trim().toUpperCase() : '';
  const label = typeof req.body?.label === 'string' ? req.body.label.trim() : '';
  const assignedTo = typeof req.body?.assigned_to === 'string' ? req.body.assigned_to.trim() || null : null;
  const usesRemaining = typeof req.body?.uses_remaining === 'number' ? req.body.uses_remaining : 1;

  if (!code || code.length < 4) {
    res.status(400).json({ error: 'Code must be at least 4 characters' });
    return;
  }

  const { data: existing } = await supabase.from('invite_codes').select('id').eq('code', code).maybeSingle();
  if (existing) {
    res.status(400).json({ error: 'This code already exists' });
    return;
  }

  const { data: inserted, error } = await supabase
    .from('invite_codes')
    .insert({
      code,
      label: label || null,
      assigned_to: assignedTo || null,
      is_lifetime: true,
      uses_remaining: usesRemaining,
    })
    .select('id, code, label, is_lifetime, uses_remaining, created_at')
    .single();

  if (error) {
    console.error('Invite code create error:', error);
    res.status(500).json({ error: 'Failed to create invite code' });
    return;
  }

  res.status(200).json({ code: inserted });
}
