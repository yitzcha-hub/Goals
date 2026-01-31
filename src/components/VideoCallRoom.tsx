import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Video, VideoOff, Mic, MicOff, Phone, Users } from 'lucide-react';
import { toast } from 'sonner';

interface VideoCallRoomProps {
  goalId: string;
  onClose: () => void;
}

export const VideoCallRoom = ({ goalId, onClose }: VideoCallRoomProps) => {
  const { user } = useAuth();
  const [callId, setCallId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [roomId, setRoomId] = useState('');

  useEffect(() => {
    startCall();
    return () => endCall();
  }, []);

  const startCall = async () => {
    const newRoomId = `room-${Date.now()}`;
    const { data, error } = await supabase
      .from('video_calls')
      .insert({
        goal_id: goalId,
        room_id: newRoomId,
        host_id: user?.id,
        status: 'active'
      })
      .select()
      .single();

    if (data) {
      setCallId(data.id);
      setRoomId(newRoomId);
      joinCall(data.id);
      toast.success('Video call started');
    }
  };

  const joinCall = async (id: string) => {
    await supabase.from('video_call_participants').insert({
      call_id: id,
      user_id: user?.id
    });
    fetchParticipants(id);
  };

  const fetchParticipants = async (id: string) => {
    const { data } = await supabase
      .from('video_call_participants')
      .select('*')
      .eq('call_id', id)
      .is('left_at', null);
    setParticipants(data || []);
  };

  const endCall = async () => {
    if (callId) {
      await supabase
        .from('video_calls')
        .update({ status: 'ended', ended_at: new Date().toISOString() })
        .eq('id', callId);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Video Call</CardTitle>
          <Badge variant="secondary">
            <Users className="h-3 w-3 mr-1" />
            {participants.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
          <p className="text-white">Video Stream: {roomId}</p>
        </div>
        <div className="flex justify-center gap-4">
          <Button
            variant={isVideoOn ? "default" : "destructive"}
            size="icon"
            onClick={() => setIsVideoOn(!isVideoOn)}
          >
            {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>
          <Button
            variant={isAudioOn ? "default" : "destructive"}
            size="icon"
            onClick={() => setIsAudioOn(!isAudioOn)}
          >
            {isAudioOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          <Button variant="destructive" size="icon" onClick={onClose}>
            <Phone className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
