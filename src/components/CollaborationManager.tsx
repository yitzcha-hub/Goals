import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CollaboratorInviteDialog } from './CollaboratorInviteDialog';
import { CollaboratorList } from './CollaboratorList';
import { SharedActivityFeed } from './SharedActivityFeed';
import { SharedComments } from './SharedComments';
import { TaskAssignment } from './TaskAssignment';
import { VideoCallRoom } from './VideoCallRoom';
import { SharedWhiteboard } from './SharedWhiteboard';
import { TeamAnalyticsDashboard } from './TeamAnalyticsDashboard';
import { RealTimeChatPanel } from './RealTimeChatPanel';
import { useCollaboration } from '@/hooks/useCollaboration';
import { UserPlus, Users, Activity, MessageCircle, CheckSquare, Video, PenTool, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';


interface CollaborationManagerProps {
  goalId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CollaborationManager = ({ goalId, open, onOpenChange }: CollaborationManagerProps) => {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const { collaborators, activities, userRole, inviteCollaborator, updateRole, removeCollaborator } = useCollaboration(goalId);


  const handleInvite = async (email: string, role: 'editor' | 'viewer') => {
    return await inviteCollaborator(email, role);
  };

  const handleUpdateRole = async (collaboratorId: string, newRole: string) => {
    const success = await updateRole(collaboratorId, newRole);
    if (success) {
      toast.success('Role updated successfully');
    } else {
      toast.error('Failed to update role');
    }
  };

  const handleRemove = async (collaboratorId: string) => {
    const success = await removeCollaborator(collaboratorId);
    if (success) {
      toast.success('Collaborator removed');
    } else {
      toast.error('Failed to remove collaborator');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Collaborators</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="collaborators" className="w-full">
            <TabsList className="grid w-full grid-cols-7 text-xs">
              <TabsTrigger value="collaborators"><Users className="h-3 w-3" /></TabsTrigger>
              <TabsTrigger value="chat"><MessageCircle className="h-3 w-3" /></TabsTrigger>
              <TabsTrigger value="video"><Video className="h-3 w-3" /></TabsTrigger>
              <TabsTrigger value="whiteboard"><PenTool className="h-3 w-3" /></TabsTrigger>
              <TabsTrigger value="tasks"><CheckSquare className="h-3 w-3" /></TabsTrigger>
              <TabsTrigger value="analytics"><BarChart3 className="h-3 w-3" /></TabsTrigger>
              <TabsTrigger value="activity"><Activity className="h-3 w-3" /></TabsTrigger>
            </TabsList>


            <TabsContent value="collaborators" className="space-y-4">
              {(userRole === 'owner' || userRole === 'leader') && (
                <Button onClick={() => setInviteOpen(true)} className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Collaborator
                </Button>
              )}
              <CollaboratorList
                collaborators={collaborators}
                userRole={userRole}
                onUpdateRole={handleUpdateRole}
                onRemove={handleRemove}
              />
            </TabsContent>

            
            <TabsContent value="chat">
              <RealTimeChatPanel goalId={goalId} />
            </TabsContent>
            
            <TabsContent value="video">
              {showVideoCall ? (
                <VideoCallRoom goalId={goalId} onClose={() => setShowVideoCall(false)} />
              ) : (
                <div className="text-center py-8">
                  <Button onClick={() => setShowVideoCall(true)}>
                    <Video className="h-4 w-4 mr-2" />
                    Start Video Call
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="whiteboard">
              <SharedWhiteboard goalId={goalId} />
            </TabsContent>
            
            <TabsContent value="tasks">
              <TaskAssignment goalId={goalId} collaborators={collaborators} />
            </TabsContent>
            
            <TabsContent value="analytics">
              <TeamAnalyticsDashboard goalId={goalId} />
            </TabsContent>
            
            <TabsContent value="activity">
              <SharedActivityFeed activities={activities} />
            </TabsContent>


          </Tabs>
        </DialogContent>
      </Dialog>
      <CollaboratorInviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvite={handleInvite}
      />
    </>
  );
};
