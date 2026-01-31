import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Crown, Edit, Eye, Trash2 } from 'lucide-react';
import { Collaborator } from '@/hooks/useCollaboration';

interface CollaboratorListProps {
  collaborators: Collaborator[];
  userRole: string;
  onUpdateRole: (collaboratorId: string, newRole: string) => void;
  onRemove: (collaboratorId: string) => void;
}

export const CollaboratorList = ({ collaborators, userRole, onUpdateRole, onRemove }: CollaboratorListProps) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'leader': return <Crown className="h-4 w-4 text-blue-500" />;
      case 'editor': return <Edit className="h-4 w-4 text-green-500" />;
      case 'viewer': return <Eye className="h-4 w-4 text-gray-500" />;
      default: return null;
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: any = { owner: 'default', leader: 'default', editor: 'secondary', viewer: 'outline' };
    return <Badge variant={variants[role]}>{role}</Badge>;
  };

  const canManageRole = (targetRole: string) => {
    if (userRole === 'owner') return targetRole !== 'owner';
    if (userRole === 'leader') return targetRole === 'editor' || targetRole === 'viewer';
    return false;
  };


  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Users className="h-4 w-4" />
        Collaborators ({collaborators.length})
      </div>
      {collaborators.map((collab) => (
        <div key={collab.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{collab.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium">{collab.email || 'User'}</div>
              <div className="flex items-center gap-2 mt-1">
                {getRoleIcon(collab.role)}
                {getRoleBadge(collab.role)}
              </div>
            </div>
          </div>
          {canManageRole(collab.role) && (
            <div className="flex items-center gap-2">
              <Select value={collab.role} onValueChange={(v) => onUpdateRole(collab.id, v)}>
                <SelectTrigger className="w-28 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userRole === 'owner' && <SelectItem value="leader">Leader</SelectItem>}
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" onClick={() => onRemove(collab.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          )}

        </div>
      ))}
    </div>
  );
};
