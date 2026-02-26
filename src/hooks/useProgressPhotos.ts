import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useStorageMode } from '@/contexts/StorageModeContext';

const BUCKET = 'progress-photos';
const DEMO_KEY_PHOTOS = 'goals_app_demo_progress_photos';

const IMAGE_EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
};
function getContentType(file: File): string {
  if (file.type && file.type.startsWith('image/')) return file.type;
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  return IMAGE_EXT_TO_MIME[ext] ?? 'image/jpeg';
}

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

export interface UseProgressPhotosOptions {
  /** When true, goalId is a manifestation_goals.id; use manifestation_goal_id column */
  forManifestationGoal?: boolean;
}

export function useProgressPhotos(goalId: string, options: UseProgressPhotosOptions = {}) {
  const { forManifestationGoal } = options;
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
  }, [user, goalId, useLocalStorageOnly, forManifestationGoal]);

  const loadPhotos = async () => {
    if (!user || !goalId) return;
    setLoading(true);
    try {
      const q = supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', user.id);
      const { data: rows, error } = await (forManifestationGoal
        ? q.eq('manifestation_goal_id', goalId)
        : q.eq('goal_id', goalId)
      ).order('created_at', { ascending: false });

      if (error) throw error;
      const list: ProgressPhoto[] = [];
      for (const row of rows ?? []) {
        const fp = row.file_path ?? '';
        const url = fp.startsWith('http://') || fp.startsWith('https://') ? fp : supabase.storage.from(BUCKET).getPublicUrl(fp).data.publicUrl;
        list.push({
          id: row.id,
          url,
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
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/gi, '') || 'jpg';
    const safeId = String(user.id).replace(/[^a-zA-Z0-9_-]/g, '') || user.id;
    const safeGoalId = String(goalId).replace(/[^a-zA-Z0-9_-]/g, '') || goalId;
    const filePath = [safeId, safeGoalId, `${crypto.randomUUID()}.${ext}`].filter(Boolean).join('/');
    const contentType = getContentType(file);
    const body = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, body, { upsert: false, contentType });
    if (uploadError) {
      const isBucketOrNotFound =
        uploadError.message?.includes('Bucket') ||
        uploadError.message?.includes('not found') ||
        uploadError.message?.toLowerCase().includes('bad request');
      const hint = isBucketOrNotFound
        ? ` Create the bucket "${BUCKET}" in Supabase Dashboard → Storage (public), or use "Add from URL" instead.`
        : '';
      throw new Error((uploadError.message || 'Upload failed') + hint);
    }
    const insertPayload: { user_id: string; file_path: string; caption: string; goal_id?: string; manifestation_goal_id?: string } = {
      user_id: user.id,
      file_path: filePath,
      caption,
    };
    if (forManifestationGoal) insertPayload.manifestation_goal_id = goalId;
    else insertPayload.goal_id = goalId;
    const { data: row, error } = await supabase.from('progress_photos').insert(insertPayload).select('id,created_at').single();
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
    const fp = rows?.file_path ?? '';
    if (fp && !fp.startsWith('http://') && !fp.startsWith('https://')) {
      await supabase.storage.from(BUCKET).remove([fp]);
    }
    await supabase.from('progress_photos').delete().eq('id', id);
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  /** Add a progress photo by external URL (stored in file_path). */
  const addPhotoByUrl = async (imageUrl: string, caption: string) => {
    const url = imageUrl.trim();
    if (!url) return;
    if (useLocalStorageOnly && goalId) {
      const photo: ProgressPhoto = { id: crypto.randomUUID(), url, caption, timestamp: Date.now() };
      setPhotos(prev => {
        const next = [photo, ...prev];
        setDemoPhotos(goalId, next);
        return next;
      });
      return;
    }
    if (!user || !goalId) return;
    const insertPayload: { user_id: string; file_path: string; caption: string; goal_id?: string; manifestation_goal_id?: string } = {
      user_id: user.id,
      file_path: url,
      caption,
    };
    if (forManifestationGoal) insertPayload.manifestation_goal_id = goalId;
    else insertPayload.goal_id = goalId;
    const { data: row, error } = await supabase.from('progress_photos').insert(insertPayload).select('id,created_at').single();
    if (error) throw error;
    setPhotos(prev => [{ id: row.id, url, caption, timestamp: new Date(row.created_at).getTime() }, ...prev]);
  };

  return { photos, loading, uploadPhoto, addPhotoByUrl, deletePhoto, refresh: loadPhotos };
}
