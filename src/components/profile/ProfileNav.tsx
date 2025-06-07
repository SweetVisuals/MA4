import { type LucideIcon } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/@/ui/sidebar"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface ProfileNavProps {
  items: NavItem[]
}

export function ProfileNav({ items }: ProfileNavProps) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Profile</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a href={item.url} className="flex items-center gap-2 w-full">
                <item.icon className="h-4 w-4" />
                <span className="text-sm">{item.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
