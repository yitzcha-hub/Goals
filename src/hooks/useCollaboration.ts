import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface Collaborator {
  id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  invited_at: string;
  accepted_at?: string;
  email?: string;
  name?: string;
}

export interface Activity {
  id: string;
  user_id: string;
  action_type: string;
  action_details: any;
  created_at: string;
  user_email?: string;
}

export const useCollaboration = (goalId: string) => {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userRole, setUserRole] = useState<string>('viewer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!goalId || !user) return;
    
    fetchCollaborators();
    fetchActivities();
    subscribeToChanges();
  }, [goalId, user]);

  const fetchCollaborators = async () => {
    const { data, error } = await supabase
      .from('goal_collaborators')
      .select('*')
      .eq('goal_id', goalId);
    
    if (!error && data) {
      setCollaborators(data);
      const myRole = data.find(c => c.user_id === user?.id)?.role || 'viewer';
      setUserRole(myRole);
    } else {
      setCollaborators([]);
    }
    setLoading(false);
  };


  const fetchActivities = async () => {
    const { data } = await supabase
      .from('goal_activity')
      .select('*')
      .eq('goal_id', goalId)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data) setActivities(data);
    else setActivities([]);
  };


  const subscribeToChanges = () => {
    const channel = supabase
      .channel(`goal-${goalId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'goal_collaborators', filter: `goal_id=eq.${goalId}` },
        () => fetchCollaborators()
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'goal_activity', filter: `goal_id=eq.${goalId}` },
        () => fetchActivities()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  const inviteCollaborator = async (email: string, role: 'editor' | 'viewer') => {
    const { error } = await supabase.from('goal_invitations').insert({
      goal_id: goalId,
      inviter_id: user?.id,
      invitee_email: email,
      role
    });
    return !error;
  };

  const updateRole = async (collaboratorId: string, newRole: string) => {
    const { error } = await supabase
      .from('goal_collaborators')
      .update({ role: newRole })
      .eq('id', collaboratorId);
    return !error;
  };

  const removeCollaborator = async (collaboratorId: string) => {
    const { error } = await supabase
      .from('goal_collaborators')
      .delete()
      .eq('id', collaboratorId);
    return !error;
  };

  const logActivity = async (actionType: string, details: any) => {
    await supabase.from('goal_activity').insert({
      goal_id: goalId,
      user_id: user?.id,
      action_type: actionType,
      action_details: details
    });
  };

  return {
    collaborators,
    activities,
    userRole,
    loading,
    inviteCollaborator,
    updateRole,
    removeCollaborator,
    logActivity
  };
};
