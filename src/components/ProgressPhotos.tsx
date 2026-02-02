import { useState } from 'react';
import { Camera, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProgressPhotos } from '@/hooks/useProgressPhotos';
import { useToast } from '@/hooks/use-toast';

interface ProgressPhotosProps {
  goalId: string;
}

export const ProgressPhotos = ({ goalId }: ProgressPhotosProps) => {
  const { photos, loading, uploadPhoto, deletePhoto } = useProgressPhotos(goalId);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 5MB', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      await uploadPhoto(file, caption);
      setCaption('');
      toast({ title: 'Photo uploaded!', description: 'Progress photo saved to your account' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Upload failed', description: 'Please try again', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePhoto(id);
      toast({ title: 'Photo removed' });
    } catch (err) {
      toast({ title: 'Failed to remove photo', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg"
        />
        <label className="cursor-pointer">
          <Button type="button" asChild disabled={uploading}>
            <span>
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
              Upload
            </span>
          </Button>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <Card key={photo.id} className="relative group overflow-hidden">
            <img src={photo.url} alt={photo.caption} className="w-full h-48 object-cover" />
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
              onClick={() => handleDelete(photo.id)}
            >
              <X className="w-4 h-4" />
            </Button>
            {photo.caption && (
              <div className="p-2 bg-black/50 text-white text-sm">{photo.caption}</div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
