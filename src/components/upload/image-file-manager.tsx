import { useState } from "react";
import { FileItem } from "@/lib/types";
import { File } from "lucide-react";

export const ImageFileManager = () => {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const files: FileItem[] = [
    {
      id: "img1",
      name: "Album Cover.jpg",
      type: "image",
      size: "2.4 MB",
      modified: "2025-03-02"
    },
    {
      id: "img2",
      name: "Studio Setup.png",
      type: "image",
      size: "5.7 MB",
      modified: "2025-02-28"
    }
  ];

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 min-w-0 overflow-y-auto p-2">
        <div className="space-y-2">
          {files.map((file) => (
            <div 
              key={file.id}
              className="p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors flex items-center justify-between"
              onClick={() => setSelectedFile(file)}
            >
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-green-500" />
                <span>{file.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">{file.size}</span>
                <span className="text-sm text-gray-500">{file.modified}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedFile && (
        <div className="w-72 flex-shrink-0 border-l border-gray-200 p-4 overflow-y-auto">
          <div className="space-y-4">
            <h3 className="font-medium text-lg">File Info</h3>
            
            <div className="space-y-4">
              <div className="relative w-full aspect-square bg-gray-100 rounded-md flex items-center justify-center">
                <File className="h-16 w-16 text-green-400" />
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
  );
};
