import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/auth-context';
import { 
  Search,
  Upload,
  FolderPlus,
  Folder,
  ChevronRight,
  ChevronDown,
  FileIcon,
  Trash2,
  Edit,
  Star,
  Download,
  MoreHorizontal,
  AlertCircle
} from 'lucide-react';
import { Button } from '../@/ui/button';
import { Input } from '../@/ui/input';
import { Separator } from '../@/ui/separator';
import { cn } from '../@/lib/utils';
import { useToast } from '../../hooks/use-toast';
import { useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../@/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../@/ui/dropdown-menu';
import { Progress } from '../@/ui/progress';
import { FileItem } from '@/lib/types';

interface UnifiedFileBrowserProps {
  initialFiles?: FileItem[];
}

export function UnifiedFileBrowser({ 
  initialFiles
}: UnifiedFileBrowserProps) {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileItem[]>(initialFiles || []);
  const [folders, setFolders] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<{name: string, progress: number}[]>([]);
  const MAX_UPLOAD_FILES = 10;

  // Load folders from database on mount
  useEffect(() => {
    if (!user?.id) return;
    
    const loadFolders = async () => {
      try {
        const { data, error } = await supabase
          .from('folders')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        setFolders(data || []);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load folders",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadFolders();
  }, [user?.id]);

  // Filter files based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFiles(files);
      return;
    }

    const filtered = files.filter(file => 
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredFiles(filtered);
  }, [files, searchQuery]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, name: string, isFolder: boolean, filePath?: string} | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [itemToRename, setItemToRename] = useState<{id: string, name: string, isFolder: boolean} | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { toast } = useToast();

  const handleNewFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Folder name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Create new folder object for database
      const newFolder = {
        id: uuidv4(),
        name: newFolderName.trim(),
        user_id: user?.id,
        parent_id: selectedFolder || null
      };
      
      // Save to database
      const { data, error } = await supabase
        .from('folders')
        .insert(newFolder)
        .select()
        .single();
      
      if (error) throw error;
      
      // Create UI folder object
      const uiFolder: FileItem = {
        id: data.id,
        name: newFolderName.trim(),
        type: 'folder',
        modified: new Date().toISOString().split('T')[0],
        children: []
      };
      
      // Update local folders state
      setFolders(prev => [...prev, uiFolder]);
      setNewFolderName('');
      setShowNewFolderDialog(false);
      
      toast({
        title: "Folder created",
        description: `Folder "${newFolderName.trim()}" was created successfully`,
      });
    } catch (error) {
      console.error('Folder creation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create folder",
        variant: "destructive"
      });
    }
  };

  const handleRenameItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newFileName.trim() || !itemToRename) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (itemToRename.isFolder) {
        // Rename folder in database
        const { error } = await supabase
          .from('folders')
          .update({ name: newFileName.trim() })
          .eq('id', itemToRename.id);
        
        if (error) throw error;
        
        // Update local state
        setFolders(prev => {
          const updateFolderName = (items: FileItem[]): FileItem[] => {
            return items.map(folder => {
              if (folder.id === itemToRename.id) {
                return { ...folder, name: newFileName.trim() };
              }
              if (folder.children) {
                return {
                  ...folder,
                  children: updateFolderName(folder.children)
                };
              }
              return folder;
            });
          };
          
          return updateFolderName(prev);
        });
      } else {
        // Rename file in database
        const { error } = await supabase
          .from('files')
          .update({ name: newFileName.trim() })
          .eq('id', itemToRename.id);
        
        if (error) throw error;
        
        // Update local state
        setFilteredFiles(prev => 
          prev.map(file => 
            file.id === itemToRename.id 
              ? { ...file, name: newFileName.trim() } 
              : file
          )
        );
      }
      
      setShowRenameDialog(false);
      setItemToRename(null);
      setNewFileName('');
      
      toast({
        title: "Renamed successfully",
        description: `Item renamed to "${newFileName.trim()}"`,
      });
    } catch (error) {
      console.error('Rename error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to rename item",
        variant: "destructive"
      });
    }
  };
  
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };
  
  const selectFolder = (folderId: string | null) => {
    setSelectedFolder(folderId);
    setSelectedItems([]);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async () => {
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) return;
    
    // Check if too many files are selected
    if (files.length > MAX_UPLOAD_FILES) {
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
    const filesArray = Array.from(files).map(file => ({
      name: file.name,
      progress: 0
    }));
    setUploadingFiles(filesArray);

    try {
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update overall progress
        setUploadProgress(Math.round((i / files.length) * 100));
        
        // Upload the file with progress tracking
        await uploadFile(file, selectedFolder || undefined, (progress) => {
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
      
      // Refresh the file list
      fetchFiles();
    } catch (error) {
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
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 1000); // Keep progress visible briefly after completion
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;
    
    // Check if too many files are dropped
    if (droppedFiles.length > MAX_UPLOAD_FILES) {
      toast({
        title: "Too many files",
        description: `You can upload a maximum of ${MAX_UPLOAD_FILES} files at once`,
        variant: "destructive"
      });
      return;
    }
    
    // Set the files to the file input and trigger upload
    if (fileInputRef.current) {
      // Note: This is a hack as we can't directly set files property
      // Create a DataTransfer object to set files
      const dataTransfer = new DataTransfer();
      for (let i = 0; i < droppedFiles.length; i++) {
        dataTransfer.items.add(droppedFiles[i]);
      }
      fileInputRef.current.files = dataTransfer.files;
      handleFileUpload();
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    
    try {
      if (itemToDelete.isFolder) {
        // Delete folder from database
        const { error } = await supabase
          .from('folders')
          .delete()
          .eq('id', itemToDelete.id);
        
        if (error) throw error;
        
        // Update local state
        setFolders(prev => {
          const removeFolderFromTree = (items: FileItem[]): FileItem[] => {
            return items.filter(item => {
              if (item.id === itemToDelete.id) return false;
              if (item.children) {
                item.children = removeFolderFromTree(item.children);
              }
              return true;
            });
          };
          
          return removeFolderFromTree(prev);
        });
      } else {
        // Delete file from storage if path exists
        if (itemToDelete.filePath) {
          const { error: storageError } = await supabase.storage
            .from('audio_files')
            .remove([itemToDelete.filePath]);
          
          if (storageError) throw storageError;
        }
        
        // Delete file from database
        const { error } = await supabase
          .from('files')
          .delete()
          .eq('id', itemToDelete.id);
        
        if (error) throw error;
        
        // Update local state
        setFilteredFiles(prev => prev.filter(file => file.id !== itemToDelete.id));
        setFiles(prev => prev.filter(file => file.id !== itemToDelete.id));
      }
      
      toast({
        title: "Deleted successfully",
        description: `${itemToDelete.isFolder ? 'Folder' : 'File'} has been deleted`,
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete item",
        variant: "destructive"
      });
    } finally {
      setShowDeleteConfirmDialog(false);
      setItemToDelete(null);
    }
  };

  const handleToggleStar = async (id: string, isFolder: boolean, currentStarred: boolean) => {
    try {
      if (isFolder) {
        const { error } = await supabase
          .from('folders')
          .update({ starred: !currentStarred })
          .eq('id', id);
        
        if (error) throw error;
        
        // Update local state
        setFolders(prev => {
          const updateFolderStar = (items: FileItem[]): FileItem[] => {
            return items.map(folder => {
              if (folder.id === id) {
                return { ...folder, starred: !currentStarred };
              }
              if (folder.children) {
                return {
                  ...folder,
                  children: updateFolderStar(folder.children)
                };
              }
              return folder;
            });
          };
          
          return updateFolderStar(prev);
        });
      } else {
        const { error } = await supabase
          .from('files')
          .update({ starred: !currentStarred })
          .eq('id', id);
        
        if (error) throw error;
        
        // Update local state
        setFilteredFiles(prev => 
          prev.map(file => 
            file.id === id 
              ? { ...file, starred: !currentStarred } 
              : file
          )
        );
      }
      
      toast({
        title: currentStarred ? "Removed from starred" : "Added to starred",
        description: `Item has been ${currentStarred ? 'removed from' : 'added to'} starred items`,
      });
    } catch (error) {
      console.error('Star toggle error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update star status",
        variant: "destructive"
      });
    }
  };

  const handleDownloadFile = (file: FileItem) => {
    if (!file.audio_url) {
      toast({
        title: "Download failed",
        description: "File URL is not available",
        variant: "destructive"
      });
      return;
    }
    
    const link = document.createElement('a');
    link.href = file.audio_url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started",
      description: `Downloading ${file.name}`
    });
  };

  // Function to upload a file
  const uploadFile = async (
    file: File, 
    folderId?: string, 
    onProgress?: (progress: number) => void
  ) => {
    try {
      if (!user?.id) throw new Error("User not authenticated");
      
      // Generate unique file path
      const fileId = uuidv4();
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${fileId}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('audio_files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      // Simulate progress updates
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        if (progress >= 100) {
          clearInterval(progressInterval);
        }
        if (onProgress) onProgress(progress);
      }, 300);
      
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('audio_files')
        .getPublicUrl(filePath);
      
      // Add file record to database
      const { error: dbError } = await supabase
        .from('files')
        .insert([{
          id: fileId,
          name: file.name,
          file_url: publicUrl,
          file_path: filePath,
          size: file.size,
          file_type: getFileType(file.type),
          user_id: user.id,
          folder_id: folderId || null
        }]);
      
      if (dbError) throw dbError;
      
      return { success: true, fileId, url: publicUrl };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  // Function to get files for the current folder
  const fetchFiles = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id);
      
      if (selectedFolder) {
        query = query.eq('folder_id', selectedFolder);
      } else {
        // Only fetch files with null folder_id (root files)
        query = query.is('folder_id', null);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedFiles: FileItem[] = data.map(file => ({
        id: file.id,
        name: file.name,
        type: file.file_type || 'file',
        size: formatFileSize(file.size),
        modified: file.updated_at ? new Date(file.updated_at).toISOString().split('T')[0] : 
                 new Date(file.created_at).toISOString().split('T')[0],
        audio_url: file.file_url,
        file_path: file.file_path,
        folder_id: file.folder_id,
        starred: file.starred
      }));
      
      setFiles(formattedFiles);
      setFilteredFiles(formattedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error",
        description: "Failed to load files",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format file size
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Helper function to determine file type from MIME type
  function getFileType(mimeType: string): string {
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.includes('pdf')) return 'document';
    return 'file';
  }

  // Initialize by fetching files
  useEffect(() => {
    if (user?.id) {
      fetchFiles();
    }
  }, [user?.id, selectedFolder]);

  // Function to get files for the selected folder
  const getFilesForSelectedFolder = () => {
    if (!selectedFolder) return filteredFiles;
    
    return filteredFiles.filter(file => file.folder_id === selectedFolder);
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-1 h-full">
        {/* Sidebar with filters */}
        <div className="w-64 space-y-4 p-4 border-r">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search files..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <Button
              className="w-full justify-start gap-2"
              onClick={handleUploadClick}
            >
              <Upload className="h-4 w-4" />
              <span>Upload Files</span>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
                multiple
                accept="audio/*,.mp3,.wav,.aiff,.flac,.ogg,.aac"
              />
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start gap-2 mt-2"
              onClick={() => setShowNewFolderDialog(true)}
            >
              <FolderPlus className="h-4 w-4" />
              <span>New Folder</span>
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <Button 
              variant={selectedFolder === null ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-2 py-1.5 h-auto text-sm rounded-md mb-2",
                "transition-all duration-200 hover:bg-primary/10",
                selectedFolder === null && "bg-primary/15 hover:bg-primary/20"
              )}
              onClick={() => selectFolder(null)}
            >
              <FileIcon className="h-4 w-4 text-primary" />
              <span>All Files</span>
            </Button>

            <h3 className="text-sm font-medium mb-2 px-2 flex items-center">
              <Folder className="h-4 w-4 mr-2 text-primary" />
              <span>Folders</span>
            </h3>
            <div className="space-y-0.5 max-h-[300px] overflow-y-auto pr-1">
              {folders.map((folder) => (
                <div key={folder.id} className="space-y-0.5 transition-all duration-200">
                  <div className="flex items-center">
                    <Button 
                      variant={selectedFolder === folder.id ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-2 py-1.5 h-auto text-sm rounded-md",
                        "transition-all duration-200 hover:bg-primary/10",
                        selectedFolder === folder.id && "bg-primary/15 hover:bg-primary/20"
                      )}
                      onClick={() => {
                        selectFolder(folder.id);
                        if (folder.children?.length) {
                          toggleFolder(folder.id);
                        }
                      }}
                    >
                      <div className="flex items-center gap-1.5 min-w-[24px]">
                        {folder.children?.length ? (
                          <div className="transition-transform duration-200" 
                               style={{ transform: expandedFolders[folder.id] ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                            <ChevronRight className="h-4 w-4 flex-shrink-0" />
                          </div>
                        ) : (
                          <div className="w-4" />
                        )}
                        <Folder className={cn(
                          "h-4 w-4 flex-shrink-0",
                          selectedFolder === folder.id ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>
                      <span className="truncate">{folder.name}</span>
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 ml-1">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setItemToRename({
                            id: folder.id,
                            name: folder.name,
                            isFolder: true
                          });
                          setNewFileName(folder.name);
                          setShowRenameDialog(true);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStar(folder.id, true, !!folder.starred)}>
                          <Star className={cn(
                            "h-4 w-4 mr-2",
                            folder.starred && "fill-yellow-400 text-yellow-400"
                          )} />
                          {folder.starred ? 'Unstar' : 'Star'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-500"
                          onClick={() => {
                            setItemToDelete({
                              id: folder.id,
                              name: folder.name,
                              isFolder: true
                            });
                            setShowDeleteConfirmDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {/* Render subfolders if expanded */}
                  <div className={cn(
                    "space-y-0.5 overflow-hidden transition-all duration-200",
                    expandedFolders[folder.id] ? "max-h-96" : "max-h-0"
                  )}>
                    {folder.children?.filter(item => item.type === 'folder').map((subfolder) => (
                      <div key={subfolder.id} className="flex items-center">
                        <Button 
                          variant={selectedFolder === subfolder.id ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start gap-2 py-1.5 h-auto text-sm pl-8 rounded-md",
                            "transition-all duration-200 hover:bg-primary/10",
                            selectedFolder === subfolder.id && "bg-primary/15 hover:bg-primary/20"
                          )}
                          onClick={() => {
                            selectFolder(subfolder.id);
                            if (subfolder.children?.length) {
                              toggleFolder(subfolder.id);
                            }
                          }}
                        >
                          <div className="flex items-center gap-1.5 min-w-[24px]">
                            {subfolder.children?.length ? (
                              <div className="transition-transform duration-200" 
                                   style={{ transform: expandedFolders[subfolder.id] ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                              </div>
                            ) : (
                              <div className="w-4" />
                            )}
                            <Folder className={cn(
                              "h-4 w-4 flex-shrink-0",
                              selectedFolder === subfolder.id ? "text-primary" : "text-muted-foreground"
                            )} />
                          </div>
                          <span className="truncate">{subfolder.name}</span>
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 ml-1">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setItemToRename({
                                id: subfolder.id,
                                name: subfolder.name,
                                isFolder: true
                              });
                              setNewFileName(subfolder.name);
                              setShowRenameDialog(true);
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStar(subfolder.id, true, !!subfolder.starred)}>
                              <Star className={cn(
                                "h-4 w-4 mr-2",
                                subfolder.starred && "fill-yellow-400 text-yellow-400"
                              )} />
                              {subfolder.starred ? 'Unstar' : 'Star'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-500"
                              onClick={() => {
                                setItemToDelete({
                                  id: subfolder.id,
                                  name: subfolder.name,
                                  isFolder: true
                                });
                                setShowDeleteConfirmDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />

          {/* Starred Items Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium mb-2 px-2 flex items-center">
              <Star className="h-4 w-4 mr-2 text-yellow-400" />
              <span>Starred</span>
            </h3>
            <div className="space-y-0.5 max-h-[200px] overflow-y-auto pr-1">
              {[...folders, ...files]
                .filter(item => item.starred)
                .map(item => (
                  <Button 
                    key={item.id}
                    variant="ghost"
                    className="w-full justify-start gap-2 py-1.5 h-auto text-sm rounded-md"
                    onClick={() => {
                      if (item.type === 'folder') {
                        selectFolder(item.id);
                      } else {
                        // Handle file selection
                      }
                    }}
                  >
                    {item.type === 'folder' ? (
                      <Folder className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <FileIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="truncate">{item.name}</span>
                  </Button>
                ))}
            </div>
          </div>
        </div>

        {/* Main file browser area */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold">
              {selectedFolder ? 
                folders.find(f => f.id === selectedFolder)?.name || 'Files' : 
                'All Files'
              }
            </h1>
          </div>

          <div
            className={cn(
              "border-2 border-dashed rounded-lg m-4 p-4 text-center",
              "transition-all hover:border-primary/50"
            )}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">Uploading...</p>
                <div className="relative max-w-md mx-auto">
                  <Progress 
                    value={uploadProgress} 
                    className="h-2 bg-muted" 
                  />
                </div>
                <p className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</p>
                
                {/* Individual file progress */}
                {uploadingFiles.length > 1 && (
                  <div className="mt-4 max-w-md mx-auto">
                    <h4 className="text-sm font-medium text-left mb-2">Files ({uploadingFiles.length})</h4>
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
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop audio files here or{" "}
                  <Button variant="link" className="p-0 h-auto" onClick={handleUploadClick}>
                    browse
                  </Button>
                </p>
                <p className="text-xs text-muted-foreground">
                  Maximum {MAX_UPLOAD_FILES} files at once
                </p>
              </div>
            )}
          </div>

          <div className="flex-1 p-4">
            {/* Display files for selected folder */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilesForSelectedFolder().map((file) => (
                <div 
                  key={file.id} 
                  className={cn(
                    "p-3 border rounded-lg transition-all duration-200 flex items-center gap-3 cursor-pointer",
                    selectedItems.includes(file.id) 
                      ? "bg-primary/10 border-primary" 
                      : "hover:shadow-md hover:bg-primary/5"
                  )}
                  onClick={() => toggleItemSelection(file.id)}
                >
                  <div className="p-2 bg-primary/10 rounded-md">
                    <FileIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-medium truncate">{file.name}</p>
                      {file.starred && (
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{file.size}</span>
                      <span>•</span>
                      <span>{file.modified}</span>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadFile(file);
                      }}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        setItemToRename({
                          id: file.id,
                          name: file.name,
                          isFolder: false
                        });
                        setNewFileName(file.name);
                        setShowRenameDialog(true);
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStar(file.id, false, !!file.starred);
                      }}>
                        <Star className={cn(
                          "h-4 w-4 mr-2",
                          file.starred && "fill-yellow-400 text-yellow-400"
                        )} />
                        {file.starred ? 'Unstar' : 'Star'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          setItemToDelete({
                            id: file.id,
                            name: file.name,
                            isFolder: false,
                            filePath: file.file_path
                          });
                          setShowDeleteConfirmDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Folder dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleNewFolder}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Input
                  id="folderName"
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="col-span-4"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button"
                variant="outline"
                onClick={() => setShowNewFolderDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Folder
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename {itemToRename?.isFolder ? 'Folder' : 'File'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRenameItem}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Input
                  id="newName"
                  placeholder="New name"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="col-span-4"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button"
                variant="outline"
                onClick={() => {
                  setShowRenameDialog(false);
                  setItemToRename(null);
                  setNewFileName('');
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                Rename
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete <strong>{itemToDelete?.name}</strong>?</p>
            {itemToDelete?.isFolder && (
              <p className="text-sm text-destructive mt-2">
                This will also delete all files and subfolders inside this folder.
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button 
              type="button"
              variant="outline"
              onClick={() => {
                setShowDeleteConfirmDialog(false);
                setItemToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleDeleteItem}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndProvider>
  );
}