import { Separator } from "@/components/@/ui/separator"
import { SidebarTrigger } from "@/components/@/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/@/ui/avatar"
import { Button } from "@/components/@/ui/button"
import { Badge } from "@/components/@/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/@/ui/dropdown-menu"
import { Bell, Settings, LogOut, User, MessageSquare, LayoutGrid, Wallet, Gem } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { ThemeToggle } from "@/components/theme-toggle"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useLocation, Link } from "react-router-dom"
import { useMessages } from "@/hooks/useMessages"

export function SiteHeader() {
  const { user, isLoading, signOut } = useAuth()
  const [gemBalance, setGemBalance] = useState<number>(0)
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [unreadMessages, setUnreadMessages] = useState<number>(0)
  const location = useLocation()
  const { unreadCount } = useMessages(user?.id || '')

  // Get the current page name from the location
  const getCurrentPageName = () => {
    const path = location.pathname
    
    if (path === '/user/dashboard' || path === '/dashboard') {
      return 'Dashboard'
    }
    
    // Extract the last part of the path and capitalize it
    const pathSegments = path.split('/')
    const lastSegment = pathSegments[pathSegments.length - 1]
    
    if (!lastSegment) return 'Dashboard'
    
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
  }

  // Fetch user's gem and wallet balance
  useEffect(() => {
    if (!user) return

    const fetchUserStats = async () => {
      try {
        const { data, error } = await supabase
          .from('user_stats')
          .select('gems')
          .eq('user_id', user.id)
          .single()
        
        if (error) throw error
        
        if (data) {
          setGemBalance(data.gems || 0)
        }
      } catch (error) {
        console.error('Error fetching user stats:', error)
      }
    }

    const fetchUserWallet = async () => {
      try {
        const { data, error } = await supabase
          .from('user_wallets')
          .select('balance')
          .eq('user_id', user.id)
          .maybeSingle()
        
        if (error) throw error
        
        if (data) {
          setWalletBalance(Number(data.balance) || 0)
        } else {
          // Create wallet if it doesn't exist
          await createUserWallet()
        }
      } catch (error) {
        console.error('Error fetching user wallet:', error)
      }
    }

    const createUserWallet = async () => {
      try {
        const { data, error } = await supabase
          .from('user_wallets')
          .insert([
            { user_id: user.id, balance: 0 }
          ])
          .select()
        
        if (error) throw error
        
        if (data && data[0]) {
          setWalletBalance(Number(data[0].balance) || 0)
        }
      } catch (error) {
        console.error('Error creating user wallet:', error)
      }
    }

    fetchUserStats()
    fetchUserWallet()

    // Listen for gem balance updates
    const handleGemBalanceUpdate = () => {
      fetchUserStats()
    }

    window.addEventListener('gem-balance-update', handleGemBalanceUpdate)
    
    return () => {
      window.removeEventListener('gem-balance-update', handleGemBalanceUpdate)
    }
  }, [user])

  // Update unread messages count from the hook
  useEffect(() => {
    setUnreadMessages(unreadCount);
  }, [unreadCount]);

  if (isLoading) return null

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">{getCurrentPageName()}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20">
              <Wallet className="h-4 w-4" />
              <span>${walletBalance.toFixed(2)}</span>
            </Badge>
            <Badge variant="default" className="flex items-center gap-2 bg-violet-500/10 text-violet-500 hover:bg-violet-500/20">
              <Gem className="h-4 w-4" />
              <span>{gemBalance}</span>
            </Badge>
          </div>
          <ThemeToggle />
          {!user ? (
            <Button asChild variant="ghost\" size="sm">
              <a href="/auth/login">
                Login
              </a>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <a href="/upload">Upload</a>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <MessageSquare className="h-5 w-5" />
                    {unreadMessages > 0 && (
                      <span className="absolute -right-0 mr-2 mt-2 -top-0 h-2.5 w-2.5 rounded-full bg-blue-500" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Messages</span>
                    {unreadMessages > 0 && (
                      <Badge variant="secondary" className="ml-2">{unreadMessages} new</Badge>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">John Doe</p>
                        <p className="text-xs text-muted-foreground">Hey, how's it going?</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg" />
                        <AvatarFallback>AS</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Sarah Smith</p>
                        <p className="text-xs text-muted-foreground">Let's collaborate!</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="justify-center text-sm text-blue-500">
                    <Link to="/messages">View all messages</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -right-0 mr-2 mt-2 -top-0 h-2.5 w-2.5 rounded-full bg-red-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 p-1 rounded-full">
                        <User className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">New follower</p>
                        <p className="text-xs text-muted-foreground">Jane Doe followed you</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 p-1 rounded-full">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">New comment</p>
                        <p className="text-xs text-muted-foreground">On your track 'Sunset'</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="justify-center text-sm text-blue-500">
                    View all notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 bg-gray-300">
                      <AvatarFallback className="bg-gray-300" />
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={`/user/${user.user_metadata?.username || 'profile'}`}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/user/dashboard">
                      <LayoutGrid className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/messages">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Messages
                      {unreadMessages > 0 && (
                        <Badge variant="secondary\" className="ml-auto">{unreadMessages}</Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  )
}