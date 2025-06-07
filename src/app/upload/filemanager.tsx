import { AppSidebar } from "@/components/dashboard/layout/app-sidebar";
import { SiteHeader } from "@/components/dashboard/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/@/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/@/ui/tabs";
import { useNavigate } from "react-router-dom";
import UploadWizard from "./upload-wizard";

export default function UploadPage() {
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <main className="flex-1 overflow-y-auto">
            <UploadWizard />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}