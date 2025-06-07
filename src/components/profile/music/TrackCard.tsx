import { Play, Heart, Download, MoreVertical, ListMusic, Plus } from 'lucide-react';
import { Button } from '@/components/@/ui/button';
import { Badge } from '@/components/@/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/@/ui/dropdown-menu';

interface TrackCardProps {
  track: {
    id: string;
    title: string;
    duration: string;
    streams: number;
    artworkUrl: string;
    isPopular: boolean;
  };
  variant: 'grid' | 'list';
}

const TrackCard = ({ track, variant }: TrackCardProps) => {
  return variant === 'grid' ? (
    <div className="group relative rounded-lg overflow-hidden bg-muted/50 hover:bg-muted transition-colors">
      <div className="relative aspect-square">
        <img
          src={track.artworkUrl}
          alt={track.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button size="icon" className="rounded-full w-12 h-12">
            <Play className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium line-clamp-1">{track.title}</h3>
          {track.isPopular && (
            <Badge variant="secondary" className="shrink-0">
              Popular
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{track.duration}</span>
          <span>{track.streams.toLocaleString()} streams</span>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Plus className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
    </div>
  ) : (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="relative shrink-0">
        <img
          src={track.artworkUrl}
          alt={track.title}
          className="w-12 h-12 rounded-md object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button size="icon" className="rounded-full w-8 h-8">
            <Play className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium truncate">{track.title}</h3>
          {track.isPopular && (
            <Badge variant="secondary" className="shrink-0">
              Popular
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {track.duration} • {track.streams.toLocaleString()} streams
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Heart className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Download className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
  );
};

export default TrackCard;
