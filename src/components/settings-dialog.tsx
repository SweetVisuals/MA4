import * as React from "react"
import {
  Bell,
  Check,
  Globe,
  Home,
  Keyboard,
  Link,
  Lock,
  Menu,
  MessageCircle,
  Paintbrush,
  Settings,
  Video,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import useProfile from "@/hooks/useProfile"
import { Profile } from "@/lib/types"

const profileFormSchema = z.object({
  full_name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string",
  }).min(2, {
    message: "Name must be at least 2 characters.",
  }),
  username: z.string({
    required_error: "Username is required",
    invalid_type_error: "Username must be a string",
  }).min(3, {
    message: "Username must be at least 3 characters.",
  }),
  bio: z.string({
    invalid_type_error: "Bio must be a string",
  }).max(500, {
    message: "Bio must not exceed 500 characters.",
  }).optional(),
  location: z.string({
    invalid_type_error: "Location must be a string",
  }).nullable().optional(),
  website: z.string({
    invalid_type_error: "Website must be a string",
  }).nullable().optional(),
  professionalTitle: z.string({
    invalid_type_error: "Professional title must be a string",
  }).nullable().optional(),
  genres: z.string({
    invalid_type_error: "Genres must be a string",
  }).nullable().optional(),
  instruments: z.string({
    invalid_type_error: "Instruments must be a string",
  }).nullable().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

const data = {
  nav: [
    { name: "Profile", icon: Paintbrush },
    { name: "Appearance", icon: Paintbrush },
    { name: "Privacy", icon: Lock },
    { name: "Notifications", icon: Bell },
    { name: "Connected accounts", icon: Link },
  ],
}

interface SettingsDialogProps {
  children?: React.ReactNode;
}

export function SettingsDialog({ children }: SettingsDialogProps) {
  const [open, setOpen] = React.useState(false)
  const { profile, updateProfile } = useProfile()
  const [activeTab, setActiveTab] = React.useState("Profile")

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      username: profile?.username || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
      website: profile?.website || "",
      professionalTitle: profile?.professionalTitle || "",
      genres: profile?.genres?.join(", ") || "",
      instruments: profile?.instruments?.join(", ") || "",
    },
  })

  React.useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
        professionalTitle: profile.professionalTitle || "",
        genres: profile.genres?.join(", ") || "",
        instruments: profile.instruments?.join(", ") || "",
      })
    }
  }, [profile, form])

  async function onSubmit(data: ProfileFormValues) {
      try {
        const payload: Partial<Profile> = { id: profile?.id };

        // Only include fields that have changed
        if (data.full_name !== profile?.full_name) {
          payload.full_name = data.full_name || undefined;
        }
        if (data.bio !== profile?.bio) {
          payload.bio = data.bio || undefined;
        }
        if (data.location !== profile?.location) {
          payload.location = data.location || undefined;
        }
        if (data.website !== profile?.website) {
          payload.website = data.website || undefined;
        }
        if (data.professionalTitle !== profile?.professionalTitle) {
          payload.professionalTitle = data.professionalTitle || undefined;
        }
        if (data.genres !== profile?.genres?.join(', ')) {
          payload.genres = data.genres 
            ? data.genres.split(",").map(g => g.trim()).filter(Boolean) 
            : undefined;
        }
        if (data.instruments !== profile?.instruments?.join(', ')) {
          payload.instruments = data.instruments 
            ? data.instruments.split(",").map(i => i.trim()).filter(Boolean) 
            : undefined;
        }

        await updateProfile(payload);
        setOpen(false);
    } catch (error: any) {
      if (error && error.message) {
        console.error("Failed to update profile (Supabase):", error.message);
      } else {
        console.error("Failed to update profile:", error);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children || (
        <DialogTrigger asChild>
          <Button size="sm">Open Dialog</Button>
        </DialogTrigger>
      )}
      <DialogContent className="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Customize your settings here.
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {data.nav.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={activeTab === item.name}
                          onClick={() => setActiveTab(item.name)}
                        >
                          <button type="button">
                            <item.icon />
                            <span>{item.name}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-[480px] flex-1 flex-col overflow-hidden">
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">Settings</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{activeTab}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
              {activeTab === "Profile" && (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Your username" 
                              {...field} 
                              disabled
                              className="opacity-70 cursor-not-allowed"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Username cannot be changed
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about yourself"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Your location" 
                              {...field} 
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://example.com" 
                              {...field} 
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="professionalTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Title</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Producer, Engineer, etc." 
                              {...field} 
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="genres"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Genres</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Hip Hop, Electronic, etc." 
                              {...field} 
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormDescription>
                            Separate multiple genres with commas
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="instruments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instruments</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Guitar, Piano, etc." 
                              {...field} 
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormDescription>
                            Separate multiple instruments with commas
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Save changes</Button>
                    </div>
                  </form>
                </Form>
              )}
              {activeTab === "Appearance" && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Appearance settings coming soon</p>
                </div>
              )}
              {activeTab === "Privacy" && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Privacy settings coming soon</p>
                </div>
              )}
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  )
}
