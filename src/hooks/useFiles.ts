import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FileItem, DatabaseFile, DatabaseFolder } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export function useFiles(userId: string) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch folders and build the folder hierarchy
  async function fetchFolders() {
    if (!userId) {
      console.log('No user ID provided for fetchFolders');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Get all folders for this user
      const { data: folderData, error: folderError } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      
      if (folderError) throw folderError;
      
      // Build folder hierarchy
      const rootFolders: FileItem[] = [];
      const folderMap: Record<string, FileItem> = {};
      
      // First pass: Create folder objects
      folderData?.forEach(folder => {
        folderMap[folder.id] = {
          id: folder.id,
          name: folder.name,
          type: 'folder',
          modified: folder.updated_at || folder.created_at,
          children: [],
          starred: folder.starred
        };
      });
      
      // Second pass: Build hierarchy
      folderData?.forEach(folder => {
        const folderItem = folderMap[folder.id];
        
        if (folder.parent_id && folderMap[folder.parent_id]) {
          // Add to parent's children
          if (!folderMap[folder.parent_id].children) {
            folderMap[folder.parent_id].children = [];
          }
          folderMap[folder.parent_id].children?.push(folderItem);
        } else {
          // Root level folder
          rootFolders.push(folderItem);
        }
      });
      
      setFolders(rootFolders);
    } catch (err) {
      console.error('Error fetching folders:', err);
      setError(err instanceof Error ? err.message : 'Unknown error fetching folders');
    } finally {
      setLoading(false);
    }
  }

  // Fetch files for a specific folder or all files
  async function fetchFiles(folderId?: string | null) {
    if (!userId) {
      console.log('No user ID provided for fetchFiles');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Get all files for this user
      const { data: fileData, error: fileError } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (fileError) throw fileError;
      
      const formattedFiles: FileItem[] = fileData?.map(file => ({
        id: file.id,
        name: file.name,
        type: file.file_type || 'file',
        size: formatFileSize(file.size),
        modified: formatDate(file.updated_at || file.created_at),
        audio_url: file.file_url,
        file_path: file.file_path,
        folder_id: file.folder_id,
        starred: file.starred
      })) || [];
      
      setFiles(formattedFiles);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError(err instanceof Error ? err.message : 'Unknown error fetching files');
    } finally {
      setLoading(false);
    }
  }

  // Create a new folder
  async function createFolder(name: string, parentId?: string | null) {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      if (!name.trim()) {
        throw new Error('Folder name cannot be empty');
      }

      const folderId = uuidv4();
      const { error } = await supabase
        .from('folders')
        .insert([{ 
          id: folderId,
          name, 
          user_id: userId,
          parent_id: parentId || null
        }]);
      
      if (error) throw error;
      
      // Refresh folders
      await fetchFolders();
      return { success: true, folderId };
    } catch (err) {
      console.error('Error creating folder:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create folder';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }

  // Upload a file to Supabase storage and add record to database
  async function uploadFile(file: File, folderId?: string | null, onProgress?: (progress: number) => void) {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      // Generate unique file path
      const fileId = uuidv4();
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${fileId}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('audio_files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      // Handle progress updates manually since the Supabase JS client doesn't expose upload progress
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
          user_id: userId,
          folder_id: folderId || null
        }]);
      
      if (dbError) throw dbError;
      
      return { success: true, fileId, url: publicUrl };
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err instanceof Error ? err.message : 'Unknown error uploading file');
      return { success: false, error: err };
    }
  }

  // Delete a file
  async function deleteFile(fileId: string, filePath: string) {
    try {
      // Delete from storage if path exists
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
        .eq('id', fileId);
      
      if (error) throw error;
      
      // Update local state
      setFiles(prev => prev.filter(file => file.id !== fileId));
      
      return { success: true, id: fileId };
    } catch (err) {
      console.error('Error deleting file:', err);
      setError(err instanceof Error ? err.message : 'Unknown error deleting file');
      return { success: false, error: err };
    }
  }

  // Delete a folder and all its contents recursively
  async function deleteFolder(folderId: string) {
    try {
      // Get all files in this folder
      const { data: folderFiles, error: filesError } = await supabase
        .from('files')
        .select('id, file_path')
        .eq('folder_id', folderId);
      
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
          .eq('folder_id', folderId);
        
        if (dbFilesError) throw dbFilesError;
      }
      
      // Get all subfolders
      const { data: subfolders, error: subfoldersError } = await supabase
        .from('folders')
        .select('id')
        .eq('parent_id', folderId);
      
      if (subfoldersError) throw subfoldersError;
      
      // Recursively delete subfolders
      if (subfolders && subfolders.length > 0) {
        for (const subfolder of subfolders) {
          await deleteFolder(subfolder.id);
        }
      }
      
      // Finally delete the folder itself
      const { error: folderError } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId);
      
      if (folderError) throw folderError;
      
      // Update local state
      setFolders(prev => {
        const removeFolderFromTree = (items: FileItem[]): FileItem[] => {
          return items.filter(item => {
            if (item.id === folderId) return false;
            if (item.children) {
              item.children = removeFolderFromTree(item.children);
            }
            return true;
          });
        };
        
        return removeFolderFromTree(prev);
      });
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting folder:', err);
      setError(err instanceof Error ? err.message : 'Unknown error deleting folder');
      return { success: false, error: err };
    }
  }

  // Move a file to a different folder
  async function moveFile(fileId: string, newFolderId: string | null) {
    try {
      const { error } = await supabase
        .from('files')
        .update({ folder_id: newFolderId })
        .eq('id', fileId);
      
      if (error) throw error;
      
      // Update local state
      setFiles(prev => 
        prev.map(file => 
          file.id === fileId 
            ? { ...file, folder_id: newFolderId } 
            : file
        )
      );
      
      return { success: true };
    } catch (err) {
      console.error('Error moving file:', err);
      setError(err instanceof Error ? err.message : 'Unknown error moving file');
      return { success: false, error: err };
    }
  }

  // Move a folder to become a child of another folder
  async function moveFolder(folderId: string, newParentId: string | null) {
    try {
      const { error } = await supabase
        .from('folders')
        .update({ parent_id: newParentId })
        .eq('id', folderId);
      
      if (error) throw error;
      
      // Refresh folders
      await fetchFolders();
      return { success: true };
    } catch (err) {
      console.error('Error moving folder:', err);
      setError(err instanceof Error ? err.message : 'Unknown error moving folder');
      return { success: false, error: err };
    }
  }

  // Format date to YYYY-MM-DD
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

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

  // Initialize by fetching folders and files
  useEffect(() => {
    if (userId) {
      fetchFolders();
      fetchFiles();
    }
  }, [userId]);

  return {
    files,
    folders,
    loading,
    error,
    fetchFiles,
    fetchFolders,
    createFolder,
    uploadFile,
    deleteFile,
    deleteFolder,
    moveFile,
    moveFolder
  };
}