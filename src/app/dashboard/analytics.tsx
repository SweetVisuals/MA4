import React, { useState, useEffect } from "react"
import { AppSidebar } from "@/components/dashboard/layout/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/@/ui/sidebar"
import { SiteHeader } from "@/components/dashboard/layout/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/@/ui/card"
import { ChartAreaInteractive } from "@/components/dashboard/layout/chart-area-interactive"
import { Button } from "@/components/@/ui/button"
import { Badge } from "@/components/@/ui/badge"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Music2, 
  PlayCircle, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Filter, 
  Loader2,
  Download,
  Gem,
  Heart,
  Share2
} from 'lucide-react'
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/@/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/@/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/@/ui/table"

interface AnalyticsMetrics {
  totalRevenue: number;
  totalPlays: number;
  totalGems: number;
  totalLikes: number;
  totalShares: number;
  uniqueListeners: number;
  revenueChange: number;
  playsChange: number;
  gemsChange: number;
  likesChange: number;
  sharesChange: number;
  listenersChange: number;
}

interface ChartData {
  date: string;
  plays?: number;
  revenue?: number;
  gems?: number;
  likes?: number;
  shares?: number;
  listeners?: number;
}

interface TopTrack {
  id: string;
  title: string;
  plays: number;
  revenue: number;
  gems: number;
  likes: number;
}

