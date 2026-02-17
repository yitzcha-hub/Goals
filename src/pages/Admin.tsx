import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { TrialAnalyticsDashboard } from "@/components/TrialAnalyticsDashboard";
import { InviteCodesManager } from "@/components/InviteCodesManager";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      // Check if user is admin (you can customize this logic)
      // For now, checking if user email contains 'admin' or matches specific emails
      const adminEmails = ['admin@example.com']; // Add your admin emails here
      const isUserAdmin = user.email?.includes('admin') || adminEmails.includes(user.email || '');
      
      setIsAdmin(isUserAdmin);
      setLoading(false);

      if (!isUserAdmin) {
        navigate('/');
      }
    };

    checkAdminAccess();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <TrialAnalyticsDashboard />

        <section id="invite-codes" className="mt-10 scroll-mt-8">
          <InviteCodesManager />
        </section>
      </div>
    </div>
  );
}
