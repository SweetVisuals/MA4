import { useState } from 'react';
import { PlayCircle, Users, Gem, MessageCircle, UserPlus, Camera, MapPin, Calendar, Globe, Settings } from 'lucide-react';
import { format } from 'date-fns';
import type { FileWithMetadata } from './UploadDialog';
import { Button } from '@/components/@/ui/button';
import { Badge } from '@/components/@/ui/badge';
import { UploadDialog } from './UploadDialog';
import { SettingsDialog } from '@/components/settings-dialog';
import { DialogTrigger } from '@/components/ui/dialog';
import { User, Profile, ProfileStats } from '@/lib/types';

interface ProfileHeaderProps {
  user: User;
  profile?: Profile | null;
  stats: ProfileStats | null;
  updateProfile?: (updates: Partial<Profile>) => Promise<void>;
}

const ProfileHeader = ({ user, profile, stats, updateProfile = async () => {} }: ProfileHeaderProps) => {
  const [uploadType, setUploadType] = useState<'avatar' | 'banner' | null>(null);
  const handleUpload = async (files: FileWithMetadata[]) => {
    if (!uploadType || !files || files.length === 0) return;
    const file = files[0];
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        if (profile) {
          updateProfile({
            ...profile,
            [uploadType === 'avatar' ? 'avatarUrl' : 'bannerUrl']: result
          });
        }
      };
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const name = profile?.full_name || ''; // Changed from name to full_name
  const isOwner = user?.id === profile?.id;
  const bannerUrl = profile?.bannerUrl || '';
  const avatarUrl = profile?.avatarUrl || '';
  const hasAvatar = !!avatarUrl && avatarUrl !== '/default-avatar.png';
  const hasBanner = !!bannerUrl && bannerUrl !== '/default-banner.jpg';

  return (
    <>
      <div className="relative">
        {/* Banner Image */}
        <div className="h-48 w-full overflow-hidden relative mb-20" style={{ cursor: isOwner ? 'pointer' : 'default' }}>
          {hasBanner ? (
            <img
              src={bannerUrl}
              alt="Profile banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-700 animate-fade-in flex items-center justify-center transition-all duration-300">
              <Camera className="h-12 w-12 text-gray-400 opacity-40" />
            </div>
          )}
          {isOwner && (
            <div 
              className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-90 transition-opacity duration-300 bg-black/30"
              onClick={() => setUploadType('banner')}
            >
              <Camera className="h-10 w-10 text-gray-200" />
            </div>
          )}
        </div>

        {/* Profile Info Section */}
        <div className="px-6 pb-6 w-full -mt-12">
          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-8xl mx-auto">
            {/* Avatar */}
            <div className="relative ml-0 group shrink-0">
              <div
                className="h-32 w-32 rounded-full border-4 border-background overflow-hidden relative"
                style={{ cursor: isOwner ? 'pointer' : 'default' }}
              >
                {hasAvatar ? (
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-500 animate-fade-in flex items-center justify-center transition-all duration-300">
                    <Camera className="h-10 w-10 text-gray-300 opacity-40" />
                  </div>
                )}
                {isOwner && (
                  <div 
                    className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 hover:opacity-90 transition-opacity duration-300 bg-black/30"
                    onClick={() => setUploadType('avatar')}
                  >
                    <Camera className="h-8 w-8 text-gray-300" />
                  </div>
                )}
              </div>
            </div>

            {/* Profile Details */}
            <div className="flex-1 space-y-0 min-w-0">
              <div className="flex justify-between items-start w-full">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    {name && (
                      <h1 className="text-2xl font-bold truncate">{name}</h1>
                    )}
                    <Badge className="bg-black text-white">Producer</Badge>
                  </div>

                  <div className="flex items-center gap-6 pt-2 pb-2">
                    <div className="flex items-center gap-1">
                      <PlayCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">{stats?.streams?.toLocaleString() || '0'}</span>
                      <span className="text-xs text-muted-foreground">Streams</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm">{stats?.followers?.toLocaleString() || '0'}</span>
                      <span className="text-xs text-muted-foreground">Followers</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Gem className="h-4 w-4 text-primary" />
                      <span className="text-sm">{stats?.gems || '0'}</span>
                      <span className="text-xs text-muted-foreground">Gems</span>
                    </div>
                  </div>

                  {profile?.bio && (
                    <p className="text-xs pt-2 pb-2 text-muted-foreground max-w-2xl whitespace-nowrap overflow-hidden text-ellipsis">
                      {profile?.bio}
                    </p>
                  )}

                  {/* Profile Info Tags */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {profile?.location && (
                      <Button variant="outline" size="sm" className="rounded-full">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        {profile?.location}
                      </Button>
                    )}
                    {profile?.createdAt && (
                      <Button variant="outline" size="sm" className="rounded-full">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        Joined {format(new Date(profile?.createdAt || ''), 'MMMM yyyy')}
                      </Button>
                    )}
                    {profile?.website && (
                      <Button variant="outline" size="sm" className="rounded-full">
                        <Globe className="h-3.5 w-3.5 mr-1" />
                        {profile?.website}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mr-10">
                  {!isOwner ? (
                    <>
                      <Button variant="outline">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="outline">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Follow
                      </Button>
                    </>
                  ) : (
                    <SettingsDialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Settings className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      </DialogTrigger>
                    </SettingsDialog>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {uploadType && (
        <UploadDialog
          open={true}
          onOpenChange={(open) => !open && setUploadType(null)}
          onUpload={handleUpload}
        />
      )}
    </>
  );
};

export default ProfileHeader;
