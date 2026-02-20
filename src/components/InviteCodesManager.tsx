import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Copy, Gift, Plus, ShieldAlert, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface InviteCodeRow {
  id: string;
  code: string;
  label: string | null;
  assigned_to: string | null;
  is_lifetime: boolean;
  uses_remaining: number | null;
  used_count: number;
  created_at: string;
}

export function InviteCodesManager() {
  const { session } = useAuth();
  const [codes, setCodes] = useState<InviteCodeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newUsesRemaining, setNewUsesRemaining] = useState<string>('');
  const [generateCount, setGenerateCount] = useState<string>('5');
  const [generateLoading, setGenerateLoading] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [accessHint, setAccessHint] = useState<string | null>(null);
  const lastFetchedTokenRef = useRef<string | null>(null);

  const fetchCodes = async () => {
    const token = session?.access_token;
    setAccessError(null);
    setAccessHint(null);
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/invite-codes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 403) {
        setAccessError(data?.error ?? 'You don’t have permission to manage invite codes.');
        setAccessHint(data?.hint ?? null);
        setCodes([]);
        return;
      }
      if (!res.ok) throw new Error('Failed to load invite codes');
      setCodes(data.codes ?? []);
    } catch {
      setCodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = session?.access_token ?? null;
    if (!token) {
      setLoading(false);
      return;
    }
    // Only fetch when token actually changed (e.g. new login), not on every session reference update
    if (lastFetchedTokenRef.current === token) return;
    lastFetchedTokenRef.current = token;
    fetchCodes();
  }, [session?.access_token]);

  const handleGenerate = async () => {
    const n = parseInt(generateCount, 10);
    if (!n || n < 1 || n > 100) {
      toast({ title: 'Enter a number between 1 and 100', variant: 'destructive' });
      return;
    }
    const token = session?.access_token;
    if (!token) return;
    setGenerateLoading(true);
    setAccessError(null);
    try {
      const res = await fetch('/api/invite-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ count: n }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 403) {
        setAccessError((data?.error as string) ?? 'Admin access required.');
        setAccessHint((data?.hint as string) ?? null);
        toast({ title: 'Access denied', variant: 'destructive' });
        return;
      }
      if (!res.ok) {
        toast({ title: (data?.error as string) || 'Failed to generate codes', variant: 'destructive' });
        return;
      }
      const created = data?.created ?? data?.codes?.length ?? 0;
      toast({ title: `Generated ${created} invite code(s)` });
      setGenerateCount('5');
      fetchCodes();
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = newCode.trim().toUpperCase();
    if (!code || code.length < 4) {
      toast({ title: 'Code must be at least 4 characters', variant: 'destructive' });
      return;
    }
    const token = session?.access_token;
    if (!token) return;
    setCreateLoading(true);
    setAccessError(null);
    try {
      const res = await fetch('/api/invite-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          code,
          label: newLabel.trim() || undefined,
          uses_remaining: newUsesRemaining.trim() ? parseInt(newUsesRemaining, 10) : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 403) {
        setAccessError((data?.error as string) ?? 'Admin access required.');
        setAccessHint((data?.hint as string) ?? null);
        toast({ title: 'Access denied', variant: 'destructive' });
        return;
      }
      if (!res.ok) {
        toast({ title: (data?.error as string) || 'Failed to create code', variant: 'destructive' });
        return;
      }
      toast({ title: 'Invite code created' });
      setNewCode('');
      setNewLabel('');
      setNewUsesRemaining('');
      fetchCodes();
    } finally {
      setCreateLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Copied to clipboard' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (accessError) {
    return (
      <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
        <CardContent className="pt-6 space-y-4">
          <Alert variant="warning" className="border-amber-300 dark:border-amber-700">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Access denied</AlertTitle>
            <AlertDescription>
              <span className="block mb-2">{accessError}</span>
              {accessHint && (
                <code className="mt-2 block p-2 rounded bg-amber-100 dark:bg-amber-900/40 text-xs break-all">
                  {accessHint}
                </code>
              )}
            </AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground">
            Run the SQL in Supabase (SQL Editor) to add your email:{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
              INSERT INTO public.admins (email) VALUES (&apos;your@email.com&apos;) ON CONFLICT (email) DO NOTHING;
            </code>
          </p>
          <Button variant="outline" onClick={fetchCodes}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-sm border-0 bg-card/50 backdrop-blur-sm">
      <CardHeader className="space-y-1 pb-4 md:pb-6">
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Gift className="h-5 w-5 text-primary" />
          </span>
          Invite codes
        </CardTitle>
        <CardDescription className="text-sm md:text-base">
          Single-use codes grant lifetime access. Generate random 10-digit codes or create a custom code.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 md:space-y-8">
        {/* Generate codes */}
        <div className="rounded-xl border bg-muted/30 p-4 md:p-5 space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Generate codes</h4>
          <p className="text-xs text-muted-foreground">Random 10-digit codes; no duplicates.</p>
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="space-y-1.5 flex-1 sm:max-w-[140px]">
              <label className="text-sm font-medium">Number</label>
              <Input
                type="number"
                min={1}
                max={100}
                value={generateCount}
                onChange={(e) => setGenerateCount(e.target.value)}
                className="h-10"
              />
            </div>
            <Button
              type="button"
              variant="default"
              onClick={handleGenerate}
              disabled={generateLoading}
              className="h-10 shrink-0"
            >
              {generateLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Generate
            </Button>
          </div>
        </div>

        {/* Custom code */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Custom code (optional)</h4>
          <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="space-y-1.5 flex-1 min-w-0 sm:max-w-[180px]">
              <label className="text-sm font-medium">Code</label>
              <Input
                placeholder="e.g. INFLUENCER1"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                className="uppercase h-10"
              />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0 sm:max-w-[160px]">
              <label className="text-sm font-medium">Label (optional)</label>
              <Input
                placeholder="e.g. Jane Doe"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5 w-28">
              <label className="text-sm font-medium">Max uses</label>
              <Input
                type="number"
                min={1}
                placeholder="∞"
                value={newUsesRemaining}
                onChange={(e) => setNewUsesRemaining(e.target.value)}
                className="h-10"
              />
            </div>
            <Button type="submit" disabled={createLoading || newCode.trim().length < 4} className="h-10 shrink-0">
              {createLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Create
            </Button>
          </form>
        </div>

        {/* Existing codes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">Existing codes</h4>
            {codes.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {codes.length} total
              </Badge>
            )}
          </div>
          {codes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center rounded-lg border border-dashed">
              No invite codes yet. Generate or create one above.
            </p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="text-left p-3 font-medium">Code</th>
                      <th className="text-left p-3 font-medium">Label</th>
                      <th className="text-left p-3 font-medium">Used</th>
                      <th className="text-left p-3 font-medium">Limit</th>
                      <th className="text-left p-3 font-medium">Created</th>
                      <th className="w-12 p-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {codes.map((row) => (
                      <tr key={row.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="p-3 font-mono font-medium">{row.code}</td>
                        <td className="p-3 text-muted-foreground">{row.label || '—'}</td>
                        <td className="p-3">{row.used_count}</td>
                        <td className="p-3 text-muted-foreground">{row.uses_remaining ?? '∞'}</td>
                        <td className="p-3 text-muted-foreground">
                          {new Date(row.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => copyCode(row.code)}
                            title="Copy code"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {codes.map((row) => (
                  <div
                    key={row.id}
                    className="flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono font-semibold text-base break-all">{row.code}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => copyCode(row.code)}
                        title="Copy"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span>{row.label || 'No label'}</span>
                      <span>Used: {row.used_count} / {row.uses_remaining ?? '∞'}</span>
                      <span>{new Date(row.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