interface GeoData {
  country: string;
  plays: number;
  percentage: number;
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalRevenue: 0,
    totalPlays: 0,
    totalGems: 0,
    totalLikes: 0,
    totalShares: 0,
    uniqueListeners: 0,
    revenueChange: 0,
    playsChange: 0,
    gemsChange: 0,
    likesChange: 0,
    sharesChange: 0,
    listenersChange: 0
  })
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [topTracks, setTopTracks] = useState<TopTrack[]>([])
  const [geoData, setGeoData] = useState<GeoData[]>([])
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [activeMetric, setActiveMetric] = useState<'plays' | 'revenue' | 'gems' | 'likes' | 'shares'>('plays')

  useEffect(() => {
    if (user) {
      fetchAnalyticsData()
    }
  }, [user, timeRange])

  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        fetchMetrics(),
        fetchChartData(),
        fetchTopTracks(),
        fetchGeoData()
      ])
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMetrics = async () => {
    try {
      // In a real app, this would fetch from the analytics_events table
      // For demo purposes, we'll generate realistic data
      
      // Generate random metrics with realistic values
      const totalPlays = Math.floor(Math.random() * 800000) + 100000
      const totalRevenue = Math.floor(Math.random() * 40000) + 5000
      const totalGems = Math.floor(Math.random() * 5000) + 500
      const totalLikes = Math.floor(Math.random() * 20000) + 2000
      const totalShares = Math.floor(Math.random() * 3000) + 300
      const uniqueListeners = Math.floor(Math.random() * 100000) + 30000
      
      // Generate percentage changes
      const playsChange = (Math.random() * 30) - 5
      const revenueChange = (Math.random() * 40) - 10
      const gemsChange = (Math.random() * 25) + 5
      const likesChange = (Math.random() * 20) - 2
      const sharesChange = (Math.random() * 15) + 3
      const listenersChange = (Math.random() * 10) - 4
      
      setMetrics({
        totalPlays,
        totalRevenue,
        totalGems,
        totalLikes,
        totalShares,
        uniqueListeners,
        playsChange,
        revenueChange,
        gemsChange,
        likesChange,
        sharesChange,
        listenersChange
      })
    } catch (error) {
      console.error('Error fetching metrics:', error)
    }
  }

  const fetchChartData = async () => {
    try {
      // Generate dates for the selected time range
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      const dates = Array.from({ length: days }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (days - 1 - i))
        return date.toISOString().split('T')[0]
      })
      
      // Generate realistic data with trends
      const data = dates.map(date => {
        const dayOfWeek = new Date(date).getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
        const weekendMultiplier = isWeekend ? 1.5 : 1
        
        // Base values
        const basePlays = Math.floor(Math.random() * 3000) + 1000
        const baseRevenue = Math.floor(Math.random() * 200) + 50
        const baseGems = Math.floor(Math.random() * 50) + 10
        const baseLikes = Math.floor(Math.random() * 100) + 20
        const baseShares = Math.floor(Math.random() * 30) + 5
        const baseListeners = Math.floor(Math.random() * 1000) + 300
        
        return {
          date,
          plays: Math.round(basePlays * weekendMultiplier),
          revenue: Math.round(baseRevenue * weekendMultiplier),
          gems: Math.round(baseGems * weekendMultiplier),
          likes: Math.round(baseLikes * weekendMultiplier),
          shares: Math.round(baseShares * weekendMultiplier),
          listeners: Math.round(baseListeners * weekendMultiplier)
        }
      })
      
      setChartData(data)
    } catch (error) {
      console.error('Error fetching chart data:', error)
    }
  }

  const fetchTopTracks = async () => {
    try {
      // In a real app, this would fetch from the analytics_events table
      // For demo purposes, we'll generate realistic data
      
      const trackNames = [
        "Summer Vibes",
        "Midnight Groove",
        "Electric Dreams",
        "Urban Flow",
        "Chill Wave",
        "Future Bass",
        "Neon Lights",
        "Sunset Drive",
        "City Nights",
        "Ocean Breeze"
      ]
      
      const tracks = trackNames.map((title, index) => {
        const plays = Math.floor(Math.random() * 50000) + 5000
        const revenue = Math.floor(Math.random() * 2000) + 200
        const gems = Math.floor(Math.random() * 500) + 50
        const likes = Math.floor(Math.random() * 2000) + 200
        
        return {
          id: `track-${index + 1}`,
          title,
          plays,
          revenue,
          gems,
          likes
        }
      })
      
      // Sort by plays (descending)
      tracks.sort((a, b) => b.plays - a.plays)
      
      setTopTracks(tracks)
    } catch (error) {
      console.error('Error fetching top tracks:', error)
    }
  }

  const fetchGeoData = async () => {
    try {
      // In a real app, this would fetch from the analytics_events table
      // For demo purposes, we'll generate realistic data
      
      const countries = [
        "United States",
        "United Kingdom",
        "Germany",
        "Canada",
        "Australia",
        "France",
        "Japan",
        "Brazil",
        "Mexico",
        "Spain"
      ]
      
      const totalPlays = 100000
      let remainingPercentage = 100
      
      const data = countries.map((country, index) => {
        // Last country gets the remaining percentage
        if (index === countries.length - 1) {
          return {
            country,
            plays: Math.round((remainingPercentage / 100) * totalPlays),
            percentage: remainingPercentage
          }
        }
        
        // Generate a realistic percentage
        const maxPercentage = remainingPercentage / (countries.length - index)
        const percentage = index === 0 
          ? Math.random() * 20 + 30 // First country gets 30-50%
          : Math.random() * maxPercentage
        
        const roundedPercentage = Math.round(percentage * 10) / 10
        remainingPercentage -= roundedPercentage
        
        return {
          country,
          plays: Math.round((roundedPercentage / 100) * totalPlays),
          percentage: roundedPercentage
        }
      })
      
      setGeoData(data)
    } catch (error) {
      console.error('Error fetching geo data:', error)
    }
  }

  // Helper function to format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 animate-fade-in p-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Analytics</h1>
                <p className="text-muted-foreground">Track your performance and growth</p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={timeRange} onValueChange={(value: '7d' | '30d' | '90d') => setTimeRange(value)}>
                  <SelectTrigger className="w-[180px]">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-9 flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-muted-foreground">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground flex items-center">
                        {metrics.revenueChange >= 0 ? (
                          <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                        )}
                        {metrics.revenueChange >= 0 ? '+' : ''}{metrics.revenueChange.toFixed(1)}% from last period
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
                  <PlayCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-9 flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-muted-foreground">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{formatNumber(metrics.totalPlays)}</div>
                      <p className="text-xs text-muted-foreground flex items-center">
                        {metrics.playsChange >= 0 ? (
                          <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                        )}
                        {metrics.playsChange >= 0 ? '+' : ''}{metrics.playsChange.toFixed(1)}% from last period
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unique Listeners</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-9 flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-muted-foreground">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{formatNumber(metrics.uniqueListeners)}</div>
                      <p className="text-xs text-muted-foreground flex items-center">
                        {metrics.listenersChange >= 0 ? (
                          <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                        )}
                        {metrics.listenersChange >= 0 ? '+' : ''}{metrics.listenersChange.toFixed(1)}% from last period
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Gems</CardTitle>
                  <Gem className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-9 flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-muted-foreground">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{formatNumber(metrics.totalGems)}</div>
                      <p className="text-xs text-muted-foreground flex items-center">
                        {metrics.gemsChange >= 0 ? (
                          <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                        )}
                        {metrics.gemsChange >= 0 ? '+' : ''}{metrics.gemsChange.toFixed(1)}% from last period
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-9 flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-muted-foreground">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{formatNumber(metrics.totalLikes)}</div>
                      <p className="text-xs text-muted-foreground flex items-center">
                        {metrics.likesChange >= 0 ? (
                          <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                        )}
                        {metrics.likesChange >= 0 ? '+' : ''}{metrics.likesChange.toFixed(1)}% from last period
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-9 flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-muted-foreground">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{formatNumber(metrics.totalShares)}</div>
                      <p className="text-xs text-muted-foreground flex items-center">
                        {metrics.sharesChange >= 0 ? (
                          <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                        )}
                        {metrics.sharesChange >= 0 ? '+' : ''}{metrics.sharesChange.toFixed(1)}% from last period
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="plays">Plays</TabsTrigger>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
                <TabsTrigger value="geography">Geography</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Performance Overview</CardTitle>
                        <CardDescription>Track metrics across all your content</CardDescription>
                      </div>
                      <Select value={activeMetric} onValueChange={(value: 'plays' | 'revenue' | 'gems' | 'likes' | 'shares') => setActiveMetric(value)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select metric" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="plays">Plays</SelectItem>
                          <SelectItem value="revenue">Revenue</SelectItem>
                          <SelectItem value="gems">Gems</SelectItem>
                          <SelectItem value="likes">Likes</SelectItem>
                          <SelectItem value="shares">Shares</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <ChartAreaInteractive data={chartData} activeMetric={activeMetric} />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="plays" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Plays Analysis</CardTitle>
                    <CardDescription>Track plays across all your content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <ChartAreaInteractive data={chartData} activeMetric="plays" />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="revenue" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Analysis</CardTitle>
                    <CardDescription>Track your earnings and growth</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <ChartAreaInteractive data={chartData} activeMetric="revenue" />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="engagement" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Analysis</CardTitle>
                    <CardDescription>Track likes, gems, and shares</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Likes</CardTitle>
                          </CardHeader>
                          <CardContent className="h-[200px]">
                            <ChartAreaInteractive data={chartData} activeMetric="likes" />
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Gems</CardTitle>
                          </CardHeader>
                          <CardContent className="h-[200px]">
                            <ChartAreaInteractive data={chartData} activeMetric="gems" />
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Shares</CardTitle>
                          </CardHeader>
                          <CardContent className="h-[200px]">
                            <ChartAreaInteractive data={chartData} activeMetric="shares" />
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="geography" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Geographical Distribution</CardTitle>
                    <CardDescription>Where your listeners are located</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Country</TableHead>
                            <TableHead>Plays</TableHead>
                            <TableHead>Percentage</TableHead>
                            <TableHead>Trend</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {geoData.map((item) => (
                            <TableRow key={item.country}>
                              <TableCell className="font-medium">{item.country}</TableCell>
                              <TableCell>{item.plays.toLocaleString()}</TableCell>
                              <TableCell>{item.percentage}%</TableCell>
                              <TableCell>
                                {Math.random() > 0.5 ? (
                                  <TrendingUp className="h-4 w-4 text-green-500" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 text-red-500" />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Top Performing Content */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
                <CardDescription>Your most successful tracks and content</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Track</TableHead>
                        <TableHead>Plays</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Gems</TableHead>
                        <TableHead>Likes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topTracks.map((track) => (
                        <TableRow key={track.id}>
                          <TableCell className="font-medium">{track.title}</TableCell>
                          <TableCell>{track.plays.toLocaleString()}</TableCell>
                          <TableCell>${track.revenue.toLocaleString()}</TableCell>
                          <TableCell>{track.gems.toLocaleString()}</TableCell>
                          <TableCell>{track.likes.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}