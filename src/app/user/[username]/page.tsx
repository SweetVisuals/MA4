import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import useProfile from "@/hooks/useProfile"
import { Profile } from "@/lib/types"
import ProfileHeader from "@/components/profile/ProfileHeader"
import ProfileInfo from "@/components/profile/ProfileInfo"
import ProfileContent from "@/components/profile/ProfileContent"
import { AppSidebar } from "@/components/homepage/app-sidebar"
import { SiteHeader } from "@/components/homepage/site-header"
import { ScrollArea } from "@/components/@/ui/scroll-area"
import { NavDocuments } from "@/components/homepage/nav-documents"
import { SidebarInset, SidebarProvider } from "@/components/@/ui/sidebar"
import { supabase } from "@/lib/supabase"

import { Settings, User, Home, Library, Mic2, Disc3, Compass, Music2, Users } from "lucide-react"
import { PageLoading } from "@/components/ui/page-loading"

const docItems = [
  { name: 'Profile Settings', url: '/profile/settings', icon: Settings },
  { name: 'Account', url: '/profile/account', icon: User }
];

type UserProfile = Profile & {
  role: string;
  streams: number;
  gems: number;
};

export default function ProfilePage() {
  const { user: authUser } = useAuth()
  const { username } = useParams<{ username: string }>()
  const { profile, stats, loading, error, fetchProfile } = useProfile()
  const [tracks, setTracks] = useState<any[]>([])
  const [playlists, setPlaylists] = useState<any[]>([])
  const [albums, setAlbums] = useState<any[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!username) return
      
      // Check if username is a placeholder for the current user's profile
      if (username === 'user-profile' && authUser?.id) {
        // Use the logged-in user's ID directly
        await fetchProfile(authUser.id)
        return
      }
      
      // Try to find user by username
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle() // Use maybeSingle() to handle zero rows gracefully
      
      if (userError) {
        console.error('Error fetching user:', userError)
        return
      }
      
      if (!userData) {
        console.error('User not found with username:', username)
        return
      }
      
      // Now fetch the complete profile with the user ID
      await fetchProfile(userData.id)
    }
    
    fetchUserData()
  }, [username, fetchProfile, authUser?.id])
  
  // Fetch user content (tracks, playlists, albums)
  useEffect(() => {
    const fetchUserContent = async () => {
      if (!profile?.id) return
      
      try {
        // Fetch tracks
        const { data: tracksData } = await supabase
          .from('audio_tracks')
          .select('*')
          .eq('user_id', profile.id)
        
        if (tracksData) setTracks(tracksData)
        
        // Fetch playlists
        const { data: playlistsData } = await supabase
          .from('playlists')
          .select('*')
          .eq('user_id', profile.id)
        
        if (playlistsData) setPlaylists(playlistsData)
        
        // Fetch albums
        const { data: albumsData } = await supabase
          .from('albums')
          .select('*')
          .eq('user_id', profile.id)
        
        if (albumsData) setAlbums(albumsData)
      } catch (err) {
        console.error('Error fetching user content:', err)
      }
    }
    
    fetchUserContent()
  }, [profile?.id])
  
  // Combine profile with role information
  useEffect(() => {
    if (profile) {
      setUserProfile({
        ...profile,
        role: 'Artist', // Default role or fetch from a roles table if available
        streams: stats?.streams || 0,
        gems: stats?.gems || 0
      })
    }
  }, [profile, stats])

  if (loading || !userProfile) {
    return <PageLoading />
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-2xl font-bold mb-2">Error Loading Profile</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset">
        <NavDocuments items={docItems} />
      </AppSidebar>
      <SidebarInset>
        <div className="@container/main flex flex-1 flex-col">
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <ScrollArea className="h-screen">
        <div className="flex flex-col">
          <ProfileHeader 
            user={authUser || { id: '' }}
            profile={userProfile}
            stats={stats || {
              user_id: userProfile.id,
              streams: userProfile.streams || 0,
              followers: 0,
              gems: userProfile.gems || 0,
              tracks: tracks.length,
              playlists: playlists.length,
              albums: albums.length
            }}
          />
          <ProfileInfo 
            user={authUser}
            profile={userProfile}
            isLoading={loading}
          />
          <div className="container max-w-6xl mx-auto px-4 md:px-6 -mt-6 pb-12">
            <ProfileContent 
              user={userProfile}
              stats={stats || {
                user_id: userProfile.id,
                streams: userProfile.streams || 0,
                followers: 0,
                gems: userProfile.gems || 0,
                tracks: tracks.length,
                playlists: playlists.length,
                albums: albums.length
              }}
              tracks={tracks}
              playlists={playlists}
              albums={albums}
            />
          </div>
        </div>
      </ScrollArea>
    </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}