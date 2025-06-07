import * as React from "react"
import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
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
} from "lucide-react"

import { NavDocuments } from "@/components/homepage/nav-documents"
import { NavMain } from "@/components/dashboard/layout/nav-main"
import { NavSecondary } from "@/components/dashboard/layout/nav-secondary"
import { NavUser } from "@/components/homepage/nav-user"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/@/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Discover",
      url: "/",
      icon: SearchIcon,
      items: [
        {
          title: "Trending",
          url: "#",
        },
        {
          title: "Genres",
          url: "#",
        },
        {
          title: "... More",
          url: "#",
        },
      ],
    },
    {
      title: "Tutorials",
      url: "/tutorials",
      icon: FileTextIcon,
    },
    {
      title: "Find Talent",
      url: "/find-talent",
      icon: UsersIcon,
    },
    {
      title: "Marketing",
      url: "/marketing",
      icon: BarChartIcon,
    },
    {
      title: "Collaborate",
      url: "/collaborate",
      icon: UsersIcon,
    },
  ],
  navClouds: [],
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
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return null

  const filteredNavMain = user 
    ? data.navMain 
    : data.navMain.filter(item => item.title === "Discover")

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Music Access.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} showQuickActions={!!user} />
        {user && (
          <>
            <NavDocuments />
            <NavSecondary items={data.navSecondary} className="mt-auto" />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}