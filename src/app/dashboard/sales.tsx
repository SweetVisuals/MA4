import { useState } from "react";
import { AppSidebar } from "@/components/dashboard/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/@/ui/sidebar";
import { SiteHeader } from "@/components/dashboard/layout/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/@/ui/card";
import { Button } from "@/components/@/ui/button";
import { Input } from "@/components/@/ui/input";
import { Badge } from "@/components/@/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/@/ui/avatar";
import { ChartAreaInteractive } from "@/components/dashboard/layout/chart-area-interactive";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/@/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/@/ui/dropdown-menu";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Music2, 
  Download, 
  Users, 
  Search,
  Filter,
  MoreVertical,
  ArrowUpRight,
  Calendar
} from "lucide-react";

const recentSales = [
  {
    id: "1",
    track: "Summer Vibes",
    buyer: {
      name: "John Doe",
      email: "john@example.com",
      avatar: "https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg"
    },
    amount: 29.99,
    license: "Standard",
    date: "2024-03-15",
    status: "completed"
  },
  {
    id: "2",
    track: "Night Drive",
    buyer: {
      name: "Sarah Smith",
      email: "sarah@example.com",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg"
    },
    amount: 49.99,
    license: "Extended",
    date: "2024-03-14",
    status: "completed"
  },
  {
    id: "3",
    track: "Chill Beats",
    buyer: {
      name: "Mike Wilson",
      email: "mike@example.com",
      avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg"
    },
    amount: 19.99,
    license: "Basic",
    date: "2024-03-13",
    status: "completed"
  }
];

export default function SalesPage() {
  const [dateRange, setDateRange] = useState("7d");

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
                <h1 className="text-2xl font-bold">Sales Overview</h1>
                <p className="text-muted-foreground">Track your audio sales and revenue</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Last 7 days
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$4,231.89</div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <Music2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">145</div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Downloads</CardTitle>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">892</div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    +8.5% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">48</div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                    -4% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sales Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Analytics</CardTitle>
                <CardDescription>Track your sales performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartAreaInteractive />
              </CardContent>
            </Card>

            {/* Recent Sales */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>Your latest audio file sales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="Search sales..." className="pl-9" />
                    </div>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Track</TableHead>
                          <TableHead>Buyer</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>License</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentSales.map((sale) => (
                          <TableRow key={sale.id}>
                            <TableCell className="font-medium">{sale.track}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={sale.buyer.avatar} />
                                  <AvatarFallback>{sale.buyer.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{sale.buyer.name}</span>
                                  <span className="text-xs text-muted-foreground">{sale.buyer.email}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>${sale.amount}</TableCell>
                            <TableCell>{sale.license}</TableCell>
                            <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="capitalize">
                                {sale.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Download Invoice</DropdownMenuItem>
                                  <DropdownMenuItem>Contact Buyer</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Selling Tracks */}
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Tracks</CardTitle>
                <CardDescription>Your best performing audio files</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Music2 className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">Summer Vibes {item}</h4>
                        <p className="text-sm text-muted-foreground">
                          {Math.floor(Math.random() * 100)} sales this month
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(Math.random() * 1000).toFixed(2)}</p>
                        <div className="flex items-center gap-1 text-sm text-green-500">
                          <ArrowUpRight className="h-3 w-3" />
                          <span>12.5%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}