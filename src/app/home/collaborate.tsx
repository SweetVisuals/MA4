import { AppSidebar } from "@/components/homepage/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/@/ui/sidebar"
import { SiteHeader } from "@/components/homepage/site-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/@/ui/card"
import { Button } from "@/components/@/ui/button"
import { Input } from "@/components/@/ui/input"
import { Badge } from "@/components/@/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/@/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/@/ui/tabs"
import { Search, MessageSquare, Heart, Share2, Users, Music2, Filter, Plus, PlayCircle, AudioWaveform as Waveform } from "lucide-react"

const collaborationPosts = [
  {
    id: 1,
    title: "Looking for vocalist - Pop/R&B Track",
    author: {
      name: "Alex Johnson",
      avatar: "https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg",
      role: "Producer"
    },
    preview: "https://images.pexels.com/photos/1626481/pexels-photo-1626481.jpeg",
    description: "Working on a pop/R&B track, need a strong vocalist. Demo available for review.",
    genre: "Pop/R&B",
    status: "Open",
    likes: 24,
    comments: 8,
    type: "Collaboration",
    skills: ["Vocals", "R&B", "Pop"],
    posted: "2 hours ago"
  },
  {
    id: 2,
    title: "Feedback needed - New Electronic Track",
    author: {
      name: "Sarah Smith",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
      role: "Artist"
    },
    preview: "https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg",
    description: "Just finished a new electronic track, looking for feedback on mix and arrangement.",
    genre: "Electronic",
    status: "Feedback",
    likes: 15,
    comments: 12,
    type: "Feedback",
    skills: ["Mixing", "Electronic", "Production"],
    posted: "5 hours ago"
  },
  {
    id: 3,
    title: "Guitar Session Needed - Rock Track",
    author: {
      name: "Mike Wilson",
      avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
      role: "Songwriter"
    },
    preview: "https://images.pexels.com/photos/1644616/pexels-photo-1644616.jpeg",
    description: "Need a guitarist for a rock track. Looking for melodic solos and rhythm parts.",
    genre: "Rock",
    status: "Open",
    likes: 18,
    comments: 6,
    type: "Collaboration",
    skills: ["Guitar", "Rock", "Recording"],
    posted: "1 day ago"
  },
  {
    id: 4,
    title: "Mix Review - Hip Hop Track",
    author: {
      name: "Emily Chen",
      avatar: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg",
      role: "Producer"
    },
    preview: "https://images.pexels.com/photos/1537638/pexels-photo-1537638.jpeg",
    description: "Looking for feedback on the mix of my latest hip hop track. Focus on bass and vocals.",
    genre: "Hip Hop",
    status: "Feedback",
    likes: 32,
    comments: 15,
    type: "Feedback",
    skills: ["Mixing", "Hip Hop", "Production"],
    posted: "2 days ago"
  }
];

export default function CollaboratePage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 space-y-8 p-8 pt-6">
          {/* Header Section */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Collaborate</h1>
              <p className="text-muted-foreground">Find collaborators and get feedback on your music</p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Post
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search collaborations..." className="pl-10" />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all" className="gap-2">
                <Music2 className="h-4 w-4" />
                All Posts
              </TabsTrigger>
              <TabsTrigger value="collaborations" className="gap-2">
                <Users className="h-4 w-4" />
                Collaborations
              </TabsTrigger>
              <TabsTrigger value="feedback" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Feedback
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {collaborationPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden">
                    <div className="relative h-48 w-full">
                      <img 
                        src={post.preview} 
                        alt={post.title}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <Badge 
                          variant={post.type === "Collaboration" ? "default" : "secondary"}
                          className="text-sm"
                        >
                          {post.type === "Collaboration" ? (
                            <Users className="mr-1 h-3 w-3" />
                          ) : (
                            <MessageSquare className="mr-1 h-3 w-3" />
                          )}
                          {post.type}
                        </Badge>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" className="h-8">
                            <PlayCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="secondary" size="sm" className="h-8">
                            <Waveform className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle>{post.title}</CardTitle>
                          <CardDescription>{post.description}</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar>
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{post.author.name}</div>
                          <div className="text-sm text-muted-foreground">{post.author.role}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {post.skills.map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between border-t pt-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {post.likes}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {post.comments}
                        </div>
                        <span>{post.posted}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                        <Button size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="collaborations" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {collaborationPosts
                  .filter(post => post.type === "Collaboration")
                  .map((post) => (
                    <Card key={post.id} className="overflow-hidden">
                      {/* Same card structure as above */}
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="feedback" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {collaborationPosts
                  .filter(post => post.type === "Feedback")
                  .map((post) => (
                    <Card key={post.id} className="overflow-hidden">
                      {/* Same card structure as above */}
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}