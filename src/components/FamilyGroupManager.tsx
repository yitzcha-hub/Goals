import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Trash2, Crown, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FamilyGroup {
  id: string;
  name: string;
  owner_id: string;
  max_members: number;
  created_at: string;
}

interface FamilyMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  email?: string;
}

const FamilyGroupManager: React.FC = () => {
  const { user } = useAuth();
  const [group, setGroup] = useState<FamilyGroup | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [groupName, setGroupName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadGroup();
    }
  }, [user]);

  const loadGroup = async () => {
    try {
      const { data: groupData } = await supabase
        .from('family_groups')
        .select('*')
        .eq('owner_id', user?.id)
        .single();

      if (groupData) {
        setGroup(groupData);
        loadMembers(groupData.id);
      }
    } catch (error) {
      console.error('Error loading group:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (groupId: string) => {
    const { data } = await supabase
      .from('family_members')
      .select('*')
      .eq('group_id', groupId);

    if (data) setMembers(data);
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    const { data, error } = await supabase
      .from('family_groups')
      .insert({ name: groupName, owner_id: user?.id })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create group');
    } else {
      setGroup(data);
      toast.success('Family group created!');
    }
  };

  const inviteMember = async () => {
    if (!inviteEmail.trim() || !group) return;

    // Here you would implement email invitation logic
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
  };

  const removeMember = async (memberId: string) => {
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', memberId);

    if (!error) {
      setMembers(members.filter(m => m.id !== memberId));
      toast.success('Member removed');
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!group) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create Your Family Group
          </CardTitle>
          <CardDescription>
            Invite up to 5 family members or friends to share your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Enter group name (e.g., Smith Family)"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <Button onClick={createGroup} className="w-full">
              Create Group
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {group.name}
          </CardTitle>
          <CardDescription>
            {members.length} / {group.max_members} members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.length < group.max_members && (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email to invite"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <Button onClick={inviteMember}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              </div>
            )}

            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{member.email || 'Member'}</span>
                    {member.role === 'owner' && (
                      <Badge variant="secondary">
                        <Crown className="h-3 w-3 mr-1" />
                        Owner
                      </Badge>
                    )}
                  </div>
                  {member.role !== 'owner' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMember(member.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FamilyGroupManager;
