import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/@/ui/dialog';
import { useCallback, useState, useMemo, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/@/ui/button';
import { Upload, X, FileEdit, Image, Camera } from 'lucide-react';
import { Progress } from '@/components/@/ui/progress';
import { Input } from '@/components/@/ui/input';
import { ScrollArea } from '@/components/@/ui/scroll-area';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export interface FileWithMetadata extends File {
  id: string;
  path: string;
  name: string;
  metadata: {
    title?: string;
    artist?: string;
    album?: string;
    genre?: string;
  };
}

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: FileWithMetadata[]) => Promise<void>;
  type?: 'avatar' | 'banner';
}

export const UploadDialog = ({ open, onOpenChange, onUpload, type }: UploadDialogProps) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Only allow one file for avatar/banner uploads
    const filesToUse = acceptedFiles.slice(0, 1);
    
    const newFiles = filesToUse.map(file => ({
      ...file,
      id: Math.random().toString(36).substring(2, 9),
      path: '',
      name: file.name,
      metadata: {
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: '',
        album: '',
        genre: ''
      }
    }));

    setFiles(newFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleUpload = async () => {
    if (!user) {
      toast.error('You must be logged in to upload files');
      return;
    }
    
    if (files.length === 0) {
      toast.error('Please select a file to upload');
      return;
    }
    
    setIsUploading(true);
    setProgress({});
    
    try {
      // Upload each file to Supabase Storage
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = uuidv4();
        const fileExt = file.name.split('.').pop();
        const folderName = type === 'avatar' ? 'avatars' : 'banners';
        const filePath = `${user.id}/${fileId}.${fileExt}`;
        
        // Update progress
        const progressTracker: Record<string, number> = {};
        progressTracker[file.id] = 0;
        
        // Simulate progress updates
        const interval = setInterval(() => {
          progressTracker[file.id] = Math.min(progressTracker[file.id] + 10, 100);
          setProgress({...progressTracker});
          if (progressTracker[file.id] === 100) {
            clearInterval(interval);
          }
        }, 100);
        
        // Upload to Supabase Storage
        const { error: uploadError, data } = await supabase.storage
          .from(folderName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(folderName)
          .getPublicUrl(filePath);
        
        // Update profile with new image URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            [type === 'avatar' ? 'profile_url' : 'banner_url']: publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
        
        if (updateError) throw updateError;
      }
      
      // Call the onUpload callback
      await onUpload(files);
      
      toast.success(`${type === 'avatar' ? 'Profile picture' : 'Banner'} uploaded successfully`);
      onOpenChange(false);
      setFiles([]);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'avatar' ? 'Upload Profile Picture' : 'Upload Banner Image'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div 
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            {files.length > 0 ? (
              <div className="space-y-4">
                {files.map(file => (
                  <div key={file.id} className="relative">
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt="Preview" 
                      className={`mx-auto ${type === 'avatar' ? 'h-32 w-32 rounded-full object-cover' : 'w-full h-40 object-cover rounded-md'}`}
                    />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-0 right-0 h-6 w-6 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFiles([]);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {type === 'avatar' ? (
                  <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                ) : (
                  <Image className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                )}
                <p className="text-sm text-muted-foreground">
                  Drag and drop an image here, or click to select
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {type === 'avatar' 
                    ? 'Recommended: Square image, at least 400x400px' 
                    : 'Recommended: 1200x400px for best results'}
                </p>
              </>
            )}
          </div>
          
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{Object.values(progress)[0] || 0}%</span>
              </div>
              <Progress value={Object.values(progress)[0] || 0} className="h-2" />
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                onOpenChange(false);
                setFiles([]);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};