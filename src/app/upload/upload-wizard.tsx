import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSidebar } from "@/components/dashboard/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/@/ui/sidebar";
import { SiteHeader } from "@/components/dashboard/layout/site-header";
import { 
  Music, 
  Image, 
  FileText, 
  Video, 
  Upload, 
  ChevronRight, 
  ChevronLeft,
  Check,
  File,
  Folder,
  FolderPlus,
  Search,
  MoreVertical,
  Download,
  Pencil,
  Trash2,
  Star,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/@/ui/badge";
import { Card, CardContent } from "@/components/@/ui/card";
import { useDropzone } from 'react-dropzone';
import { Progress } from "@/components/@/ui/progress";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/@/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/@/ui/dialog";

export default function UploadWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'name' | 'date' | 'size'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => {
      setFiles(acceptedFiles);
    },
    accept: {
      'audio/*': ['.mp3', '.wav', '.flac', '.aac', '.ogg'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc', '.docx'],
    },
    maxFiles: 10,
    multiple: true
  });

  useEffect(() => {
    if (user) {
      fetchFiles();
      fetchFolders();
    }
  }, [user, currentFolder]);

  const fetchFiles = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id);
      
      if (currentFolder) {
        query = query.eq('folder_id', currentFolder);
      } else {
        query = query.is('folder_id', null);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setUploadedFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFolders = async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id);
      
      if (currentFolder) {
        query = query.eq('parent_id', currentFolder);
      } else {
        query = query.is('parent_id', null);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast.error('Failed to load folders');
    }
  };

  const handleUpload = async () => {
    if (!user) {
      toast.error('You must be logged in to upload files');
      return;
    }
    
    if (files.length === 0) {
      toast.error('Please select at least one file to upload');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = uuidv4();
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${fileId}.${fileExt}`;
        
        // Update progress
        const currentProgress = Math.round((i / files.length) * 100);
        setUploadProgress(currentProgress);
        
        // Upload to Supabase Storage
        const { error: storageError } = await supabase.storage
          .from('audio_files')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (storageError) throw storageError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('audio_files')
          .getPublicUrl(filePath);
        
        // Add to database
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
            folder_id: currentFolder
          }]);
        
        if (dbError) throw dbError;
      }
      
      // Set final progress
      setUploadProgress(100);
      
      // Show success message
      toast.success('Files uploaded successfully');
      
      // Clear files and refresh the list
      setFiles([]);
      fetchFiles();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const handleCreateFolder = async () => {
    if (!user) {
      toast.error('You must be logged in to create folders');
      return;
    }
    
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('folders')
        .insert([{
          name: newFolderName.trim(),
          user_id: user.id,
          parent_id: currentFolder
        }])
        .select();
      
      if (error) throw error;
      
      toast.success('Folder created successfully');
      setNewFolderName('');
      setShowNewFolderDialog(false);
      fetchFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    }
  };

  const handleDeleteFile = async (id: string, filePath: string) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      // Delete from storage
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('audio_files')
          .remove([filePath]);
        
        if (storageError) throw storageError;
      }
      
      // Delete from database
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('File deleted successfully');
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this folder and all its contents?')) return;
    
    try {
      // Get all files in this folder
      const { data: folderFiles, error: filesError } = await supabase
        .from('files')
        .select('id, file_path')
        .eq('folder_id', id);
      
      if (filesError) throw filesError;
      
      // Delete all files in the folder from storage
      if (folderFiles && folderFiles.length > 0) {
        const filePaths = folderFiles.map(file => file.file_path).filter(Boolean);
        
        if (filePaths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('audio_files')
            .remove(filePaths);
          
          if (storageError) throw storageError;
        }
        
        // Delete all file records
        const { error: dbFilesError } = await supabase
          .from('files')
          .delete()
          .eq('folder_id', id);
        
        if (dbFilesError) throw dbFilesError;
      }
      
      // Delete the folder itself
      const { error: folderError } = await supabase
        .from('folders')
        .delete()
        .eq('id', id);
      
      if (folderError) throw folderError;
      
      toast.success('Folder deleted successfully');
      fetchFolders();
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    }
  };

  const navigateToFolder = (folderId: string | null) => {
    setCurrentFolder(folderId);
  };

  const getFileType = (mimeType: string): string => {
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word')) return 'document';
    return 'file';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'audio':
        return <Music className="h-5 w-5 text-blue-500" />;
      case 'image':
        return <Image className="h-5 w-5 text-green-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-500" />;
      case 'pdf':
        return <FileText className="h-5 w-5 text-orange-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const sortFiles = (files: any[]) => {
    return [...files].sort((a, b) => {
      let comparison = 0;
      
      switch (sortOrder) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;
        case 'size':
          comparison = b.size - a.size;
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const filteredFiles = uploadedFiles
    .filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(file => currentFolder === file.folder_id);

  const sortedFiles = sortFiles(filteredFiles);

  const filteredFolders = folders
    .filter(folder => folder.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleToggleSort = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleChangeSortOrder = (order: 'name' | 'date' | 'size') => {
    if (sortOrder === order) {
      handleToggleSort();
    } else {
      setSortOrder(order);
      setSortDirection('desc');
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 animate-fade-in">
            <div className="flex flex-col h-full">
              {/* Header with breadcrumbs and actions */}
              <div className="p-6 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">Files</h1>
                  <div className="flex items-center">
                    <Button 
                      variant="ghost" 
                      className="h-8 px-2"
                      onClick={() => navigateToFolder(null)}
                    >
                      All Files
                    </Button>
                    {currentFolder && (
                      <>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <Button variant="ghost" className="h-8 px-2">
                          {folders.find(f => f.id === currentFolder)?.name || 'Folder'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowNewFolderDialog(true)}
                  >
                    <FolderPlus className="h-4 w-4 mr-2" />
                    New Folder
                  </Button>
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
              </div>

              {/* Search and filters */}
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search files and folders..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <ArrowUpDown className="h-4 w-4" />
                        Sort: {sortOrder.charAt(0).toUpperCase() + sortOrder.slice(1)}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleChangeSortOrder('name')}>
                        Name {sortOrder === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleChangeSortOrder('date')}>
                        Date {sortOrder === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleChangeSortOrder('size')}>
                        Size {sortOrder === 'size' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Upload progress */}
              {isUploading && (
                <div className="px-6 py-4 bg-muted/20 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 animate-pulse text-primary" />
                      <span className="text-sm font-medium">Uploading {files.length} file(s)...</span>
                    </div>
                    <span className="text-sm">{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                  
                  <div className="flex justify-end mt-2">
                    <Button 
                      size="sm" 
                      onClick={handleUpload}
                      disabled={isUploading}
                    >
                      {isUploading ? 'Uploading...' : 'Start Upload'}
                    </Button>
                  </div>
                </div>
              )}

              {/* File browser */}
              <div className="flex-1 p-6 overflow-auto">
                {isDragActive && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50">
                    <div className="p-8 rounded-lg border-2 border-dashed border-primary bg-background">
                      <Upload className="h-12 w-12 mx-auto text-primary mb-4" />
                      <p className="text-lg font-medium">Drop files here to upload</p>
                    </div>
                  </div>
                )}
                
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <>
                    {/* Folders */}
                    {filteredFolders.length > 0 && (
                      <div className="mb-6">
                        <h2 className="text-lg font-medium mb-4">Folders</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {filteredFolders.map(folder => (
                            <div 
                              key={folder.id}
                              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer flex flex-col"
                              onClick={() => navigateToFolder(folder.id)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Folder className="h-5 w-5 text-primary" />
                                  <span className="font-medium truncate">{folder.name}</span>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      // Rename folder functionality
                                    }}>
                                      <Pencil className="h-4 w-4 mr-2" />
                                      Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      // Star folder functionality
                                    }}>
                                      <Star className="h-4 w-4 mr-2" />
                                      Star
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteFolder(folder.id);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <div className="text-xs text-muted-foreground mt-auto pt-2">
                                Created {new Date(folder.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Files */}
                    <div>
                      <h2 className="text-lg font-medium mb-4">Files</h2>
                      {sortedFiles.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                          <div className="mx-auto w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                            <File className="h-12 w-12 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-medium">No files found</h3>
                          <p className="text-muted-foreground mt-2 mb-4">
                            {currentFolder ? 'This folder is empty' : 'You haven\'t uploaded any files yet'}
                          </p>
                          <div {...getRootProps()}>
                            <input {...getInputProps()} />
                            <Button>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Files
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {sortedFiles.map(file => (
                            <div 
                              key={file.id}
                              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer flex flex-col"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {getFileIcon(file.file_type)}
                                  <span className="font-medium truncate">{file.name}</span>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => {
                                      // Download file
                                      window.open(file.file_url, '_blank');
                                    }}>
                                      <Download className="h-4 w-4 mr-2" />
                                      Download
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      // Rename file functionality
                                    }}>
                                      <Pencil className="h-4 w-4 mr-2" />
                                      Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      // Star file functionality
                                    }}>
                                      <Star className="h-4 w-4 mr-2" />
                                      Star
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={() => handleDeleteFile(file.id, file.file_path)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <div className="mt-2 flex-1 flex flex-col">
                                {file.file_type === 'audio' && (
                                  <div className="bg-muted/50 rounded-md h-24 flex items-center justify-center mb-2">
                                    <Music className="h-8 w-8 text-primary/50" />
                                  </div>
                                )}
                                {file.file_type === 'image' && (
                                  <div className="bg-muted/50 rounded-md h-24 flex items-center justify-center mb-2">
                                    <Image className="h-8 w-8 text-green-500/50" />
                                  </div>
                                )}
                                {file.file_type === 'video' && (
                                  <div className="bg-muted/50 rounded-md h-24 flex items-center justify-center mb-2">
                                    <Video className="h-8 w-8 text-red-500/50" />
                                  </div>
                                )}
                                {(file.file_type !== 'audio' && file.file_type !== 'image' && file.file_type !== 'video') && (
                                  <div className="bg-muted/50 rounded-md h-24 flex items-center justify-center mb-2">
                                    <File className="h-8 w-8 text-muted-foreground/50" />
                                  </div>
                                )}
                                <div className="text-xs text-muted-foreground mt-auto space-y-1">
                                  <div className="flex justify-between">
                                    <span>Size:</span>
                                    <span>{formatFileSize(file.size)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Uploaded:</span>
                                    <span>{new Date(file.created_at).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}