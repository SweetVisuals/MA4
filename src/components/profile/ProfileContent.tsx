import { useState, useEffect } from 'react';
import { UserProfile, ProfileStats } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/@/ui/tabs';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableTabTrigger } from '@/components/profile/SortableTabTrigger';
import { Disc3, ListMusic, Album, User, LayoutGrid, List } from 'lucide-react';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/@/ui/toggle-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/@/ui/dropdown-menu';
import { Button } from '@/components/@/ui/button';
import ProjectsTab from './tabs/ProjectsTab';
import PlaylistsTab from './tabs/PlaylistsTab';
import AlbumsTab from './tabs/AlbumsTab';
import AboutTab from './tabs/AboutTab';

interface ProfileContentProps {
  user: UserProfile;
  stats: ProfileStats | null; // Allow stats to be null
  tracks: any[]; // TODO: Replace 'any' with specific types (Track[])
  playlists: any[]; // TODO: Replace 'any' with specific types (Playlist[])
  albums: any[]; // TODO: Replace 'any' with specific types (Album[])
}

const ProfileContent = ({ user, stats, tracks, playlists, albums }: ProfileContentProps) => {
  if (!user) return null;
  const { disabledTabs = [] } = user;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'oldest'>('latest');
  const [tabOrder, setTabOrder] = useState<Array<'projects' | 'playlists' | 'albums' | 'about'>>([]);

  useEffect(() => {
    // Load saved tab order from localStorage or use default
    const savedOrder = localStorage.getItem('profileTabOrder');
    const defaultOrder = ["projects", "playlists", "albums", "about"];
    setTabOrder(savedOrder ? JSON.parse(savedOrder) : defaultOrder);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;

    if (!over || active.id === over.id) return;
      setTabOrder((items) => {
        const oldIndex = items.indexOf(active.id as 'projects' | 'playlists' | 'albums' | 'about');
        const newIndex = items.indexOf(over.id as 'projects' | 'playlists' | 'albums' | 'about');
        const newOrder = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem('profileTabOrder', JSON.stringify(newOrder));
        return newOrder;
      });
    };

  const enabledTabs = tabOrder.filter(
    tab => !disabledTabs.includes(tab)
  );

  if (enabledTabs.length === 0) {
    return <div className="mt-8 text-center text-muted-foreground">No tabs enabled</div>;
  }

  return (
    <Tabs defaultValue={user.defaultTab || "projects"} className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={enabledTabs}
            strategy={verticalListSortingStrategy}
          >
            <TabsList className="justify-start gap-1 bg-transparent p-0">
              {enabledTabs.map((tab) => {
                const iconMap: Record<string, JSX.Element> = {
                  projects: <Disc3 className="h-4 w-4 mr-2" />,
                  playlists: <ListMusic className="h-4 w-4 mr-2" />,
                  albums: <Album className="h-4 w-4 mr-2" />,
                  about: <User className="h-4 w-4 mr-2" />,
                };
                
                const labelMap: Record<string, string> = {
                  projects: "Projects",
                  playlists: "Sound Packs", 
                  albums: "Services",
                  about: "About",
                };

                return (
                  <SortableTabTrigger
                    key={tab}
                    id={tab}
                    value={tab}
                    className="px-4 py-2 transition-all duration-300 ease-in-out
                      hover:bg-accent/50 hover:scale-[1.02]
                      data-[state=active]:bg-primary/10 data-[state=active]:text-primary
                      data-[state=active]:shadow-sm data-[state=active]:border-b-2
                      data-[state=active]:border-primary rounded-lg
                      cursor-grab active:cursor-grabbing"
                  >
                    {iconMap[tab]}
                    {labelMap[tab]}
                  </SortableTabTrigger>
                );
              })}
            </TabsList>
          </SortableContext>
        </DndContext>

        <div className="flex items-center gap-4">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => {
              if (value) setViewMode(value as 'grid' | 'list');
            }}
            className="bg-muted p-1 rounded-lg"
          >
            <ToggleGroupItem
              value="grid"
              aria-label="Grid view"
              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="list"
              aria-label="List view"
              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Sort by: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy('latest')}>
                Latest
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('popular')}>
                Most popular
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                Oldest
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <TabsContent value="projects" className="animate-fade-in">
        <ProjectsTab viewMode={viewMode} sortBy={sortBy} tracks={tracks} stats={stats} /> {/* Pass stats prop */}
      </TabsContent>
      <TabsContent value="playlists" className="animate-fade-in">
        <PlaylistsTab />
      </TabsContent>
      <TabsContent value="albums" className="animate-fade-in">
        <AlbumsTab />
      </TabsContent>
      <TabsContent value="about" className="animate-fade-in">
        <AboutTab user={user} />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileContent;
