import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Copy, Gift } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface InviteCodeRow {
  id: string;
  code: string;
  label: string | null;
  used_count: number;
  uses_remaining: number | null;
  created_at: string;
}

export default function InviteCodes() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [codes, setCodes] = useState<InviteCodeRow[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.email?.toLowerCase().includes('admin') ?? false;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    if (isAdmin) {
      navigate('/admin#invite-codes', { replace: true });
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from('invite_codes')
        .select('id, code, label, used_count, uses_remaining, created_at')
        .order('created_at', { ascending: false });
      if (!error) setCodes(data ?? []);
      setLoading(false);
    })();
  }, [user, isAdmin, navigate]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Copied to clipboard' });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Invite codes
            </CardTitle>
            <CardDescription>Sign in to view your invite codes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/pricing')}>Go to Pricing</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Your invite codes
            </CardTitle>
            <CardDescription>
              Share these codes with your audience. Each code grants lifetime access. Codes never expire.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {codes.length === 0 ? (
              <p className="text-sm text-muted-foreground">You don’t have any invite codes assigned yet.</p>
            ) : (
              <ul className="space-y-3">
                {codes.map((row) => (
                  <li
                    key={row.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <span className="font-mono font-medium">{row.code}</span>
                      {row.label && (
                        <span className="ml-2 text-sm text-muted-foreground">({row.label})</span>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Used {row.used_count} time{row.used_count !== 1 ? 's' : ''}
                        {row.uses_remaining != null && ` · ${row.uses_remaining} left`}
                      </p>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => copyCode(row.code)} title="Copy">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
