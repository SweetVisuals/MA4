import { AppSidebar } from "@/components/homepage/app-sidebar"
import { SiteHeader } from "@/components/homepage/site-header"
import { SidebarInset, SidebarProvider } from "@/components/@/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/@/ui/card"
import { Input } from "@/components/@/ui/input"
import { Label } from "@/components/@/ui/label"
import { Button } from "@/components/@/ui/button"
import { Badge } from "@/components/@/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/@/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/@/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/@/ui/select"
import { Search, Star, MessageSquare, Heart, Briefcase, Clock, DollarSign, Filter } from "lucide-react"

const services = [
  {
    id: 1,
    title: "Professional Mixing & Mastering",
    provider: {
      name: "Alex Johnson",
      avatar: "https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg",
      rating: 4.9,
      reviews: 128
    },
    description: "High-quality mixing and mastering with analog warmth and professional polish",
    price: 150,
    deliveryTime: "2-3 days",
    category: "Mix & Master",
    tags: ["Mixing", "Mastering", "Analog", "Professional"]
  },
  {
    id: 2,
    title: "Custom Beat Production",
    provider: {
      name: "Sarah Smith",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
      rating: 4.8,
      reviews: 96
    },
    description: "Custom beats tailored to your style and vision. Any genre, any style.",
    price: 200,
    deliveryTime: "3-5 days",
    category: "Production",
    tags: ["Beats", "Production", "Custom", "All Genres"]
  },
  {
    id: 3,
    title: "Vocal Recording & Tuning",
    provider: {
      name: "Mike Wilson",
      avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
      rating: 4.9,
      reviews: 156
    },
    description: "Professional vocal recording and tuning with state-of-the-art equipment",
    price: 120,
    deliveryTime: "1-2 days",
    category: "Recording",
    tags: ["Vocals", "Recording", "Tuning", "Professional"]
  },
  {
    id: 4,
    title: "Sound Design & Effects",
    provider: {
      name: "Emily Chen",
      avatar: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg",
      rating: 4.7,
      reviews: 84
    },
    description: "Custom sound design and effects for your productions",
    price: 180,
    deliveryTime: "2-4 days",
    category: "Sound Design",
    tags: ["Sound Design", "Effects", "Custom", "Creative"]
  }
];

const categories = [
  "All Categories",
  "Mix & Master", 
  "Production",
  "Recording",
  "Sound Design",
  "Composition",
  "Arrangement"
];

export default function FindTalentPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 space-y-8 p-8 pt-6">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search for services..."
                  className="pl-10"
                />
              </div>
              <Select defaultValue="All Categories">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>

            <Tabs defaultValue="services" className="w-full">
              <TabsList>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="providers">Service Providers</TabsTrigger>
              </TabsList>

              <TabsContent value="services" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {services.map((service) => (
                    <Card key={service.id} className="flex flex-col">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle>{service.title}</CardTitle>
                            <CardDescription>{service.description}</CardDescription>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <Avatar>
                            <AvatarImage src={service.provider.avatar} />
                            <AvatarFallback>{service.provider.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{service.provider.name}</div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                                {service.provider.rating}
                              </div>
                              <span>•</span>
                              <div>{service.provider.reviews} reviews</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {service.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="flex items-center justify-between border-t pt-4">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {service.deliveryTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            Starting at ${service.price}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Contact
                          </Button>
                          <Button size="sm">
                            Book Now
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="providers">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <Card key={service.id}>
                      <CardHeader>
                        <div className="flex flex-col items-center text-center">
                          <Avatar className="h-20 w-20 mb-4">
                            <AvatarImage src={service.provider.avatar} />
                            <AvatarFallback>{service.provider.name[0]}</AvatarFallback>
                          </Avatar>
                          <CardTitle>{service.provider.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-2">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {service.provider.rating} ({service.provider.reviews} reviews)
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <Badge variant="secondary" className="mb-4">
                            <Briefcase className="h-3 w-3 mr-1" />
                            {service.category}
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {service.description}
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-center gap-2">
                        <Button variant="outline">View Profile</Button>
                        <Button>Hire Now</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}