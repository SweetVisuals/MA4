import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { AppSidebar } from "@/components/dashboard/layout/app-sidebar"
import { SectionCards } from "@/components/dashboard/layout/section-cards"
import { SiteHeader } from "@/components/dashboard/layout/site-header"
import { SidebarInset, SidebarProvider } from "@/components/@/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/@/ui/badge"
import { Loader2, Check, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/@/ui/select"

const serviceTypes = [
  "Mix & Mastering",
  "Production",
  "Sound Technician",
  "Vocal Recording",
  "Instrument Recording",
  "Audio Editing",
  "Composition",
  "Arrangement",
  "Sound Design",
  "Podcast Production"
]

// Define the form schema with Zod
const serviceFormSchema = z.object({
  title: z.string().min(3, {
    message: "Service title must be at least 3 characters.",
  }).max(100, {
    message: "Service title must not exceed 100 characters."
  }),
  type: z.string({
    required_error: "Please select a service type.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }).max(1000, {
    message: "Description must not exceed 1000 characters."
  }),
  price: z.coerce.number().min(0, {
    message: "Price must be a positive number.",
  }).optional(),
  delivery_time: z.string().optional(),
  revisions: z.coerce.number().min(0).optional(),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
})

type ServiceFormValues = z.infer<typeof serviceFormSchema>

interface Service {
  id: string
  title: string
  type: string
  description: string
  price: number | null
  delivery_time: string | null
  revisions: number | null
  is_featured: boolean
  is_active: boolean
  created_at: string
  user_id: string
}

export default function ServicesPage() {
  const { user } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    active: 0
  })

  // Initialize the form with react-hook-form
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: "",
      type: "",
      description: "",
      price: undefined,
      delivery_time: "",
      revisions: undefined,
      is_featured: false,
      is_active: true,
    },
  })

  // Fetch user's services
  useEffect(() => {
    if (user) {
      fetchServices()
    }
  }, [user])

  const fetchServices = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setServices(data || [])
      
      // Calculate stats
      const total = data?.length || 0
      const active = data?.filter(service => service.is_active).length || 0
      setStats({ total, active })
    } catch (error) {
      console.error('Error fetching services:', error)
      toast.error('Failed to load services')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (values: ServiceFormValues) => {
    if (!user) {
      toast.error('You must be logged in to post a service')
      return
    }
    
    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('services')
        .insert([
          {
            ...values,
            user_id: user.id,
          }
        ])
        .select()
      
      if (error) throw error
      
      toast.success('Service posted successfully')
      form.reset()
      fetchServices()
    } catch (error) {
      console.error('Error posting service:', error)
      toast.error('Failed to post service')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleServiceStatus = async (serviceId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !isActive })
        .eq('id', serviceId)
      
      if (error) throw error
      
      // Update local state
      setServices(prev => 
        prev.map(service => 
          service.id === serviceId 
            ? { ...service, is_active: !isActive } 
            : service
        )
      )
      
      // Update stats
      setStats(prev => ({
        ...prev,
        active: isActive 
          ? prev.active - 1 
          : prev.active + 1
      }))
      
      toast.success(`Service ${isActive ? 'deactivated' : 'activated'}`)
    } catch (error) {
      console.error('Error toggling service status:', error)
      toast.error('Failed to update service')
    }
  }

  const deleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return
    
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)
      
      if (error) throw error
      
      // Update local state
      const deletedService = services.find(s => s.id === serviceId)
      setServices(prev => prev.filter(service => service.id !== serviceId))
      
      // Update stats
      setStats(prev => ({
        total: prev.total - 1,
        active: deletedService?.is_active ? prev.active - 1 : prev.active
      }))
      
      toast.success('Service deleted successfully')
    } catch (error) {
      console.error('Error deleting service:', error)
      toast.error('Failed to delete service')
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              
              <div className="grid grid-cols-1 gap-6 px-4 lg:grid-cols-3 lg:px-6">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Post a Service</CardTitle>
                    <CardDescription>
                      Offer your professional services to the community
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Title</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Professional Mixing" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Type</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a service type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {serviceTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe your service in detail" 
                                  className="min-h-[120px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Include what you offer, your experience, and what makes your service unique.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price (USD)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="e.g. 50" 
                                    {...field}
                                    onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Leave empty for "Contact for pricing"
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="delivery_time"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Delivery Time</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. 2-3 days" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="revisions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Revisions</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="e.g. 3" 
                                  {...field}
                                  onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>
                                Number of revisions included
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full mt-4"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Posting...
                            </>
                          ) : (
                            'Post Service'
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
                
                <Card className="lg:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Your Services</CardTitle>
                      <CardDescription>Manage your posted services</CardDescription>
                    </div>
                    {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                  </CardHeader>
                  <CardContent>
                    {services.length === 0 && !isLoading ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-2">No services posted yet</p>
                        <p className="text-sm text-muted-foreground">
                          Use the form to post your first service and start getting clients.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {services.map(service => (
                          <Card key={service.id} className="overflow-hidden">
                            <CardContent className="p-0">
                              <div className="flex flex-col md:flex-row">
                                <div className="flex-1 p-4">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h3 className="font-medium">{service.title}</h3>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline">{service.type}</Badge>
                                        <Badge 
                                          variant={service.is_active ? "default" : "secondary"}
                                          className="text-xs"
                                        >
                                          {service.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      {service.price ? (
                                        <p className="font-medium">${service.price}</p>
                                      ) : (
                                        <p className="text-sm text-muted-foreground">Contact for pricing</p>
                                      )}
                                      {service.delivery_time && (
                                        <p className="text-xs text-muted-foreground">{service.delivery_time}</p>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                    {service.description}
                                  </p>
                                </div>
                                <div className="flex md:flex-col justify-end gap-2 p-4 bg-muted/30 md:w-48">
                                  <Button 
                                    variant={service.is_active ? "outline" : "default"}
                                    size="sm"
                                    onClick={() => toggleServiceStatus(service.id, service.is_active)}
                                  >
                                    {service.is_active ? 'Deactivate' : 'Activate'}
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => deleteService(service.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Service Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Total Services</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                      </div>
                      <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Active Services</p>
                        <p className="text-2xl font-bold">{stats.active}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {services.length === 0 ? (
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-muted"></div>
                        <div>
                          <p className="text-sm font-medium">No recent activity</p>
                          <p className="text-sm text-muted-foreground">When you post services, activity will appear here</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {services.slice(0, 3).map(service => (
                          <div key={service.id} className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Check className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Service Posted</p>
                              <p className="text-sm text-muted-foreground">
                                You posted "{service.title}" on {new Date(service.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}