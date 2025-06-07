import { useState, useEffect } from "react"
import { MessageSquare, Bell, User, type LucideIcon } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/@/ui/sidebar"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/@/ui/avatar"
import { Button } from "@/components/@/ui/button"
import { Badge } from "@/components/@/ui/badge"
import { Skeleton } from "@/components/@/ui/skeleton"
import { toast } from "sonner"

interface FollowingUser {
  id: string
  username: string
  full_name: string
  profile_url: string | null
  has_unread_messages?: boolean
  has_notifications?: boolean
}

export function NavDocuments() {
  const { user } = useAuth()
  const [followingUsers, setFollowingUsers] = useState<FollowingUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setFollowingUsers([])
      setIsLoading(false)
      return
    }

    const fetchFollowingUsers = async () => {
      setIsLoading(true)
      try {
        // This is a placeholder query - in a real app, you would have a proper follows/following table
        // For demo purposes, we'll just fetch some profiles to display
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, full_name, profile_url')
          .neq('id', user.id)
          .limit(5)
        
        if (error) throw error
        
        // Add some random notification states for demo purposes
        const usersWithNotifications = data?.map(user => ({
          ...user,
          has_unread_messages: Math.random() > 0.7,
          has_notifications: Math.random() > 0.7
        })) || []
        
        setFollowingUsers(usersWithNotifications)
      } catch (error) {
        console.error('Error fetching following users:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFollowingUsers()
  }, [user])

  const handleMessage = (userId: string, username: string) => {
    toast.info(`Messaging ${username}`)
    // In a real app, this would open a chat with the user
  }

  const handleNotification = (userId: string, username: string) => {
    toast.info(`Viewing notifications for ${username}`)
    // In a real app, this would show notifications related to this user
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Following</SidebarGroupLabel>
      <SidebarMenu>
        {isLoading ? (
          // Loading skeletons
          Array(3).fill(0).map((_, i) => (
            <SidebarMenuItem key={`skeleton-${i}`}>
              <div className="flex items-center gap-3 p-2 w-full">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
            </SidebarMenuItem>
          ))
        ) : followingUsers.length === 0 ? (
          <SidebarMenuItem>
            <div className="p-2 text-sm text-muted-foreground">
              {user ? "You're not following anyone yet" : "Sign in to see who you're following"}
            </div>
          </SidebarMenuItem>
        ) : (
          followingUsers.map((followingUser) => (
            <SidebarMenuItem key={followingUser.id}>
              <div className="flex items-center justify-between p-2 w-full rounded-md hover:bg-sidebar-accent group/user transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={followingUser.profile_url || ''} />
                    <AvatarFallback>
                      {followingUser.full_name?.[0] || followingUser.username?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{followingUser.full_name || followingUser.username}</span>
                      {followingUser.has_notifications && (
                        <Badge variant="default" className="h-1.5 w-1.5 rounded-full p-0 bg-red-500" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">@{followingUser.username}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover/user:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 relative"
                    onClick={() => handleMessage(followingUser.id, followingUser.username)}
                  >
                    <MessageSquare className="h-4 w-4" />
                    {followingUser.has_unread_messages && (
                      <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-blue-500 rounded-full" />
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 relative"
                    onClick={() => handleNotification(followingUser.id, followingUser.username)}
                  >
                    <Bell className="h-4 w-4" />
                    {followingUser.has_notifications && (
                      <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full" />
                    )}
                  </Button>
                </div>
              </div>
            </SidebarMenuItem>
          ))
        )}
        
        {user && followingUsers.length > 0 && (
          <SidebarMenuButton asChild className="text-primary text-sm mt-2">
            <a href="/following">View all following</a>
          </SidebarMenuButton>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}