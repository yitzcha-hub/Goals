import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Receipt, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Invoice {
  id: string;
  amount_paid: number;
  currency: string;
  status: string;
  created: number;
  hosted_invoice_url: string;
  invoice_pdf: string;
  period_start: number;
  period_end: number;
}

const BillingHistory: React.FC = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);

  const fetchInvoices = async () => {
    try {
      // Get user's subscription to find customer ID
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user?.id)
        .single();

      if (!subscription?.stripe_customer_id) {
        setLoading(false);
        return;
      }

      // Fetch invoices from Stripe via edge function
      const { data, error } = await supabase.functions.invoke('stripe-payments', {
        body: { 
          action: 'get-invoices',
          customerId: subscription.stripe_customer_id
        }
      });

      if (error) throw error;
      setInvoices(data?.invoices || []);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { label: 'Paid', variant: 'default' as const },
      pending: { label: 'Pending', variant: 'secondary' as const },
      failed: { label: 'Failed', variant: 'destructive' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // In a real app, this would download the actual PDF from Stripe
    alert(`Downloading invoice ${invoiceId}...`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Billing History
        </CardTitle>
        <CardDescription>View and download your past invoices</CardDescription>
      </CardHeader>
      
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No billing history available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium">
                      {formatAmount(invoice.amount_paid, invoice.currency)}
                    </span>
                    {getStatusBadge(invoice.status)}
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Billed on {formatDate(invoice.created)}</span>
                    </div>
                    <div>
                      <span>
                        Period: {formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadInvoice(invoice.id)}
                  className="ml-4"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BillingHistory;