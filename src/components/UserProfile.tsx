import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Mail, Calendar, Shield } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      toast({
        title: 'Success',
        description: 'Signed out successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  if (!user) return null;

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-lg">
              {getInitials(user.email || '')}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>Manage your account settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Member Since</p>
              <p className="text-sm text-gray-600">
                {formatDate(user.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Status</p>
              <Badge variant="default">
                Active
              </Badge>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={handleSignOut}
            variant="destructive"
            className="w-full"
            disabled={loading}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {loading ? 'Signing Out...' : 'Sign Out'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};