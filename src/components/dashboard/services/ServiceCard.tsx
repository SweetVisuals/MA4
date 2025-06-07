import { useState } from 'react';
import { Card, CardContent } from "@/components/@/ui/card";
import { Badge } from "@/components/@/ui/badge";
import { Button } from "@/components/ui/button";
import { Service } from "@/lib/types";
import { Pencil, Trash2, Check, X, MessageSquare, Calendar, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/@/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ServiceCardProps {
  service: Service;
  onUpdate: () => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}

// Define the form schema with Zod
const serviceFormSchema = z.object({
  title: z.string().min(3, {
    message: "Service title must be at least 3 characters.",
  }).max(100, {
    message: "Service title must not exceed 100 characters."
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }).max(1000, {
    message: "Description must not exceed 1000 characters."
  }),
  price: z.coerce.number().min(0, {
    message: "Price must be a positive number.",
  }).nullable(),
  delivery_time: z.string().nullable(),
  revisions: z.coerce.number().min(0).nullable(),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export function ServiceCard({ service, onUpdate, onDelete, onToggleStatus }: ServiceCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: service.title,
      description: service.description,
      price: service.price,
      delivery_time: service.delivery_time,
      revisions: service.revisions,
    },
  });

  const handleEdit = async (values: ServiceFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('services')
        .update({
          title: values.title,
          description: values.description,
          price: values.price,
          delivery_time: values.delivery_time,
          revisions: values.revisions,
        })
        .eq('id', service.id);
      
      if (error) throw error;
      
      toast.success('Service updated successfully');
      setIsEditDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
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
                    <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{service.delivery_time}</span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {service.description}
              </p>
              
              <div className="flex items-center gap-2 mt-3">
                {service.revisions !== null && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <RefreshCw className="h-3 w-3" />
                    <span>{service.revisions} revision{service.revisions !== 1 ? 's' : ''}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  <span>Contact for details</span>
                </div>
              </div>
            </div>
            <div className="flex md:flex-col justify-end gap-2 p-4 bg-muted/30 md:w-48">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant={service.is_active ? "outline" : "default"}
                size="sm"
                onClick={() => onToggleStatus(service.id, service.is_active)}
              >
                {service.is_active ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => onDelete(service.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleEdit)} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Service Title</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  defaultValue={service.title}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  defaultValue={service.description}
                  className="min-h-[120px]"
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    {...form.register("price", { valueAsNumber: true })}
                    defaultValue={service.price || ''}
                  />
                  {form.formState.errors.price && (
                    <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="delivery_time">Delivery Time</Label>
                  <Input
                    id="delivery_time"
                    {...form.register("delivery_time")}
                    defaultValue={service.delivery_time || ''}
                  />
                  {form.formState.errors.delivery_time && (
                    <p className="text-sm text-destructive">{form.formState.errors.delivery_time.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="revisions">Revisions</Label>
                <Input
                  id="revisions"
                  type="number"
                  {...form.register("revisions", { valueAsNumber: true })}
                  defaultValue={service.revisions || ''}
                />
                {form.formState.errors.revisions && (
                  <p className="text-sm text-destructive">{form.formState.errors.revisions.message}</p>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}