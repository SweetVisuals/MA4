import ProfileHeader from './ProfileHeader';
import ProfileContent from './ProfileContent';
import { User, Profile, ProfileStats } from '@/lib/types';

interface ProfilePageProps {
  user: User;
  profile: Profile;
  stats: ProfileStats;
  tracks: any[];
  playlists: any[];
  albums: any[];
}

const ProfilePage = ({ user, profile, stats, tracks, playlists, albums }: ProfilePageProps) => {
  return (
    <div className="min-h-screen bg-background">
        <div className="flex flex-col">
          <ProfileHeader user={user} profile={profile} stats={stats} />
          <div className="container max-w-6xl mx-auto px-4 md:px-6 -mt-6">
            <ProfileContent 
              user={user} 
              profile={profile}
              stats={stats}
              tracks={tracks}
              playlists={playlists}
              albums={albums}
            />
          </div>
        </div>
    </div>
  );
};

export default ProfilePage;
