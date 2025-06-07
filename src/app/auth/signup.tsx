import { SiteHeader } from "@/components/homepage/site-header"
import { SignupForm } from "@/components/auth/signup-form"
import { AppSidebar } from "@/components/homepage/app-sidebar"
import { NavDocuments } from "@/components/homepage/nav-documents"
import { SidebarInset, SidebarProvider } from "@/components/@/ui/sidebar"
import { Home, Settings, Music, Mic2, Disc3 } from "lucide-react"

const docItems = [
  { name: 'Getting Started', url: '/docs/start', icon: Home },
  { name: 'API Reference', url: '/docs/api', icon: Settings }
];

export default function SignupPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" className="z-50">
        <NavDocuments items={docItems} />
      </AppSidebar>
      <SidebarInset>
        <div className="@container/main flex flex-1 flex-col">
          <SiteHeader />
          <div className="sticky top-0 z-40 bg-background">
          </div>
          <div className="absolute right-4 top-4 z-50">
          </div>

          <div className="flex-1 flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
            <div className="flex justify-center w-full py-4">
            </div>
            <div className="flex items-center justify-center w-full">
              <div className="w-full max-w-md">
                <SignupForm />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
