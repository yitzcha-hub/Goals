import { useState } from 'react';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { savePhoto, getPhoto } from '@/lib/indexedDB';
import { useToast } from '@/hooks/use-toast';

interface ProgressPhoto {
  id: string;
  url: string;
  caption: string;
  timestamp: number;
}

export const ProgressPhotos = ({ goalId }: { goalId: string }) => {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [caption, setCaption] = useState('');
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 5MB', variant: 'destructive' });
      return;
    }

    const id = crypto.randomUUID();
    await savePhoto(id, file);
    
    const url = URL.createObjectURL(file);
    const newPhoto: ProgressPhoto = { id, url, caption, timestamp: Date.now() };
    setPhotos([newPhoto, ...photos]);
    setCaption('');
    toast({ title: 'Photo uploaded!', description: 'Progress photo saved' });
  };

  const deletePhoto = (id: string) => {
    setPhotos(photos.filter(p => p.id !== id));
  };

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
          <Button type="button" asChild>
            <span>
              <Camera className="w-4 h-4 mr-2" />
              Upload
            </span>
          </Button>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
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
              onClick={() => deletePhoto(photo.id)}
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
