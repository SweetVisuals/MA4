import { Play, Heart, Download, MoreVertical, ListMusic, Plus } from 'lucide-react';
import { Button } from '@/components/@/ui/button';
import { Badge } from '@/components/@/ui/badge';
import { useAudioPlayer, type Track } from '@/contexts/audio-player-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/@/ui/dropdown-menu';
import { Progress } from '@/components/@/ui/progress';

interface ProjectListViewProps {
  project: {
    id: string;
    title: string;
    artworkUrl: string;
    tracks: Array<{
      id: string;
      title: string;
      duration: string;
    }>;
    totalTracks: number;
    isPopular: boolean;
  };
  id: string;
}

const ProjectListView = ({ project, id }: ProjectListViewProps) => {
  const { currentTrack, playTrack } = useAudioPlayer();

  return (
    <div 
      id={id} 
      className="group relative rounded-lg overflow-hidden bg-muted/50 hover:bg-muted transition-all duration-300 shadow-sm hover:shadow-md p-4"
    >
      <div className="flex items-start gap-4">
        {/* Project Artwork */}
        <div className="relative w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
          <img
            src={project.artworkUrl}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Project Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-medium text-lg">{project.title}</h3>
              <p className="text-sm text-muted-foreground">
                {project.totalTracks} tracks
              </p>
            </div>
            <div className="flex items-center gap-2">
              {project.isPopular && (
                <Badge variant="secondary">Popular</Badge>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <ListMusic className="h-4 w-4 mr-2" />
                    Add to playlist
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Tracks List */}
          <div className="space-y-1">
            {project.tracks.map((track) => (
              <button
                key={track.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  playTrack({
                    ...track,
                    projectTitle: project.title,
                    artworkUrl: project.artworkUrl
                  });
                  // Scroll to bottom to ensure player is visible
                  setTimeout(() => {
                    window.scrollTo({
                      top: document.body.scrollHeight,
                      behavior: 'smooth'
                    });
                  }, 100);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ease-in-out group/track text-left ${
                  currentTrack?.id === track.id 
                    ? 'bg-black text-white font-medium shadow-lg' 
                    : 'hover:bg-black/90 hover:text-white hover:shadow-sm text-foreground/90'
                }`}
              >
                <Play className={`h-4 w-4 ${
                  currentTrack?.id === track.id 
                    ? 'text-white' 
                    : 'text-muted-foreground group-hover/track:text-white'
                }`} />
                <span className="flex-1 truncate">{track.title}</span>
                <span className={`text-xs tabular-nums ${
                  currentTrack?.id === track.id 
                    ? 'text-white/90' 
                    : 'text-muted-foreground/75 group-hover/track:text-white/90'
                }`}>
                  {track.duration}
                </span>
              </button>
            ))}
          </div>

          {/* Progress Bar (only shown for currently playing track) */}
          {project.tracks.some(track => track.id === currentTrack?.id) && (
            <div className="mt-3">
              <Progress value={45} className="h-1" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectListView;