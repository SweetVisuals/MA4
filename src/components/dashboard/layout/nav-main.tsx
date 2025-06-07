import { FolderIcon, PlusCircleIcon, type LucideIcon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import { Button } from "@/components/@/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/@/ui/sidebar"

export function NavMain({
  items,
  showQuickActions = true
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
  showQuickActions?: boolean
}) {
  const location = useLocation()
  
  // Function to check if a menu item is active
  const isActive = (url: string) => {
    // Check if the current path matches the item URL
    // For dashboard, we need to check both /dashboard and /user/dashboard
    if (url === '/user/dashboard') {
      return location.pathname === '/user/dashboard' || location.pathname === '/dashboard'
    }
    
    // For other pages, check if the path starts with the URL
    // This handles nested routes like /dashboard/analytics
    return location.pathname.startsWith(url)
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {showQuickActions && (
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                tooltip="Upload"
                className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              >
                <PlusCircleIcon />
                <span>Upload</span>
              </SidebarMenuButton>
              <Button
                size="icon"
                className="h-9 w-9 shrink-0 group-data-[collapsible=icon]:opacity-0"
                variant="outline"
              >
                <FolderIcon />
                <span className="sr-only">Files</span>
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Link to={item.url} className="w-full">
                <SidebarMenuButton 
                  tooltip={item.title}
                  isActive={isActive(item.url)}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}