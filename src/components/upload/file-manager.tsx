import { useState, useCallback, useRef } from 'react';
import { 
  Music, 
  Plus,
  Search,
  Upload,
  FolderPlus,
  File,
  Folder,
  ChevronRight,
  MoreVertical,
  Star,
  Pin,
  Tag,
  Trash2,
  Pencil,
  X
} from 'lucide-react';
import { Button } from '../@/ui/button';
import { Input } from '../@/ui/input';
import { Badge } from '../@/ui/badge';
import { Progress } from '../@/ui/progress';
import { cn } from '../@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../@/ui/dropdown-menu';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../@/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder' | 'audio';
  size?: string;
  modified?: string;
  children?: FileItem[];
  pinned?: boolean;
  starred?: boolean;
  badge?: {
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    label: string;
  };
}

interface DraggableItem {
  id: string;
  index: number;
  type: string;
}

const ItemTypes = {
  FILE: 'file',
  FOLDER: 'folder'
};

interface FileManagerProps {
  className?: string;
}

export function FileManager({ className }: FileManagerProps) {
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [fileToRename, setFileToRename] = useState<FileItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'Project 1',
      type: 'folder',
      children: [
        {
          id: '1-1',
          name: 'Track 1.wav',
          type: 'audio',
          size: '24.5 MB',
          modified: '2024-03-15'
        },
        {
          id: '1-2',
          name: 'Track 2.wav',
          type: 'audio',
          size: '18.2 MB',
          modified: '2024-03-15'
        }
      ]
    },
    {
      id: '2',
      name: 'Project 2',
      type: 'folder',
      children: [
        {
          id: '2-1',
          name: 'Mix.wav',
          type: 'audio',
          size: '35.1 MB',
          modified: '2024-03-14'
        }
      ]
    }
  ]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          toast({
            title: "Upload complete",
            description: "Your files have been uploaded successfully"
          });
          return 0;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleNewFolder = () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Folder name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    const newFolder: FileItem = {
      id: Date.now().toString(),
      name: newFolderName,
      type: 'folder',
      children: []
    };

    setFiles(prev => [...prev, newFolder]);
    setNewFolderName('');
    setShowNewFolderDialog(false);
    toast({
      title: "Success",
      description: "Folder created successfully"
    });
  };

  const handleRename = () => {
    if (!newFileName.trim() || !fileToRename) {
      toast({
        title: "Error",
        description: "File name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    setFiles(prev => {
      const updateItem = (items: FileItem[]): FileItem[] => {
        return items.map(item => {
          if (item.id === fileToRename.id) {
            return { ...item, name: newFileName };
          }
          if (item.children) {
            return { ...item, children: updateItem(item.children) };
          }
          return item;
        });
      };
      return updateItem(prev);
    });

    setShowRenameDialog(false);
    setFileToRename(null);
    setNewFileName('');
    toast({
      title: "Success",
      description: "File renamed successfully"
    });
  };

  const handleDelete = (fileId: string) => {
    setFiles(prev => {
      const deleteItem = (items: FileItem[]): FileItem[] => {
        return items.filter(item => {
          if (item.id === fileId) return false;
          if (item.children) {
            item.children = deleteItem(item.children);
          }
          return true;
        });
      };
      return deleteItem(prev);
    });

    toast({
      title: "Success",
      description: "File deleted successfully"
    });
  };

  const handleToggleStar = (fileId: string) => {
    setFiles(prev => {
      const toggleStar = (items: FileItem[]): FileItem[] => {
        return items.map(item => {
          if (item.id === fileId) {
            return { ...item, starred: !item.starred };
          }
          if (item.children) {
            return { ...item, children: toggleStar(item.children) };
          }
          return item;
        });
      };
      return toggleStar(prev);
    });
  };

  const handleTogglePin = (fileId: string) => {
    setFiles(prev => {
      const togglePin = (items: FileItem[]): FileItem[] => {
        return items.map(item => {
          if (item.id === fileId) {
            return { ...item, pinned: !item.pinned };
          }
          if (item.children) {
            return { ...item, children: togglePin(item.children) };
          }
          return item;
        });
      };
      return togglePin(prev);
    });
  };

  const getCurrentItems = (path: string[] = []) => {
    let current: FileItem[] = files;
    for (const segment of path) {
      const found = current.find(item => item.name === segment);
      if (found && found.children) {
        current = found.children;
      } else {
        return [];
      }
    }
    return current;
  };

  const handleItemClick = (itemName: string, columnIndex: number) => {
    if (columnIndex < selectedPath.length) {
      const newPath = selectedPath.slice(0, columnIndex);
      newPath.push(itemName);
      setSelectedPath(newPath);
    } else {
      setSelectedPath([...selectedPath, itemName]);
    }
  };

  const DraggableItem = ({ item, index, columnIndex }: { item: FileItem, index: number, columnIndex: number }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: item.type === 'folder' ? ItemTypes.FOLDER : ItemTypes.FILE,
      item: { id: item.id, index, type: item.type },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }));

    const [, drop] = useDrop(() => ({
      accept: [ItemTypes.FILE, ItemTypes.FOLDER],
      hover: (draggedItem: DraggableItem) => {
        if (draggedItem.id !== item.id) {
          const currentItems = getCurrentItems(columnIndex === 0 ? [] : selectedPath.slice(0, columnIndex));
          const newItems = [...currentItems];
          const [removed] = newItems.splice(draggedItem.index, 1);
          newItems.splice(index, 0, removed);
          
          if (columnIndex === 0) {
            setFiles(newItems);
          } else {
            const path = selectedPath.slice(0, columnIndex);
            const parentItems = getCurrentItems(path.slice(0, -1));
            const parentItem = parentItems.find(i => i.name === path[path.length - 1]);
            if (parentItem) {
              parentItem.children = newItems;
              setFiles([...files]);
            }
          }
        }
      },
    }));

    return (
      <div
        ref={(node) => drag(drop(node))}
        className={cn(
          "p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors flex items-center justify-between",
          isDragging && "opacity-50",
          selectedPath[columnIndex] === item.name && "bg-gray-100 font-medium"
        )}
        onClick={() => {
          if (item.type === 'folder') {
            handleItemClick(item.name, columnIndex);
            setSelectedFile(null);
          } else {
            setSelectedFile(item);
          }
        }}
      >
        <div className="flex items-center gap-2">
          {item.type === 'folder' ? (
            <Folder className="h-4 w-4 text-amber-500" />
          ) : (
            <File className="h-4 w-4 text-gray-500" />
          )}
          <span>{item.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {item.badge && (
            <Badge variant={item.badge.variant}>
              {item.badge.label}
            </Badge>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                setFileToRename(item);
                setNewFileName(item.name);
                setShowRenameDialog(true);
              }}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Rename</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleStar(item.id)}>
                <Star className="mr-2 h-4 w-4" />
                <span>{item.starred ? 'Unstar' : 'Star'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTogglePin(item.id)}>
                <Pin className="mr-2 h-4 w-4" />
                <span>{item.pinned ? 'Unpin' : 'Pin'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Tag className="mr-2 h-4 w-4" />
                <span>Change Tag</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-500"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {item.type === 'folder' && (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>
    );
  };

  const renderColumn = (items: FileItem[], index: number) => (
    <div key={index} className="flex-1 min-w-0 w-full border-r border-gray-200">
      <div className="p-2">
        {items.map((item, itemIndex) => (
          <DraggableItem key={item.id} item={item} index={itemIndex} columnIndex={index} />
        ))}
      </div>
    </div>
  );

  const columns = [];
  const currentItems = getCurrentItems();
  
  // Always show root column
  columns.push(renderColumn(currentItems, 0));

  // Show columns for selected path
  let pathItems = currentItems;
  for (let i = 0; i < selectedPath.length; i++) {
    const pathSegment = selectedPath[i];
    const foundItem = pathItems.find(item => item.name === pathSegment);
    
    if (foundItem && foundItem.children) {
      pathItems = foundItem.children;
      columns.push(renderColumn(pathItems, i + 1));
    } else {
      setSelectedPath(selectedPath.slice(0, i));
      break;
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">File Browser</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowNewFolderDialog(true)}
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
              <Button onClick={handleUploadClick}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                  multiple
                  accept="audio/*"
                />
              </Button>
            </div>
          </div>

          {isUploading && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="h-4 w-4 animate-bounce" />
                <span className="text-sm">Uploading files...</span>
              </div>
              <Progress value={uploadProgress} className="h-1" />
            </div>
          )}
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 min-w-0">
            {columns}
          </div>

          {selectedFile && (
            <div className="w-72 flex-shrink-0 border-l border-gray-200 p-4 overflow-y-auto">
              <div className="space-y-4">
                <h3 className="font-medium text-lg">File Info</h3>
                
                <div className="space-y-4">
                  <div className="relative w-full aspect-square bg-gray-100 rounded-md flex items-center justify-center">
                    <Music className="h-16 w-16 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-medium">{selectedFile.name}</h4>
                    <p className="text-sm text-gray-500">
                      {selectedFile.size} • {selectedFile.modified}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Name</span>
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Type</span>
                    <span className="text-sm font-medium">{selectedFile.type}</span>
                  </div>
                  {selectedFile.size && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Size</span>
                      <span className="text-sm font-medium">{selectedFile.size}</span>
                    </div>
                  )}
                  {selectedFile.modified && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Modified</span>
                      <span className="text-sm font-medium">{selectedFile.modified}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowNewFolderDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleNewFolder}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename {fileToRename?.type}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="New name"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowRenameDialog(false);
                  setFileToRename(null);
                  setNewFileName('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleRename}>
                Rename
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DndProvider>
  );
}