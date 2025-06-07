import * as React from "react"
import { useState, useEffect } from "react"
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  CameraIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
  ShoppingBag,
  DollarSign,
  Wallet,
} from "lucide-react"

import { NavMain } from "@/components/dashboard/layout/nav-main"
import { NavSecondary } from "@/components/dashboard/layout/nav-secondary"
import { NavUser } from "@/components/dashboard/nav-user"
import { Progress } from "@/components/@/ui/progress"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/@/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

const data = {
  navMain: [
    {
      title: "Overview",
      url: "/user/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: ShoppingBag,
    },
    {
      title: "Sales",
      url: "/dashboard/sales",
      icon: DollarSign,
    },
    {
      title: "Post A Service",
      url: "/dashboard/services",
      icon: DatabaseIcon,
    },
    {
      title: "Contracts",
      url: "/dashboard/contracts",
      icon: FileTextIcon,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChartIcon,
    },
    {
      title: "Wallet",
      url: "/dashboard/wallet",
      icon: Wallet,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: SettingsIcon,
    },
    {
      title: "Get Help",
      url: "#",
      icon: HelpCircleIcon,
    },
    {
      title: "Search",
      url: "#",
      icon: SearchIcon,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: DatabaseIcon,
    },
    {
      name: "Reports",
      url: "#",
      icon: ClipboardListIcon,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: FileIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const [storageUsed, setStorageUsed] = useState(0)
  const [storageLimit] = useState(1024 * 1024 * 1024) // 1GB in bytes

  useEffect(() => {
    if (!user) return

    const fetchStorageUsage = async () => {
      try {
        // Get all files for the user
        const { data: files, error } = await supabase
          .from('files')
          .select('size')
          .eq('user_id', user.id)
        
        if (error) throw error
        
        // Calculate total size
        const totalSize = files?.reduce((acc, file) => acc + (file.size || 0), 0) || 0
        setStorageUsed(totalSize)
      } catch (error) {
        console.error('Error fetching storage usage:', error)
      }
    }

    fetchStorageUsage()
  }, [user])

  // Calculate storage percentage
  const storagePercentage = Math.min(Math.round((storageUsed / storageLimit) * 100), 100)
  
  // Format storage display
  const formatStorage = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Music Access.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
        
        {/* Storage Progress Bar */}
        {user && (
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-sidebar-foreground/70">
                Storage
              </span>
              <span className="text-xs font-medium text-sidebar-foreground/70">
                {formatStorage(storageUsed)} / 1GB
              </span>
            </div>
            <Progress 
              value={storagePercentage} 
              className="h-2 bg-sidebar-accent [&>div]:bg-sidebar-primary"
            />
          </div>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}