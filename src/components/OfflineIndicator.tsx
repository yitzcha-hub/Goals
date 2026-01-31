import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useToast } from '@/hooks/use-toast';

export const OfflineIndicator = () => {
  const { isOnline, isSyncing, pendingCount, sync } = useOfflineStorage();
  const [show, setShow] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setShow(!isOnline || pendingCount > 0);
  }, [isOnline, pendingCount]);

  const handleSync = async () => {
    const result = await sync();
    toast({
      title: 'Sync complete',
      description: `${result.success} items synced, ${result.failed} failed`
    });
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
      <div className={`p-4 rounded-lg shadow-lg ${isOnline ? 'bg-blue-500' : 'bg-orange-500'} text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            <div>
              <p className="font-semibold">
                {isOnline ? 'Back Online' : 'Offline Mode'}
              </p>
              {pendingCount > 0 && (
                <p className="text-sm">{pendingCount} items pending sync</p>
              )}
            </div>
          </div>
          {isOnline && pendingCount > 0 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                'Sync'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
