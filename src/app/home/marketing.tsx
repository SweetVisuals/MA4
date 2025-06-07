import { AppSidebar } from "@/components/homepage/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/@/ui/sidebar"
import { SiteHeader } from "@/components/homepage/site-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/@/ui/card"
import { Button } from "@/components/@/ui/button"
import { Input } from "@/components/@/ui/input"
import { Badge } from "@/components/@/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/@/ui/avatar"
import { Search, MessageSquare, Youtube, Instagram, Music2, Globe, TrendingUp, Users, PlayCircle } from "lucide-react"

const platforms = [
  {
    id: 1,
    name: "Music Vibes",
    type: "YouTube Channel",
    icon: Youtube,
    avatar: "https://images.pexels.com/photos/7129796/pexels-photo-7129796.jpeg",
    subscribers: "1.2M",
    description: "Music promotion and artist features on our growing YouTube channel",
    services: [
      {
        name: "Music Video Feature",
        price: 500,
        reach: "100k+ views"
      },
      {
        name: "Channel Playlist Add",
        price: 200,
        reach: "50k+ streams"
      }
    ],
    stats: {
      avgViews: "150k",
      engagement: "8.5%",
      audience: "Music Enthusiasts"
    }
  },
  {
    id: 2,
    name: "Beats & Vibes",
    type: "Instagram",
    icon: Instagram,
    avatar: "https://images.pexels.com/photos/7129694/pexels-photo-7129694.jpeg",
    subscribers: "850K",
    description: "Instagram music promotion and artist spotlights",
    services: [
      {
        name: "Story Feature",
        price: 300,
        reach: "50k+ views"
      },
      {
        name: "Feed Post",
        price: 450,
        reach: "75k+ reach"
      }
    ],
    stats: {
      avgViews: "75k",
      engagement: "4.2%",
      audience: "Young Adults"
    }
  },
  {
    id: 3,
    name: "Global Beats",
    type: "Music Blog",
    icon: Globe,
    avatar: "https://images.pexels.com/photos/7129674/pexels-photo-7129674.jpeg",
    subscribers: "500K",
    description: "Leading music blog featuring emerging artists and new releases",
    services: [
      {
        name: "Featured Article",
        price: 350,
        reach: "25k+ reads"
      },
      {
        name: "Homepage Feature",
        price: 600,
        reach: "40k+ impressions"
      }
    ],
    stats: {
      avgViews: "30k",
      engagement: "5.8%",
      audience: "Industry Professionals"
    }
  },
  {
    id: 4,
    name: "Music Network",
    type: "Multi-Platform",
    icon: Music2,
    avatar: "https://images.pexels.com/photos/7129645/pexels-photo-7129645.jpeg",
    subscribers: "2M+",
    description: "Cross-platform music promotion network",
    services: [
      {
        name: "Network Package",
        price: 1000,
        reach: "200k+ reach"
      },
      {
        name: "Premium Feature",
        price: 1500,
        reach: "300k+ exposure"
      }
    ],
    stats: {
      avgViews: "250k",
      engagement: "6.5%",
      audience: "Global Music Fans"
    }
  }
];

export default function MarketingPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 space-y-8 p-8 pt-6">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Marketing Platforms</h1>
                <p className="text-muted-foreground">Connect with top music promotion platforms and influencers</p>
              </div>
              <div className="flex gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search platforms..." className="pl-10" />
                </div>
                <Button>
                  List Your Platform
                </Button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">5M+</p>
                    <p className="text-sm text-muted-foreground">Total Reach</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">50+</p>
                    <p className="text-sm text-muted-foreground">Active Platforms</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <PlayCircle className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">10K+</p>
                    <p className="text-sm text-muted-foreground">Artists Promoted</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Platforms Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {platforms.map((platform) => (
              <Card key={platform.id} className="overflow-hidden">
                <CardHeader className="border-b bg-muted/50 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={platform.avatar} />
                        <AvatarFallback>
                          <platform.icon className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {platform.name}
                          <Badge variant="secondary" className="ml-2">
                            <platform.icon className="mr-1 h-3 w-3" />
                            {platform.type}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {platform.subscribers} subscribers
                        </CardDescription>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Contact
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 p-6">
                  <p className="text-sm text-muted-foreground">{platform.description}</p>
                  
                  <div className="grid gap-4">
                    <h4 className="font-medium">Available Services</h4>
                    <div className="grid gap-2">
                      {platform.services.map((service, index) => (
                        <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-sm text-muted-foreground">{service.reach}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${service.price}</p>
                            <Button variant="outline" size="sm" className="mt-2">
                              Book Now
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Platform Stats</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="rounded-lg border p-2 text-center">
                        <p className="font-medium">{platform.stats.avgViews}</p>
                        <p className="text-muted-foreground">Avg. Views</p>
                      </div>
                      <div className="rounded-lg border p-2 text-center">
                        <p className="font-medium">{platform.stats.engagement}</p>
                        <p className="text-muted-foreground">Engagement</p>
                      </div>
                      <div className="rounded-lg border p-2 text-center">
                        <p className="font-medium">{platform.stats.audience}</p>
                        <p className="text-muted-foreground">Audience</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}