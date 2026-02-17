import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'admin@example.com').split(',').map((e) => e.trim().toLowerCase());

function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase()) || email.toLowerCase().includes('admin');
}

export default async function handler(
  req: { method?: string; headers?: Record<string, string | string[] | undefined>; body?: { code?: string; label?: string; assigned_to?: string; uses_remaining?: number } },
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
  if (userError || !user || !isAdmin(user.email)) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

  // POST: create invite code
  const code = typeof req.body?.code === 'string' ? req.body.code.trim().toUpperCase() : '';
  const label = typeof req.body?.label === 'string' ? req.body.label.trim() : '';
  const assignedTo = typeof req.body?.assigned_to === 'string' ? req.body.assigned_to.trim() || null : null;
  const usesRemaining = typeof req.body?.uses_remaining === 'number' ? req.body.uses_remaining : null;

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
