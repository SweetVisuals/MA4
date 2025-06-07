import { useState, useEffect } from "react"
import { LogInIcon, UserPlusIcon } from "lucide-react"
import { supabase } from "@/lib/supabase"
import {
  BellIcon,
  CreditCardIcon,
  LogOutIcon,
  MoreVerticalIcon,
  UserCircleIcon,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import { Button } from "@/components/@/ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/@/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/@/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/@/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { Progress } from "@/components/@/ui/progress"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { user: authUser, isLoading: isAuthLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<{
    username: string | null
    email: string | null
    profile_url: string | null
  } | null>(null)
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [storageUsed, setStorageUsed] = useState(0)
  const [storageLimit] = useState(1024 * 1024 * 1024) // 1GB in bytes

  useEffect(() => {
    if (!authUser) {
      setProfile(null)
      setIsProfileLoading(false)
      return
    }

    const fetchProfile = async () => {
      setIsProfileLoading(true)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, email, profile_url')
          .eq('id', authUser.id)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
          // Don't throw here, just log the error
        }
        
        // Set profile data if available, or use defaults from auth user
        setProfile({
          username: data?.username || authUser.user_metadata?.username || authUser.email?.split('@')[0] || null,
          email: data?.email || authUser.email || null,
          profile_url: data?.profile_url || null
        })
      } catch (error) {
        console.error('Error in profile fetch:', error)
        // Set default profile from auth user
        setProfile({
          username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || null,
          email: authUser.email || null,
          profile_url: null
        })
      } finally {
        setIsProfileLoading(false)
      }
    }

    const fetchStorageUsage = async () => {
      try {
        // Get all files for the user
        const { data: files, error } = await supabase
          .from('files')
          .select('size')
          .eq('user_id', authUser.id)
        
        if (error) throw error
        
        // Calculate total size
        const totalSize = files?.reduce((acc, file) => acc + (file.size || 0), 0) || 0
        setStorageUsed(totalSize)
      } catch (error) {
        console.error('Error fetching storage usage:', error)
      }
    }

    fetchProfile()
    fetchStorageUsage()
  }, [authUser])

  if (isAuthLoading || isProfileLoading) return null

  if (!authUser || !profile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="lg\" variant="outline\" className="gap-2">
            <LogInIcon className="h-4 w-4" />
            <span>Login / Signup</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          side={isMobile ? "bottom" : "right"}
          align="end"
          sideOffset={4}
        >
          <DropdownMenuItem asChild>
            <Link to="/auth/login" className="w-full">
              <LogInIcon className="mr-2 h-4 w-4" />
              <span>Login</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/auth/signup" className="w-full">
              <UserPlusIcon className="mr-2 h-4 w-4" />
              <span>Sign Up</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

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
    <SidebarMenu>
      {/* Storage Progress Bar */}
      {authUser && (
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

      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-full bg-gray-300">
                <AvatarImage src={profile.profile_url || ''} alt={profile.username || ''} />
                <AvatarFallback className="rounded-full bg-gray-300">
                  {profile.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {profile.username || authUser.email?.split('@')[0]}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {profile.email || authUser.email}
                </span>
              </div>
              <MoreVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-full bg-gray-300">
                  <AvatarImage src={profile.profile_url || ''} alt={profile.username || ''} />
                  <AvatarFallback className="rounded-full bg-gray-300">
                    {profile.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {profile.username || authUser.email?.split('@')[0]}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {profile.email || authUser.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate('/user/user-profile')}>
                <UserCircleIcon className="mr-2 h-4 w-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/dashboard/billing')}>
                <CreditCardIcon className="mr-2 h-4 w-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOutIcon className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}