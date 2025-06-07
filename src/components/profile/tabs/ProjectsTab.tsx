import React, { useState } from 'react';
import useProfile from '@/hooks/useProfile';
import { useTracks } from '@/hooks/useTracks';
import { useAuth } from '@/contexts/auth-context';
import ProjectCard from '../music/ProjectCard';
import { ProfileStats } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus, Music, Upload } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/@/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/@/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface ProjectsTabProps {
  viewMode?: 'grid' | 'list';
  sortBy?: 'latest' | 'popular' | 'oldest';
  tracks?: any[];
  stats?: ProfileStats | null;
}

const ProjectsTab = ({ viewMode = 'grid', sortBy = 'latest', tracks: propTracks, stats }: ProjectsTabProps) => {
  const { profile } = useProfile();
  const { user: currentUser } = useAuth();
  const userId = profile?.id;
  const isOwner = currentUser?.id === userId;
  const { tracks: hookTracks, loading, error, fetchTracks } = useTracks(userId || '');
  
  // Use provided tracks from props if available, otherwise use tracks from hook
  const tracksToUse = propTracks || hookTracks;

  // State for create project dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: false
  });

  // Handle project creation
  const handleCreateProject = async () => {
    if (!userId) {
      toast.error("You must be logged in to create a project");
      return;
    }
    
    if (!formData.title.trim()) {
      toast.error("Please enter a title for your project");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create a new project
      const projectId = uuidv4();
      const { error: projectError } = await supabase
        .from('projects')
        .insert({
          id: projectId,
          user_id: userId,
          title: formData.title,
          description: formData.description,
          is_public: formData.isPublic,
          type: 'audio',
          genre: 'Other'
        });
      
      if (projectError) throw projectError;
      
      toast.success("Project created successfully!");
      setShowCreateDialog(false);
      setFormData({ title: '', description: '', isPublic: false });
      
      // Refresh tracks/projects
      fetchTracks();
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error("Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userId) return <div className="p-4">Please log in to view your projects.</div>;
  if (loading) return <div className="p-4 animate-pulse">Loading projects...</div>;
  if (error) return <div className="p-4 text-destructive">Error: {error}</div>;
  
  // Optionally sort tracks (implement sort logic as needed)
  let sortedTracks = [...tracksToUse];
  if (sortBy === 'latest') sortedTracks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  if (sortBy === 'oldest') sortedTracks.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  // Add 'popular' sorting if you have a metric

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projects</h2>
        {isOwner && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        )}
      </div>
      
      {!sortedTracks.length ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No projects found</h3>
          <p className="text-muted-foreground mt-2 mb-4">
            {profile?.id === userId 
              ? "Create your first project to showcase your music" 
              : "No projects found"}
          </p>
          {isOwner && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'gap-4'}`}>
          {sortedTracks.map((track) => (
            <ProjectCard
              key={track.id}
              project={{
                id: track.id,
                title: track.title || 'Untitled Project',
                artworkUrl: track.cover_art_url || '/default-project.jpg',
                tracks: [],
                totalTracks: 1,
                isPopular: false,
              }}
              variant="grid"
              id={track.id}
              onDelete={fetchTracks}
            />
          ))}
        </div>
      )}

      {/* Create Project Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input 
                id="title" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter a title for your project"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe your project"
                rows={4}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isPublic" 
                checked={formData.isPublic}
                onCheckedChange={(checked) => 
                  setFormData({...formData, isPublic: checked as boolean})
                }
              />
              <Label htmlFor="isPublic">Make this project public</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCreateDialog(false);
                setFormData({ title: '', description: '', isPublic: false });
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateProject}
              disabled={isSubmitting || !formData.title}
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsTab;
