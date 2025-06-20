import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/dashboard/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/@/ui/sidebar";
import { SiteHeader } from "@/components/dashboard/layout/site-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/@/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/@/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/@/ui/tabs";
import { Input } from "@/components/@/ui/input";
import { 
  ChevronDown, 
  ChevronUp, 
  CreditCard, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Search,
  Filter,
  ArrowUpRight,
  Download,
  FileText,
  Loader2,
  DollarSign,
  ShoppingBag,
  Package,
  Headphones,
  Music2,
  BarChart3,
  MessageSquare,
  ExternalLink,
  Eye
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/@/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/@/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/@/ui/avatar";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/@/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Order {
  id: string;
  type: 'beat' | 'service';
  title: string;
  price: number;
  status: 'completed' | 'pending' | 'failed' | 'processing';
  paymentMethod: string;
  date: string;
  customer: {
    name: string;
    email: string;
    location: string;
    avatar?: string;
    id?: string;
    username?: string;
  };
  details?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  notes?: string;
  processingFee?: number;
  tax?: number;
  total?: number;
  items?: Array<{
    id: string;
    title: string;
    price: number;
    type?: string;
  }>;
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  failedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  repeatCustomers: number;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [orderStats, setOrderStats] = useState<OrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    failedOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    repeatCustomers: 0
  });
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{id: string, name: string} | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<{url: string, name: string} | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<string | null>(null);

  // Sample orders data
  const sampleOrders: Order[] = [
    {
      id: "ORD-001",
      type: "beat",
      title: "Summer Vibes Beat",
      price: 299.99,
      status: "completed",
      paymentMethod: "Credit Card",
      date: "2024-03-15",
      customer: {
        id: "cust-001",
        username: "johndoe",
        name: "John Doe",
        email: "john@example.com",
        location: "New York, USA",
        avatar: "https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg"
      },
      details: "Exclusive rights purchase",
      attachmentUrl: "https://example.com/files/summer-vibes-beat.mp3",
      attachmentName: "summer-vibes-beat.mp3",
      notes: "Customer requested minor adjustments to the hi-hats. Delivered final version on March 16.",
      processingFee: 9.00,
      tax: 24.00,
      total: 332.99,
      items: [
        {
          id: "item-001",
          title: "Summer Vibes Beat",
          price: 299.99,
          type: "Beat"
        }
      ]
    },
    {
      id: "ORD-002",
      type: "service",
      title: "Mix & Master",
      price: 499.99,
      status: "pending",
      paymentMethod: "PayPal",
      date: "2024-03-14",
      customer: {
        id: "cust-002",
        username: "janesmith",
        name: "Jane Smith",
        email: "jane@example.com",
        location: "London, UK",
        avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg"
      },
      details: "Full track mixing and mastering",
      attachmentUrl: "https://example.com/files/track-to-mix.wav",
      attachmentName: "track-to-mix.wav",
      notes: "Client needs this by March 20 for release.",
      processingFee: 15.00,
      tax: 40.00,
      total: 554.99,
      items: [
        {
          id: "item-002",
          title: "Mix & Master Service",
          price: 499.99,
          type: "Service"
        }
      ]
    },
    {
      id: "ORD-003",
      type: "beat",
      title: "Trap Beat Pack",
      price: 149.99,
      status: "failed",
      paymentMethod: "Credit Card",
      date: "2024-03-13",
      customer: {
        id: "cust-003",
        username: "mikewilson",
        name: "Mike Wilson",
        email: "mike@example.com",
        location: "Toronto, Canada",
        avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg"
      },
      details: "5-beat pack with basic license",
      attachmentUrl: "https://example.com/files/trap-pack.zip",
      attachmentName: "trap-pack.zip",
      notes: "Payment failed due to card issues. Customer plans to try again.",
      processingFee: 4.50,
      tax: 12.00,
      total: 166.49,
      items: [
        {
          id: "item-003",
          title: "Trap Beat Pack",
          price: 149.99,
          type: "Beat Pack"
        }
      ]
    },
    {
      id: "ORD-004",
      type: "service",
      title: "Vocal Tuning",
      price: 199.99,
      status: "processing",
      paymentMethod: "Bank Transfer",
      date: "2024-03-12",
      customer: {
        id: "cust-004",
        username: "emilychen",
        name: "Emily Chen",
        email: "emily@example.com",
        location: "Los Angeles, USA",
        avatar: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg"
      },
      details: "Vocal tuning and processing for 3 tracks",
      attachmentUrl: "https://example.com/files/vocals.zip",
      attachmentName: "vocals.zip",
      notes: "Customer requested natural-sounding tuning. Estimated delivery: March 18.",
      processingFee: 6.00,
      tax: 16.00,
      total: 221.99,
      items: [
        {
          id: "item-004",
          title: "Vocal Tuning Service",
          price: 199.99,
          type: "Service"
        }
      ]
    },
    {
      id: "ORD-005",
      type: "beat",
      title: "Lo-Fi Beat Collection",
      price: 89.99,
      status: "completed",
      paymentMethod: "Credit Card",
      date: "2024-03-11",
      customer: {
        id: "cust-005",
        username: "davidkim",
        name: "David Kim",
        email: "david@example.com",
        location: "Seoul, South Korea",
        avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg"
      },
      details: "10 lo-fi beats with standard license",
      attachmentUrl: "https://example.com/files/lofi-collection.zip",
      attachmentName: "lofi-collection.zip",
      notes: "Customer was very satisfied with the collection. Left a 5-star review.",
      processingFee: 2.70,
      tax: 7.20,
      total: 99.89,
      items: [
        {
          id: "item-005",
          title: "Lo-Fi Beat Collection",
          price: 89.99,
          type: "Beat Pack"
        }
      ]
    },
    {
      id: "ORD-006",
      type: "service",
      title: "Custom Beat Production",
      price: 599.99,
      status: "completed",
      paymentMethod: "PayPal",
      date: "2024-03-10",
      customer: {
        id: "cust-006",
        username: "sophiamartinez",
        name: "Sophia Martinez",
        email: "sophia@example.com",
        location: "Madrid, Spain",
        avatar: "https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg"
      },
      details: "Custom beat production with revisions",
      attachmentUrl: "https://example.com/files/custom-beat-final.wav",
      attachmentName: "custom-beat-final.wav",
      notes: "Required 3 revision rounds. Final version delivered on March 14.",
      processingFee: 18.00,
      tax: 48.00,
      total: 665.99,
      items: [
        {
          id: "item-006",
          title: "Custom Beat Production",
          price: 599.99,
          type: "Service"
        }
      ]
    }
  ];

  useEffect(() => {
    // In a real app, fetch orders from the database
    // For demo purposes, we'll use the sample data
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOrders(sampleOrders);
        
        // Apply initial filter
        setFilteredOrders(sampleOrders);
        
        // Calculate order stats
        calculateOrderStats(sampleOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [user, timeRange]);

  useEffect(() => {
    // Apply filters when search query, status filter, or type filter changes
    let filtered = [...orders];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.title.toLowerCase().includes(query) || 
        order.customer.name.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(order => order.type === typeFilter);
    }
    
    setFilteredOrders(filtered);
  }, [orders, searchQuery, statusFilter, typeFilter]);

  const calculateOrderStats = (orders: Order[]) => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === "pending").length;
    const completedOrders = orders.filter(order => order.status === "completed").length;
    const failedOrders = orders.filter(order => order.status === "failed").length;
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || order.price), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Calculate unique customers for repeat customer rate
    const uniqueCustomers = new Set(orders.map(order => order.customer.email)).size;
    const repeatCustomers = Math.round((totalOrders - uniqueCustomers) / totalOrders * 100);
    
    // Simulate conversion rate
    const conversionRate = Math.round(Math.random() * 10 + 5);
    
    setOrderStats({
      totalOrders,
      pendingOrders,
      completedOrders,
      failedOrders,
      totalRevenue,
      averageOrderValue,
      conversionRate,
      repeatCustomers
    });
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(prevId => prevId === orderId ? null : orderId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500 flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500 flex items-center gap-1"><XCircle className="h-3 w-3" /> Failed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500/10 text-blue-500 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Processing</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'beat':
        return <Badge variant="outline" className="flex items-center gap-1"><Music2 className="h-3 w-3" /> Beat</Badge>;
      case 'service':
        return <Badge variant="outline" className="flex items-center gap-1"><Headphones className="h-3 w-3" /> Service</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: 'completed' | 'pending' | 'failed' | 'processing') => {
    setStatusUpdateLoading(orderId);
    
    try {
      // Simulate API call to update status
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update order status in local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      // Recalculate stats
      calculateOrderStats(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      toast.success(`Order ${orderId} status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  const handleMessageCustomer = (customer: {id: string, name: string}) => {
    setSelectedCustomer(customer);
    setMessageContent("");
    setShowMessageDialog(true);
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedCustomer) return;
    
    try {
      // Simulate sending message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Message sent to ${selectedCustomer.name}`);
      setShowMessageDialog(false);
      setMessageContent("");
      setSelectedCustomer(null);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleViewAttachment = (attachment: {url: string, name: string}) => {
    setSelectedAttachment(attachment);
    setShowAttachmentDialog(true);
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 animate-fade-in p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Order History</h1>
                <p className="text-muted-foreground">View and manage your orders</p>
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
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {/* Total Orders */}
              <Card className="col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-9 flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-muted-foreground">Loading...</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold">{orderStats.totalOrders}</div>
                  )}
                </CardContent>
              </Card>

              {/* Total Revenue */}
              <Card className="col-span-2">
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
                    <div className="text-2xl font-bold">{formatCurrency(orderStats.totalRevenue)}</div>
                  )}
                </CardContent>
              </Card>

              {/* Average Order Value */}
              <Card className="col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Order</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-9 flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-muted-foreground">Loading...</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold">{formatCurrency(orderStats.averageOrderValue)}</div>
                  )}
                </CardContent>
              </Card>

              {/* Conversion Rate */}
              <Card className="col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-9 flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-muted-foreground">Loading...</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold">{orderStats.conversionRate}%</div>
                  )}
                </CardContent>
              </Card>

              {/* Order Status Metrics */}
              <Card className="col-span-2 md:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{orderStats.pendingOrders}</div>
                </CardContent>
              </Card>

              <Card className="col-span-2 md:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{orderStats.completedOrders}</div>
                </CardContent>
              </Card>

              <Card className="col-span-2 md:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium">Failed</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{orderStats.failedOrders}</div>
                </CardContent>
              </Card>

              <Card className="col-span-2 md:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium">Repeat Customers</CardTitle>
                  <User className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{orderStats.repeatCustomers}%</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="beat">Beats</SelectItem>
                    <SelectItem value="service">Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Orders Table */}
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>Manage your beat sales and service orders</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No orders found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or search query</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <React.Fragment key={order.id}>
                            <TableRow className="cursor-pointer" onClick={() => toggleOrderExpansion(order.id)}>
                              <TableCell className="font-medium">{order.id}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={order.customer.avatar} />
                                    <AvatarFallback>{order.customer.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <Button 
                                      variant="link" 
                                      className="h-auto p-0 font-medium text-left"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Navigate to customer profile
                                        if (order.customer.username) {
                                          window.open(`/user/${order.customer.username}`, '_blank');
                                        }
                                      }}
                                    >
                                      {order.customer.name}
                                    </Button>
                                    <div className="text-xs text-muted-foreground">{order.customer.email}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="link" 
                                  className="h-auto p-0 text-left"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (order.attachmentUrl && order.attachmentName) {
                                      handleViewAttachment({
                                        url: order.attachmentUrl,
                                        name: order.attachmentName
                                      });
                                    }
                                  }}
                                >
                                  {order.title}
                                </Button>
                              </TableCell>
                              <TableCell>{getTypeBadge(order.type)}</TableCell>
                              <TableCell>${(order.total || order.price).toFixed(2)}</TableCell>
                              <TableCell>{getStatusBadge(order.status)}</TableCell>
                              <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" className="gap-1">
                                  {expandedOrder === order.id ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                  Details
                                </Button>
                              </TableCell>
                            </TableRow>
                            {expandedOrder === order.id && (
                              <TableRow>
                                <TableCell colSpan={8} className="bg-muted/50 p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Customer Information</h4>
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                          <User className="h-4 w-4 text-muted-foreground" />
                                          <span className="font-medium">Name:</span>
                                          <Button 
                                            variant="link" 
                                            className="h-auto p-0"
                                            onClick={() => {
                                              if (order.customer.username) {
                                                window.open(`/user/${order.customer.username}`, '_blank');
                                              }
                                            }}
                                          >
                                            {order.customer.name}
                                            <ExternalLink className="h-3 w-3 ml-1" />
                                          </Button>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                          <Mail className="h-4 w-4 text-muted-foreground" />
                                          <span className="font-medium">Email:</span>
                                          <span>{order.customer.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                          <MapPin className="h-4 w-4 text-muted-foreground" />
                                          <span className="font-medium">Location:</span>
                                          <span>{order.customer.location}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-2">Order Details</h4>
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                          <FileText className="h-4 w-4 text-muted-foreground" />
                                          <span className="font-medium">Description:</span>
                                          <span>{order.details}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                                          <span className="font-medium">Payment Method:</span>
                                          <span>{order.paymentMethod}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                          <Calendar className="h-4 w-4 text-muted-foreground" />
                                          <span className="font-medium">Order Date:</span>
                                          <span>{new Date(order.date).toLocaleDateString()}</span>
                                        </div>
                                        {order.attachmentUrl && (
                                          <div className="flex items-center gap-2 text-sm">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Attachment:</span>
                                            <Button 
                                              variant="link" 
                                              className="h-auto p-0"
                                              onClick={() => handleViewAttachment({
                                                url: order.attachmentUrl!,
                                                name: order.attachmentName || 'attachment'
                                              })}
                                            >
                                              {order.attachmentName || 'View attachment'}
                                              <Eye className="h-3 w-3 ml-1" />
                                            </Button>
                                          </div>
                                        )}
                                        {order.notes && (
                                          <div className="flex gap-2 text-sm mt-2">
                                            <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                            <div>
                                              <span className="font-medium">Notes:</span>
                                              <p className="text-muted-foreground mt-1">{order.notes}</p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Order Items */}
                                  {order.items && order.items.length > 0 && (
                                    <div className="mt-4 border-t pt-4">
                                      <h4 className="font-medium mb-2">Order Items</h4>
                                      <div className="rounded-md border">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>Item</TableHead>
                                              <TableHead>Type</TableHead>
                                              <TableHead className="text-right">Price</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {order.items.map((item) => (
                                              <TableRow key={item.id}>
                                                <TableCell>{item.title}</TableCell>
                                                <TableCell>{item.type || 'Beat'}</TableCell>
                                                <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                                              </TableRow>
                                            ))}
                                            {order.processingFee && (
                                              <TableRow>
                                                <TableCell colSpan={2} className="text-right font-medium">Processing Fee (3%)</TableCell>
                                                <TableCell className="text-right">${order.processingFee.toFixed(2)}</TableCell>
                                              </TableRow>
                                            )}
                                            {order.tax && (
                                              <TableRow>
                                                <TableCell colSpan={2} className="text-right font-medium">Tax (8%)</TableCell>
                                                <TableCell className="text-right">${order.tax.toFixed(2)}</TableCell>
                                              </TableRow>
                                            )}
                                            <TableRow>
                                              <TableCell colSpan={2} className="text-right font-bold">Total</TableCell>
                                              <TableCell className="text-right font-bold">${(order.total || order.price).toFixed(2)}</TableCell>
                                            </TableRow>
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="mt-4 border-t pt-4">
                                    <h4 className="font-medium mb-2">Update Status</h4>
                                    <div className="flex flex-wrap gap-2">
                                      <Button 
                                        variant={order.status === "pending" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleUpdateStatus(order.id, "pending")}
                                        disabled={statusUpdateLoading === order.id || order.status === "pending"}
                                      >
                                        {statusUpdateLoading === order.id ? (
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                          <Clock className="h-4 w-4 mr-2" />
                                        )}
                                        Pending
                                      </Button>
                                      <Button 
                                        variant={order.status === "processing" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleUpdateStatus(order.id, "processing")}
                                        disabled={statusUpdateLoading === order.id || order.status === "processing"}
                                      >
                                        {statusUpdateLoading === order.id ? (
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                          <Loader2 className="h-4 w-4 mr-2" />
                                        )}
                                        Processing
                                      </Button>
                                      <Button 
                                        variant={order.status === "completed" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleUpdateStatus(order.id, "completed")}
                                        disabled={statusUpdateLoading === order.id || order.status === "completed"}
                                      >
                                        {statusUpdateLoading === order.id ? (
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                        )}
                                        Completed
                                      </Button>
                                      <Button 
                                        variant={order.status === "failed" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleUpdateStatus(order.id, "failed")}
                                        disabled={statusUpdateLoading === order.id || order.status === "failed"}
                                      >
                                        {statusUpdateLoading === order.id ? (
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                          <XCircle className="h-4 w-4 mr-2" />
                                        )}
                                        Failed
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-end gap-2 mt-4">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="gap-2"
                                      onClick={() => handleMessageCustomer({
                                        id: order.customer.id || 'unknown',
                                        name: order.customer.name
                                      })}
                                    >
                                      <MessageSquare className="h-4 w-4" />
                                      Message Customer
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-2">
                                      <Download className="h-4 w-4" />
                                      Invoice
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredOrders.length} of {orders.length} orders
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={filteredOrders.length === 0}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={filteredOrders.length === 0}>
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </SidebarInset>

      {/* Message Customer Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Message to {selectedCustomer?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Type your message here..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={!messageContent.trim()}>
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Attachment Dialog */}
      <Dialog open={showAttachmentDialog} onOpenChange={setShowAttachmentDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Attachment: {selectedAttachment?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border rounded-md p-4 bg-muted/50">
              <div className="flex items-center justify-center p-8 bg-muted rounded-md">
                {selectedAttachment?.name.endsWith('.mp3') || selectedAttachment?.name.endsWith('.wav') ? (
                  <div className="w-full">
                    <div className="flex items-center justify-center mb-4">
                      <Music2 className="h-16 w-16 text-primary/50" />
                    </div>
                    <audio controls className="w-full">
                      <source src={selectedAttachment?.url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                ) : selectedAttachment?.name.endsWith('.zip') ? (
                  <div className="text-center">
                    <CustomPackage className="h-16 w-16 mx-auto text-primary/50 mb-4" />
                    <p className="text-muted-foreground">Archive file</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <FileText className="h-16 w-16 mx-auto text-primary/50 mb-4" />
                    <p className="text-muted-foreground">File preview not available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAttachmentDialog(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                if (selectedAttachment?.url) {
                  window.open(selectedAttachment.url, '_blank');
                }
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

function Mail(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function MapPin(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function CustomPackage(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  )
}