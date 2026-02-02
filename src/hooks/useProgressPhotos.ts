import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useStorageMode } from '@/contexts/StorageModeContext';

const BUCKET = 'progress-photos';
const DEMO_KEY_PHOTOS = 'goals_app_demo_progress_photos';

export interface ProgressPhoto {
  id: string;
  url: string;
  caption: string;
  timestamp: number;
}

function getDemoPhotos(goalId: string): ProgressPhoto[] {
  try {
    const raw = localStorage.getItem(DEMO_KEY_PHOTOS);
    if (!raw) return [];
    const map: Record<string, ProgressPhoto[]> = JSON.parse(raw);
    return (map[goalId] ?? []).sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

function setDemoPhotos(goalId: string, list: ProgressPhoto[]) {
  try {
    const raw = localStorage.getItem(DEMO_KEY_PHOTOS);
    const map: Record<string, ProgressPhoto[]> = raw ? JSON.parse(raw) : {};
    map[goalId] = list;
    localStorage.setItem(DEMO_KEY_PHOTOS, JSON.stringify(map));
  } catch {}
}

export function useProgressPhotos(goalId: string) {
  const { user } = useAuth();
  const { isDemoMode } = useStorageMode();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  const useLocalStorageOnly = !user && isDemoMode;

  useEffect(() => {
    if (user && goalId) {
      loadPhotos();
      return;
    }
    if (useLocalStorageOnly && goalId) {
      setLoading(true);
      setPhotos(getDemoPhotos(goalId));
      setLoading(false);
      return;
    }
    setPhotos([]);
    setLoading(false);
  }, [user, goalId, useLocalStorageOnly]);

  const loadPhotos = async () => {
    if (!user || !goalId) return;
    setLoading(true);
    try {
      const { data: rows, error } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', user.id)
        .eq('goal_id', goalId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const list: ProgressPhoto[] = [];
      for (const row of rows ?? []) {
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(row.file_path);
        list.push({
          id: row.id,
          url: urlData.publicUrl,
          caption: row.caption ?? '',
          timestamp: new Date(row.created_at).getTime()
        });
      }
      setPhotos(list);
    } catch (e) {
      console.error('Error loading progress photos:', e);
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (file: File, caption: string) => {
    if (useLocalStorageOnly && goalId) {
      const url = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const photo: ProgressPhoto = { id: crypto.randomUUID(), url, caption, timestamp: Date.now() };
      setPhotos(prev => {
        const next = [photo, ...prev];
        setDemoPhotos(goalId, next);
        return next;
      });
      return;
    }
    if (!user || !goalId) return;
    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `${user.id}/${goalId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, file, { upsert: false });
    if (uploadError) throw uploadError;
    const { data: row, error } = await supabase.from('progress_photos').insert({
      user_id: user.id,
      goal_id: goalId,
      file_path: filePath,
      caption
    }).select('id,created_at').single();
    if (error) throw error;
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    setPhotos(prev => [{ id: row.id, url: urlData.publicUrl, caption, timestamp: new Date(row.created_at).getTime() }, ...prev]);
  };

  const deletePhoto = async (id: string) => {
    if (useLocalStorageOnly && goalId) {
      setPhotos(prev => {
        const next = prev.filter(p => p.id !== id);
        setDemoPhotos(goalId, next);
        return next;
      });
      return;
    }
    const photo = photos.find(p => p.id === id);
    if (!photo) return;
    const { data: rows } = await supabase.from('progress_photos').select('file_path').eq('id', id).single();
    if (rows?.file_path) {
      await supabase.storage.from(BUCKET).remove([rows.file_path]);
    }
    await supabase.from('progress_photos').delete().eq('id', id);
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  return { photos, loading, uploadPhoto, deletePhoto, refresh: loadPhotos };
}
