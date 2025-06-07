import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/homepage/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/@/ui/sidebar";
import { SiteHeader } from "@/components/homepage/site-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/@/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/@/ui/badge";
import { Input } from "@/components/@/ui/input";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2, 
  Download, 
  Search, 
  Filter, 
  FileText, 
  ShoppingBag,
  Calendar,
  Eye,
  ExternalLink,
  Package
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/@/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/@/ui/dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface OrderItem {
  id: string;
  title: string;
  price: number;
  type?: string;
}

interface Order {
  id: string;
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'processing';
  total: number;
  items: OrderItem[];
  processingFee: number;
  tax: number;
  attachmentUrl?: string;
  attachmentName?: string;
}

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<{url: string, name: string} | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Sample orders data - in a real app, this would come from your database
  const sampleOrders: Order[] = [
    {
      id: "ORD-001",
      date: "2024-03-15",
      status: "completed",
      total: 332.99,
      processingFee: 9.00,
      tax: 24.00,
      items: [
        {
          id: "item-001",
          title: "Summer Vibes Beat",
          price: 299.99,
          type: "Beat"
        }
      ],
      attachmentUrl: "https://example.com/files/summer-vibes-beat.mp3",
      attachmentName: "summer-vibes-beat.mp3"
    },
    {
      id: "ORD-002",
      date: "2024-03-10",
      status: "completed",
      total: 554.99,
      processingFee: 15.00,
      tax: 40.00,
      items: [
        {
          id: "item-002",
          title: "Mix & Master Service",
          price: 499.99,
          type: "Service"
        }
      ],
      attachmentUrl: "https://example.com/files/track-to-mix.wav",
      attachmentName: "track-to-mix.wav"
    },
    {
      id: "ORD-003",
      date: "2024-02-28",
      status: "completed",
      total: 99.89,
      processingFee: 2.70,
      tax: 7.20,
      items: [
        {
          id: "item-003",
          title: "Lo-Fi Beat Collection",
          price: 89.99,
          type: "Beat Pack"
        }
      ],
      attachmentUrl: "https://example.com/files/lofi-collection.zip",
      attachmentName: "lofi-collection.zip"
    }
  ];

  useEffect(() => {
    // In a real app, fetch orders from your database
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOrders(sampleOrders);
        setFilteredOrders(sampleOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [user]);

  useEffect(() => {
    // Apply filters when search query or status filter changes
    let filtered = [...orders];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(query) || 
        order.items.some(item => item.title.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(filtered);
  }, [orders, searchQuery, statusFilter]);

  const handleViewAttachment = (attachment: {url: string, name: string}) => {
    setSelectedAttachment(attachment);
    setShowAttachmentDialog(true);
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
                <p className="text-muted-foreground">View your past orders and downloads</p>
              </div>
            </div>

            {/* Filters */}
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
                <select
                  className="flex h-10 w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Orders List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Orders</CardTitle>
                <CardDescription>View and manage your past orders</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No orders found</h3>
                    <p className="text-muted-foreground">You haven't placed any orders yet</p>
                    <Button 
                      className="mt-4"
                      onClick={() => navigate('/')}
                    >
                      Browse Products
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <React.Fragment key={order.id}>
                            <TableRow 
                              className="cursor-pointer" 
                              onClick={() => toggleOrderExpansion(order.id)}
                            >
                              <TableCell className="font-medium">{order.id}</TableCell>
                              <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                              <TableCell>
                                {order.items.length === 1 
                                  ? order.items[0].title 
                                  : `${order.items.length} items`}
                              </TableCell>
                              <TableCell>${order.total.toFixed(2)}</TableCell>
                              <TableCell>{getStatusBadge(order.status)}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" className="gap-1">
                                  {expandedOrder === order.id ? "Hide" : "View"} Details
                                </Button>
                              </TableCell>
                            </TableRow>
                            
                            {/* Expanded Order Details */}
                            {expandedOrder === order.id && (
                              <TableRow>
                                <TableCell colSpan={6} className="bg-muted/50 p-4">
                                  <div className="space-y-4">
                                    {/* Order Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-medium mb-2">Order Information</h4>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex items-center gap-2">
                                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Order ID:</span>
                                            <span>{order.id}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Date:</span>
                                            <span>{new Date(order.date).toLocaleDateString()}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Status:</span>
                                            <span>{getStatusBadge(order.status)}</span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <h4 className="font-medium mb-2">Payment Information</h4>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Payment Method:</span>
                                            <span>Credit Card</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Subtotal:</span>
                                            <span>${(order.total - order.processingFee - order.tax).toFixed(2)}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Processing Fee:</span>
                                            <span>${order.processingFee.toFixed(2)}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Tax:</span>
                                            <span>${order.tax.toFixed(2)}</span>
                                          </div>
                                          <div className="flex items-center gap-2 font-bold">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span>Total:</span>
                                            <span>${order.total.toFixed(2)}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Order Items */}
                                    <div>
                                      <h4 className="font-medium mb-2">Order Items</h4>
                                      <div className="rounded-md border">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>Item</TableHead>
                                              <TableHead>Type</TableHead>
                                              <TableHead>Price</TableHead>
                                              <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {order.items.map((item) => (
                                              <TableRow key={item.id}>
                                                <TableCell>{item.title}</TableCell>
                                                <TableCell>{item.type || 'Beat'}</TableCell>
                                                <TableCell>${item.price.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">
                                                  {order.attachmentUrl && (
                                                    <Button 
                                                      variant="ghost" 
                                                      size="sm"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewAttachment({
                                                          url: order.attachmentUrl!,
                                                          name: order.attachmentName || item.title
                                                        });
                                                      }}
                                                    >
                                                      <Eye className="h-4 w-4 mr-2" />
                                                      View
                                                    </Button>
                                                  )}
                                                  <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      if (order.attachmentUrl) {
                                                        window.open(order.attachmentUrl, '_blank');
                                                      }
                                                    }}
                                                  >
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download
                                                  </Button>
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="flex justify-end gap-2 mt-4">
                                      <Button variant="outline" size="sm" className="gap-2">
                                        <Download className="h-4 w-4" />
                                        Invoice
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        className="gap-2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate('/dashboard/orders');
                                        }}
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                        View in Dashboard
                                      </Button>
                                    </div>
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
                      <FileText className="h-16 w-16 text-primary/50" />
                    </div>
                    <audio controls className="w-full">
                      <source src={selectedAttachment?.url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                ) : selectedAttachment?.name.endsWith('.zip') ? (
                  <div className="text-center">
                    <Package className="h-16 w-16 mx-auto text-primary/50 mb-4" />
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