import { Play } from 'lucide-react';
import { Button } from '@/components/@/ui/button';

interface Album {
  id: string;
  title: string;
  year: number;
  trackCount: number;
  artworkUrl: string;
}

interface AlbumCardProps {
  album: Album;
}

export const AlbumCard = ({ album }: AlbumCardProps) => {
  return (
    <div className="group relative rounded-lg overflow-hidden bg-muted/50 hover:bg-muted transition-colors">
      <div className="relative aspect-square">
        <img
          src={album.artworkUrl}
          alt={album.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button size="icon" className="rounded-full w-12 h-12">
            <Play className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-medium line-clamp-1">{album.title}</h3>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{album.year}</span>
          <span>{album.trackCount} tracks</span>
        </div>
      </div>
    </div>
  );
};
