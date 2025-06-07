import { Play } from 'lucide-react';
import { Button } from '@/components/@/ui/button';

interface Playlist {
  id: string;
  title: string;
  trackCount: number;
  duration?: string;
  artworkUrl: string;
}

interface PlaylistCardProps {
  playlist: Playlist;
}

export const PlaylistCard = ({ playlist }: PlaylistCardProps) => {
  return (
    <div className="group relative rounded-lg overflow-hidden bg-muted/50 hover:bg-muted transition-colors">
      <div className="relative aspect-square">
        <img
          src={playlist.artworkUrl}
          alt={playlist.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button size="icon" className="rounded-full w-12 h-12">
            <Play className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-medium line-clamp-1">{playlist.title}</h3>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{playlist.trackCount} tracks</span>
          <span>{playlist.duration || '—'}</span>
        </div>
      </div>
    </div>
  );
};
