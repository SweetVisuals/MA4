import { useRef, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useFiles } from '@/hooks/useFiles';
import { UnifiedFileBrowser } from '@/components/upload/upload-with-browser';
import { useToast } from '@/hooks/use-toast';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
  MenubarSeparator,
  MenubarShortcut,
} from '@/components/ui/menubar';
import { 
  Upload, 
  FolderPlus, 
  Download, 
  Trash2, 
  RefreshCw, 
  FileText, 
  Music, 
  Image, 
  Video,
  Settings,
  HelpCircle,
  Info,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/@/ui/progress';
import { FileItem } from '@/lib/types';

export default function FileManager() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<{name: string, progress: number}[]>([]);
  const MAX_UPLOAD_FILES = 10;
  
  const {
    files,
    folders,
    loading,
    error,
    createFolder,
    uploadFile,
    fetchFiles,
    fetchFolders,
    deleteFile,
    deleteFolder
  } = useFiles(user?.id || '');

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // Check if too many files are selected
    if (e.target.files.length > MAX_UPLOAD_FILES) {
      toast({
        title: "Too many files",
        description: `You can upload a maximum of ${MAX_UPLOAD_FILES} files at once`,
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Initialize uploading files array
    const filesArray = Array.from(e.target.files).map(file => ({
      name: file.name,
      progress: 0
    }));
    setUploadingFiles(filesArray);
    
    try {
      const files = Array.from(e.target.files);
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update overall progress
        setUploadProgress(Math.round((i / files.length) * 100));
        
        // Upload with individual file progress tracking
        await uploadFile(file, undefined, (progress) => {
          // Update individual file progress
          setUploadingFiles(prev => {
            const newFiles = [...prev];
            newFiles[i] = { ...newFiles[i], progress };
            return newFiles;
          });
        });
      }
      
      // Set final progress to 100%
      setUploadProgress(100);
      
      toast({
        title: "Upload complete",
        description: `Successfully uploaded ${files.length} file${files.length > 1 ? 's' : ''}`,
      });
      
      // Refresh files
      fetchFiles();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadingFiles([]);
        // Clear the input value so the same file can be uploaded again
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 1000); // Keep progress visible briefly after completion
    }
  };

  const handleNewFolder = async () => {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;
    
    const result = await createFolder(folderName);
    if (result.success) {
      toast({
        title: "Folder created",
        description: `Folder "${folderName}" was created successfully`
      });
      fetchFolders();
    } else {
      const error = result.error as string | Error | { message: string };
      const errorMessage = 
        typeof error === 'string' ? error :
        error instanceof Error ? error.message :
        error?.message || "Failed to create folder";
      toast({
        title: "Error creating folder",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleRefresh = () => {
    fetchFiles();
    fetchFolders();
    toast({
      title: "Refreshed",
      description: "File list has been refreshed"
    });
  };

  const handleDeleteSelected = async () => {
    if (!selectedFiles.length) {
      toast({
        title: "No files selected",
        description: "Please select files to delete",
        variant: "destructive"
      });
      return;
    }
    
    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedFiles.length} item(s)?`);
    if (!confirmDelete) return;
    
    try {
      for (const file of selectedFiles) {
        if (file.type === 'folder') {
          await deleteFolder(file.id);
        } else {
          await deleteFile(file.id, file.file_path || '');
        }
      }
      
      toast({
        title: "Deleted successfully",
        description: `${selectedFiles.length} item(s) have been deleted`
      });
      
      setSelectedFiles([]);
      fetchFiles();
      fetchFolders();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete items",
        variant: "destructive"
      });
    }
  };

  const handleDownloadSelected = () => {
    if (!selectedFiles.length) {
      toast({
        title: "No files selected",
        description: "Please select files to download",
        variant: "destructive"
      });
      return;
    }
    
    // Only download files, not folders
    const filesToDownload = selectedFiles.filter(file => file.type !== 'folder');
    
    if (!filesToDownload.length) {
      toast({
        title: "No downloadable files",
        description: "Selected items are folders which cannot be downloaded directly",
        variant: "destructive"
      });
      return;
    }
    
    // Download each file
    filesToDownload.forEach(file => {
      if (!file.audio_url) return;
      
      const link = document.createElement('a');
      link.href = file.audio_url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    
    toast({
      title: "Download started",
      description: `Downloading ${filesToDownload.length} file(s)`
    });
  };

  return (
    <div className="flex flex-col h-full">
      <Menubar className="rounded-none border-b border-t-0 border-x-0">
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={handleUploadClick}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
              <MenubarShortcut>⌘U</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={handleNewFolder}>
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
              <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
              <MenubarShortcut>⌘R</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={handleDownloadSelected}>
              <Download className="h-4 w-4 mr-2" />
              Download Selected
            </MenubarItem>
            <MenubarItem onClick={handleDeleteSelected} className="text-red-500">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
              <MenubarShortcut>⌫</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              <FileText className="h-4 w-4 mr-2" />
              All Files
            </MenubarItem>
            <MenubarItem>
              <Music className="h-4 w-4 mr-2" />
              Audio Files
            </MenubarItem>
            <MenubarItem>
              <Image className="h-4 w-4 mr-2" />
              Images
            </MenubarItem>
            <MenubarItem>
              <Video className="h-4 w-4 mr-2" />
              Videos
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        
        <MenubarMenu>
          <MenubarTrigger>Tools</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        
        <MenubarMenu>
          <MenubarTrigger>Help</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setShowHelpDialog(true)}>
              <HelpCircle className="h-4 w-4 mr-2" />
              Help & Documentation
            </MenubarItem>
            <MenubarItem onClick={() => setShowAboutDialog(true)}>
              <Info className="h-4 w-4 mr-2" />
              About
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        multiple
        accept="audio/*,.mp3,.wav,.aiff,.flac,.ogg,.aac"
      />

      {isUploading && (
        <div className="p-4 bg-muted/20 border-b">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Uploading files...</span>
              {uploadingFiles.length > 1 && (
                <span className="text-xs text-muted-foreground">
                  ({uploadingFiles.length} files)
                </span>
              )}
            </div>
            <span className="text-sm">{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
          
          {/* Individual file progress */}
          {uploadingFiles.length > 1 && (
            <div className="mt-4 max-w-3xl">
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {uploadingFiles.map((file, index) => (
                  <div key={index} className="text-left">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="truncate max-w-[80%]">{file.name}</span>
                      <span>{Math.round(file.progress)}%</span>
                    </div>
                    <Progress 
                      value={file.progress} 
                      className="h-1 bg-muted/50" 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <UnifiedFileBrowser 
          files={files}
          folders={folders}
          onUpload={handleUploadClick}
          onCreateFolder={handleNewFolder}
          uploadFile={async (file, folderId, onProgress) => {
            try {
              const result = await uploadFile(file, folderId, onProgress);
              return { success: true };
            } catch (error) {
              console.error('Upload error:', error);
              return { success: false };
            }
          }}
        />
      </div>

      {/* Help Dialog */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Help & Documentation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <h3 className="font-medium text-lg">File Browser Features</h3>
            <div className="space-y-2">
              <p className="text-sm"><strong>Uploading Files:</strong> Drag and drop files into the upload area or click "Upload Files" button. Maximum {MAX_UPLOAD_FILES} files at once.</p>
              <p className="text-sm"><strong>Creating Folders:</strong> Click "New Folder" button to create a new folder.</p>
              <p className="text-sm"><strong>Navigating:</strong> Click on folders in the sidebar to navigate between folders.</p>
              <p className="text-sm"><strong>File Operations:</strong> Right-click or use the menu button on files/folders for options like rename, delete, etc.</p>
              <p className="text-sm"><strong>Moving Files:</strong> Drag and drop files/folders to move them between folders.</p>
              <p className="text-sm"><strong>Keyboard Shortcuts:</strong> Use ⌘U for upload, ⌘N for new folder, ⌘R to refresh.</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowHelpDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* About Dialog */}
      <Dialog open={showAboutDialog} onOpenChange={setShowAboutDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>About TuneFlow File Manager</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm">TuneFlow File Manager is a powerful tool for managing your audio files and projects.</p>
            <p className="text-sm">Version: 1.0.0</p>
            <p className="text-sm">© 2025 TuneFlow. All rights reserved.</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowAboutDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}