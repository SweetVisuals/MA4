import { useAuth } from "@/contexts/auth-context"
import { SiteHeader } from "@/components/homepage/site-header"
import { AppSidebar } from "@/components/homepage/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/@/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/@/ui/avatar"
import { Badge } from "@/components/@/ui/badge"
import { Star, Headphones, Music, Mic2, TrendingUp, Rocket } from "lucide-react"
import ProjectCard from "@/components/profile/music/ProjectCard"

const topProducers = [
  {
    name: "Alex Johnson",
    avatar: "https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg",
    genre: "House",
    rating: 4.9,
    projects: 24
  },
  {
    name: "Sarah Smith",
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
    genre: "Hip Hop",
    rating: 4.8,
    projects: 18
  },
  {
    name: "Mike Wilson",
    avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
    genre: "R&B",
    rating: 4.7,
    projects: 32
  }
];

const categories = [
  { name: "Beats & Instrumentals", icon: Music, count: 1245 },
  { name: "Vocal Production", icon: Mic2, count: 856 },
  { name: "Mixing & Mastering", icon: Headphones, count: 932 },
  { name: "Sound Design", icon: Star, count: 647 }
];

const trendingProjects = [
  {
    id: "1",
    title: "Summer Vibes EP",
    artworkUrl: "https://images.pexels.com/photos/1626481/pexels-photo-1626481.jpeg",
    tracks: [
      { id: "1-1", title: "Summer Breeze", duration: "3:45" },
      { id: "1-2", title: "Ocean Waves", duration: "4:12" },
      { id: "1-3", title: "Sunset Dreams", duration: "3:56" }
    ],
    totalTracks: 3,
    isPopular: true,
    creator: {
      name: "Alex Johnson",
      avatar: "https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg",
      tag: "Producer"
    }
  },
  {
    id: "2",
    title: "Late Night Beats",
    artworkUrl: "https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg",
    tracks: [
      { id: "2-1", title: "Midnight Groove", duration: "3:22" },
      { id: "2-2", title: "City Lights", duration: "4:05" },
      { id: "2-3", title: "Urban Flow", duration: "3:48" }
    ],
    totalTracks: 3,
    isPopular: true,
    creator: {
      name: "Sarah Smith",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
      tag: "Beat Maker"
    }
  },
  {
    id: "3",
    title: "Soul Sessions",
    artworkUrl: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg",
    tracks: [
      { id: "3-1", title: "Soulful Morning", duration: "4:15" },
      { id: "3-2", title: "Rhythm & Blues", duration: "3:58" },
      { id: "3-3", title: "Heart & Soul", duration: "4:22" }
    ],
    totalTracks: 3,
    isPopular: false,
    creator: {
      name: "Mike Wilson",
      avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
      tag: "Soul Artist"
    }
  },
  {
    id: "4",
    title: "Electronic Dreams",
    artworkUrl: "https://images.pexels.com/photos/1694900/pexels-photo-1694900.jpeg",
    tracks: [
      { id: "4-1", title: "Digital Love", duration: "3:35" },
      { id: "4-2", title: "Cyber Space", duration: "4:18" },
      { id: "4-3", title: "Future Beats", duration: "3:42" }
    ],
    totalTracks: 3,
    isPopular: true,
    creator: {
      name: "Emily Chen",
      avatar: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg",
      tag: "Electronic Producer"
    }
  },
  {
    id: "5",
    title: "Urban Nights",
    artworkUrl: "https://images.pexels.com/photos/1537638/pexels-photo-1537638.jpeg",
    tracks: [
      { id: "5-1", title: "Street Life", duration: "3:52" },
      { id: "5-2", title: "City Dreams", duration: "4:08" },
      { id: "5-3", title: "Night Rider", duration: "3:45" }
    ],
    totalTracks: 3,
    isPopular: false,
    creator: {
      name: "Jason Lee",
      avatar: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg",
      tag: "Urban Producer"
    }
  },
  {
    id: "6",
    title: "Acoustic Stories",
    artworkUrl: "https://images.pexels.com/photos/1751731/pexels-photo-1751731.jpeg",
    tracks: [
      { id: "6-1", title: "Wooden Heart", duration: "3:28" },
      { id: "6-2", title: "Simple Times", duration: "4:02" },
      { id: "6-3", title: "Pure Sound", duration: "3:38" }
    ],
    totalTracks: 3,
    isPopular: true,
    creator: {
      name: "Sophia Martinez",
      avatar: "https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg",
      tag: "Acoustic Artist"
    }
  },
  {
    id: "7",
    title: "Jazz Fusion",
    artworkUrl: "https://images.pexels.com/photos/1644616/pexels-photo-1644616.jpeg",
    tracks: [
      { id: "7-1", title: "Smooth Jazz", duration: "4:25" },
      { id: "7-2", title: "Fusion Flow", duration: "3:55" },
      { id: "7-3", title: "Jazz Life", duration: "4:15" }
    ],
    totalTracks: 3,
    isPopular: false,
    creator: {
      name: "David Kim",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg",
      tag: "Jazz Musician"
    }
  },
  {
    id: "8",
    title: "Future Bass",
    artworkUrl: "https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg",
    tracks: [
      { id: "8-1", title: "Bass Drop", duration: "3:32" },
      { id: "8-2", title: "Future Sound", duration: "4:12" },
      { id: "8-3", title: "Electronic Vibes", duration: "3:48" }
    ],
    totalTracks: 3,
    isPopular: true,
    creator: {
      name: "Olivia Taylor",
      avatar: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg",
      tag: "EDM Producer"
    }
  }
];

export default function HomePage() {
  const { user } = useAuth()

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <div className="@container/main flex flex-1 flex-col">
          <SiteHeader />
          
          <div className="flex-1 space-y-8 p-8 pt-6">
            {/* Categories */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-4">Browse</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <Card key={category.name} className="hover:bg-accent transition-colors cursor-pointer">
                    <CardContent className="flex items-center gap-4 p-4">
                      <category.icon className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.count} items</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Top Producers */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-4">Top Producers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topProducers.map((producer) => (
                  <Card key={producer.name}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={producer.avatar} />
                        <AvatarFallback>{producer.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium">{producer.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary">{producer.genre}</Badge>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current text-yellow-500" />
                            {producer.rating}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Trending Now */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight">Trending Now</h2>
                </div>
                <Button variant="outline">View All</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {trendingProjects.map((project) => (
                  <ProjectCard 
                    key={project.id}
                    project={project}
                    variant="grid"
                    id={project.id}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}