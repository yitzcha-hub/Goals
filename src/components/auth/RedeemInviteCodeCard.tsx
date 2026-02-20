import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gift } from 'lucide-react';

interface RedeemInviteCodeCardProps {
  onSignInToRedeem: () => void;
  /** When true, show the code input and redeem button (user is logged in). */
  isAuthenticated?: boolean;
  inviteCode?: string;
  onInviteCodeChange?: (value: string) => void;
  onRedeem?: () => void;
  redeemLoading?: boolean;
  redeemError?: string | null;
  redeemSuccess?: boolean;
}

export function RedeemInviteCodeCard({
  onSignInToRedeem,
  isAuthenticated,
  inviteCode = '',
  onInviteCodeChange,
  onRedeem,
  redeemLoading = false,
  redeemError = null,
  redeemSuccess = false,
}: RedeemInviteCodeCardProps) {
  return (
    <Card className="border border-green-200 bg-white w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Gift className="h-5 w-5 text-green-600" />
          Redeem invite code
        </CardTitle>
        <CardDescription>Influencer or partner code? Enter it here for lifetime access.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!isAuthenticated ? (
          <Button variant="outline" className="w-full bg-green-50 border-green-200 text-green-800 hover:bg-green-100" onClick={onSignInToRedeem}>
            Sign in to redeem your code
          </Button>
        ) : redeemSuccess ? (
          <p className="text-sm font-medium text-green-700">Lifetime membership activated. You're all set!</p>
        ) : (
          onInviteCodeChange && onRedeem && (
            <>
              <Input
                placeholder="Enter code"
                value={inviteCode}
                onChange={(e) => onInviteCodeChange(e.target.value)}
                className="uppercase"
              />
              {redeemError && <p className="text-sm text-red-600">{redeemError}</p>}
              <Button onClick={onRedeem} disabled={redeemLoading || !inviteCode.trim()} className="w-full" variant="secondary">
                {redeemLoading ? 'Redeeming...' : 'Redeem code'}
              </Button>
            </>
          )
        )}
      </CardContent>
    </Card>
  );
}
