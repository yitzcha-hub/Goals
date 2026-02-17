import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Copy, Gift, Plus } from 'lucide-react';
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

  const fetchCodes = async () => {
    const token = session?.access_token;
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/invite-codes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 403) return;
        throw new Error('Failed to load invite codes');
      }
      const data = await res.json();
      setCodes(data.codes ?? []);
    } catch {
      setCodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, [session?.access_token]);

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
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data?.error || 'Failed to create code', variant: 'destructive' });
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
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Access invite codes
        </CardTitle>
        <CardDescription>
          Invite codes are for life (no expiry). Create codes for influencers; they can share and track redemptions here.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Code</label>
            <Input
              placeholder="e.g. INFLUENCER1"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              className="uppercase max-w-[180px]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Label (optional)</label>
            <Input
              placeholder="e.g. Jane Doe"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="max-w-[160px]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Max uses (optional)</label>
            <Input
              type="number"
              min="1"
              placeholder="Unlimited"
              value={newUsesRemaining}
              onChange={(e) => setNewUsesRemaining(e.target.value)}
              className="max-w-[100px]"
            />
          </div>
          <Button type="submit" disabled={createLoading || newCode.trim().length < 4}>
            {createLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            Create code
          </Button>
        </form>

        <div>
          <h4 className="text-sm font-medium mb-2">Existing codes</h4>
          {codes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invite codes yet. Create one above.</p>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-2 font-medium">Code</th>
                    <th className="text-left p-2 font-medium">Label</th>
                    <th className="text-left p-2 font-medium">Used</th>
                    <th className="text-left p-2 font-medium">Limit</th>
                    <th className="text-left p-2 font-medium">Created</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {codes.map((row) => (
                    <tr key={row.id} className="border-t">
                      <td className="p-2 font-mono">{row.code}</td>
                      <td className="p-2 text-muted-foreground">{row.label || '—'}</td>
                      <td className="p-2">{row.used_count}</td>
                      <td className="p-2">{row.uses_remaining ?? '∞'}</td>
                      <td className="p-2 text-muted-foreground">
                        {new Date(row.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        <Button variant="ghost" size="icon" onClick={() => copyCode(row.code)} title="Copy code">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
