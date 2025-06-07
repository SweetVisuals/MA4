import { VideoIcon } from "lucide-react"
import { AppSidebar } from "@/components/homepage/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/@/ui/sidebar"
import { SiteHeader } from "@/components/homepage/site-header"
import { TutorialCard } from "@/components/homepage/tutorial-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/@/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"

export default function TutorialsPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <div className="@container/main flex flex-1 flex-col">
          <SiteHeader />
          <div className="flex-1 flex flex-col gap-8 py-4 md:gap-10 md:py-6 px-4">
            <section className="space-y-6">
              <h2 className="text-2xl font-bold">Video Tutorials</h2>
              <Tabs defaultValue="production" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="production">Production</TabsTrigger>
                  <TabsTrigger value="engineering">Sound Engineering</TabsTrigger>
                  <TabsTrigger value="technician">Sound Technician</TabsTrigger>
                  <TabsTrigger value="vocalist">Vocalist</TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <TabsContent value="production">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6"
                    >
                      {[
                        {
                          id: 1,
                          title: "Beat Making Fundamentals",
                          description: "Learn the basics of creating professional beats",
                          duration: "15:30"
                        },
                        {
                          id: 2,
                          title: "MIDI Programming",
                          description: "Advanced techniques for realistic MIDI instruments",
                          duration: "18:45"
                        }
                      ].map((tutorial) => (
                        <TutorialCard
                          key={tutorial.id}
                          title={tutorial.title}
                          description={tutorial.description}
                          duration={tutorial.duration}
                        />
                      ))}
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="engineering">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6"
                    >
                      {[
                        {
                          id: 3,
                          title: "Mixing Vocals",
                          description: "Professional vocal mixing techniques",
                          duration: "22:15"
                        },
                        {
                          id: 4,
                          title: "EQ Masterclass",
                          description: "How to use EQ like a professional",
                          duration: "25:30"
                        }
                      ].map((tutorial) => (
                        <TutorialCard
                          key={tutorial.id}
                          title={tutorial.title}
                          description={tutorial.description}
                          duration={tutorial.duration}
                        />
                      ))}
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="technician">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6"
                    >
                      {[
                        {
                          id: 5,
                          title: "Live Sound Setup",
                          description: "Setting up for live performances",
                          duration: "20:10"
                        },
                        {
                          id: 6,
                          title: "Microphone Techniques",
                          description: "Proper microphone placement and usage",
                          duration: "18:20"
                        }
                      ].map((tutorial) => (
                        <TutorialCard
                          key={tutorial.id}
                          title={tutorial.title}
                          description={tutorial.description}
                          duration={tutorial.duration}
                        />
                      ))}
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="vocalist">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6"
                    >
                      {[
                        {
                          id: 7,
                          title: "Vocal Warmups",
                          description: "Essential exercises for vocalists",
                          duration: "12:45"
                        },
                        {
                          id: 8,
                          title: "Studio Recording",
                          description: "Professional vocal recording techniques",
                          duration: "16:30"
                        }
                      ].map((tutorial) => (
                        <TutorialCard
                          key={tutorial.id}
                          title={tutorial.title}
                          description={tutorial.description}
                          duration={tutorial.duration}
                        />
                      ))}
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>
              </Tabs>
            </section>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
