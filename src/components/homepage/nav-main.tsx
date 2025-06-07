import { useLocation, Link } from "react-router-dom"
import { FileIcon, PlusCircleIcon, type LucideIcon } from "lucide-react"

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
  const location = useLocation();
  
  // Function to check if a nav item is active
  const isActive = (url: string) => {
    // Handle exact match for home page
    if (url === '/' && location.pathname === '/') {
      return true;
    }
    // Handle other pages - check if the pathname starts with the URL
    // This ensures that sub-routes also highlight the parent nav item
    return url !== '/' && location.pathname.startsWith(url);
  };

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
                <FileIcon />
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