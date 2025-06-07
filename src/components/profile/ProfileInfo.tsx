import type { User, Profile } from '@/lib/types';
import { Skeleton } from '@/components/@/ui/skeleton';

interface ProfileInfoProps {
  user?: User | null;
  profile?: Profile | null;
  isLoading?: boolean;
}

const ProfileInfo = ({ user, profile, isLoading = false }: ProfileInfoProps) => {
  if (isLoading) {
    return (
      <div className="px-6 py-6 max-w-7xl mx-auto space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto">
      {profile?.location && (
        <div className="text-sm text-muted-foreground">
          {profile.location}
        </div>
      )}
      {profile?.website && (
        <div className="mt-2">
          <a 
            href={profile.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            {profile.website}
          </a>
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;
