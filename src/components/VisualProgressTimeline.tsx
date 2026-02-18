import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, TrendingUp, X, Tag, Image as ImageIcon, Sparkles, Brain } from 'lucide-react';
import { analyzeProgressImage, AIAnalysisResult } from '@/lib/aiImageAnalysis';

export interface TaggedImage {
  id: string;
  url: string;
  date: string;
  progress: number;
  label?: string;
  aiAnalysis?: AIAnalysisResult;
}


interface VisualProgressTimelineProps {
  images: TaggedImage[];
  onAddImage: (image: TaggedImage) => void;
  onRemoveImage: (id: string) => void;
  currentProgress: number;
  goalType?: string;
  /** When true, render without outer Card and with a smaller "Progress photos" heading (for embedding in another section) */
  embedded?: boolean;
}


export default function VisualProgressTimeline({ 
  images, 
  onAddImage, 
  onRemoveImage,
  currentProgress,
  goalType = 'General Goal',
  embedded = false,
}: VisualProgressTimelineProps) {

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadProgress, setUploadProgress] = useState(currentProgress);
  const [uploadLabel, setUploadLabel] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const sortedImages = [...images].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (previewUrl) {
      // Run AI analysis on the image
      const previousImages = sortedImages.map(img => ({
        url: img.url,
        progress: img.progress
      }));
      
      const aiAnalysis = analyzeProgressImage(
        previewUrl,
        uploadProgress,
        goalType,
        previousImages
      );

      onAddImage({
        id: Date.now().toString(),
        url: previewUrl,
        date: uploadDate,
        progress: uploadProgress,
        label: uploadLabel || undefined,
        aiAnalysis
      });
      setShowUploadDialog(false);
      setPreviewUrl('');
      setUploadLabel('');
      setUploadProgress(currentProgress);
    }
  };


  const getMilestoneLabel = (progress: number) => {
    if (progress === 0) return 'Start';
    if (progress === 100) return 'Complete';
    if (progress >= 75) return 'Almost There';
    if (progress >= 50) return 'Halfway';
    if (progress >= 25) return 'Getting Started';
    return 'In Progress';
  };

  const content = (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className={embedded ? 'text-lg font-semibold flex items-center gap-2' : 'text-xl font-bold flex items-center gap-2'}>
          <ImageIcon className="h-5 w-5" />
          {embedded ? 'Progress photos' : 'Visual Progress Timeline'}
        </h2>
        <Button onClick={() => setShowUploadDialog(true)} size="sm">
          <ImageIcon className="h-4 w-4 mr-2" />
          Add Photo
        </Button>
      </div>

      {sortedImages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No progress photos yet</p>
          <p className="text-sm">Upload photos to visualize your journey</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-200 via-blue-200 to-green-200" />
          
          <div className="space-y-8">
            {sortedImages.map((img, idx) => (
              <div key={img.id} className="relative flex gap-4">
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-white border-4 border-purple-500 flex items-center justify-center">
                    <span className="text-lg font-bold text-purple-600">{img.progress}%</span>
                  </div>
                </div>
                
                <Card className="flex-1 p-4 hover:shadow-lg transition-shadow">
                  <div className="flex gap-4">
                    <div className="relative group">
                      <img 
                        src={img.url} 
                        alt={`Progress at ${img.progress}%`}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onRemoveImage(img.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Badge variant={img.progress === 100 ? 'default' : 'secondary'}>
                            {img.label || getMilestoneLabel(img.progress)}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(img.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 mb-3">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${img.progress}%` }}
                          />
                        </div>
                      </div>

                      {img.aiAnalysis && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-semibold text-purple-600">
                            <Brain className="h-3 w-3" />
                            <span>AI Analysis</span>
                            <Sparkles className="h-3 w-3" />
                          </div>
                          
                          {img.aiAnalysis.insights.map((insight, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm bg-purple-50 p-2 rounded">
                              <span className="text-lg">{insight.icon}</span>
                              <div className="flex-1">
                                <p className="text-gray-700">{insight.message}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Confidence: {Math.round(insight.confidence * 100)}%
                                </p>
                              </div>
                            </div>
                          ))}

                          {img.aiAnalysis.detectedChanges.length > 0 && (
                            <div className="text-xs text-gray-600 mt-2">
                              <span className="font-semibold">Detected: </span>
                              {img.aiAnalysis.detectedChanges.join(', ')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

            ))}
          </div>
        </div>
      )}

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Progress Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="photo">Upload Photo</Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
              />
              {previewUrl && (
                <img src={previewUrl} alt="Preview" className="mt-2 w-full h-48 object-cover rounded-lg" />
              )}
            </div>
            
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={uploadDate}
                onChange={(e) => setUploadDate(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="progress">Progress Milestone (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={uploadProgress}
                onChange={(e) => setUploadProgress(Number(e.target.value))}
              />
            </div>
            
            <div>
              <Label htmlFor="label">Label (Optional)</Label>
              <Input
                id="label"
                placeholder="e.g., Before, Week 1, Halfway Point"
                value={uploadLabel}
                onChange={(e) => setUploadLabel(e.target.value)}
              />
            </div>
            
            <Button onClick={handleUpload} className="w-full" disabled={!previewUrl}>
              Add to Timeline
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );

  return embedded ? <div className="mt-4">{content}</div> : <Card className="p-6">{content}</Card>;
}
