import { createClient } from '@supabase/supabase-js';

export default async function handler(
  req: { method?: string; body?: { code?: string; userId?: string } },
  res: { status: (n: number) => { json: (o: unknown) => void }; setHeader: (k: string, v: string) => void }
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).json({});
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    res.status(500).json({ error: 'Server not configured for invite codes' });
    return;
  }

  const code = typeof req.body?.code === 'string' ? req.body.code.trim().toUpperCase() : '';
  const userId = typeof req.body?.userId === 'string' ? req.body.userId.trim() : '';

  if (!code || !userId) {
    res.status(400).json({ error: 'Missing code or userId' });
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: inviteCode, error: fetchError } = await supabase
    .from('invite_codes')
    .select('id, uses_remaining, used_count, is_lifetime')
    .ilike('code', code)
    .maybeSingle();

  if (fetchError) {
    console.error('Invite code lookup error:', fetchError);
    res.status(500).json({ error: 'Failed to validate code' });
    return;
  }

  if (!inviteCode) {
    res.status(404).json({ error: 'Invalid or expired invite code' });
    return;
  }

  const usesRemaining = inviteCode.uses_remaining;
  if (usesRemaining != null && inviteCode.used_count >= usesRemaining) {
    res.status(400).json({ error: 'This invite code has reached its use limit' });
    return;
  }

  const { data: existingRedemption } = await supabase
    .from('invite_code_redemptions')
    .select('id')
    .eq('invite_code_id', inviteCode.id)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingRedemption) {
    res.status(400).json({ error: 'You have already used this invite code' });
    return;
  }

  const farFuture = 4102444800; // Jan 1, 2100
  const subscriptionRecord = {
    user_id: userId,
    status: 'active',
    plan_name: 'Lifetime',
    stripe_subscription_id: null,
    stripe_customer_id: null,
    stripe_price_id: null,
    trial_start: null,
    trial_end: null,
    current_period_start: Math.floor(Date.now() / 1000),
    current_period_end: farFuture,
    cancel_at_period_end: false,
    plan_amount: null,
    plan_currency: null,
    plan_interval: null,
    updated_at: new Date().toISOString(),
  };

  const { error: upsertSubError } = await supabase
    .from('subscriptions')
    .upsert(subscriptionRecord, { onConflict: 'user_id' });

  if (upsertSubError) {
    console.error('Subscription upsert error:', upsertSubError);
    res.status(500).json({ error: 'Failed to activate membership' });
    return;
  }

  const { error: redemptionError } = await supabase.from('invite_code_redemptions').insert({
    invite_code_id: inviteCode.id,
    user_id: userId,
  });

  if (redemptionError) {
    console.error('Redemption insert error:', redemptionError);
    res.status(500).json({ error: 'Failed to record redemption' });
    return;
  }

  await supabase
    .from('invite_codes')
    .update({
      used_count: inviteCode.used_count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', inviteCode.id);

  res.status(200).json({ success: true, message: 'Lifetime membership activated' });
}
