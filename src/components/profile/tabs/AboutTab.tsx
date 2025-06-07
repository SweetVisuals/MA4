import { Trophy, Music, Headphones, Mail, Link, Calendar, User } from 'lucide-react';
import { Card } from '@/components/@/ui/card';
import type { UserProfile } from '@/lib/types';

interface AboutTabProps {
  user: UserProfile;
}

const AboutTab = ({ user }: AboutTabProps) => {
  const profile = user;

  // Use real profile data if available, fallback to sample data
  const achievements = Array.isArray(profile.achievements) && profile.achievements.length
    ? profile.achievements
    : [
        { year: 2023, description: 'Reached 10,000 streams' },
        { year: 2022, description: 'Featured on Spotify playlist' },
        { year: 2021, description: 'First album release' },
      ];

  const equipment = Array.isArray(profile.equipment) && profile.equipment.length
    ? profile.equipment
    : [
        'Ableton Live 11',
        'Focusrite Scarlett 2i2',
        'Shure SM7B',
        'MIDI Keyboard',
      ];

  const influences = Array.isArray(profile.influences) && profile.influences.length
    ? profile.influences
    : [
        'Daft Punk',
        'The Weeknd',
        'Tame Impala',
        'Flume',
      ];

  return (
    <div className="space-y-6 animate-fade-in">
      {profile.bio && (
        <Card className="p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h3 className="font-medium">About</h3>
          </div>
          <p className="whitespace-pre-line">{profile.bio}</p>
        </Card>
      )}

      <Card className="p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Achievements</h3>
        </div>
        <div className="space-y-3">
          {achievements.map((item, index) => (
            <div key={index} className="flex gap-4">
              <span className="text-muted-foreground">{item.year}</span>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <Music className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Equipment</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {equipment.map((item, index) => (
            <span key={index} className="px-3 py-1 bg-muted rounded-full text-sm">
              {item}
            </span>
          ))}
        </div>
      </Card>

      <Card className="p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <Headphones className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Influences</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {influences.map((item, index) => (
            <span key={index} className="px-3 py-1 bg-muted rounded-full text-sm">
              {item}
            </span>
          ))}
        </div>
      </Card>

      <Card className="p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Contact</h3>
        </div>
        <div className="space-y-2">
          {profile.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{profile.email}</span>
            </div>
          )}
          {profile.website && (
            <div className="flex items-center gap-3">
              <Link className="h-4 w-4 text-muted-foreground" />
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {profile.website}
              </a>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AboutTab;
