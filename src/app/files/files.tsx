import { AppSidebar } from "@/components/dashboard/layout/app-sidebar"
import { SiteHeader } from "@/components/dashboard/layout/site-header"
import { SidebarInset, SidebarProvider } from "@/components/@/ui/sidebar"
import { Upload, Folder, File } from "lucide-react"
import { UnifiedFileBrowser } from "@/components/upload/upload-with-browser"
import { useFiles } from "@/hooks/useFiles"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"

export default function Page() {
  const { user } = useAuth();
  const { 
    files, 
    folders, 
    loading, 
    fetchFiles, 
    fetchFolders, 
    createFolder, 
    uploadFile 
  } = useFiles(user?.id || '');

  // Fetch files and folders on component mount
  useEffect(() => {
    if (user?.id) {
      fetchFiles();
      fetchFolders();
    }
  }, [user?.id]);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="flex justify-between items-center px-4 lg:px-6">
                  <h2 className="text-xl font-semibold">Files</h2>
                </div>
                
                <div className="px-4 lg:px-6 h-[calc(100vh-180px)]">
                  <UnifiedFileBrowser 
                    files={files}
                    folders={folders}
                    onUpload={() => {
                      fetchFiles();
                      fetchFolders();
                    }}
                    onCreateFolder={() => {
                      fetchFolders();
                    }}
                    uploadFile={uploadFile}
                  />
                </div>
              </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}