export interface User {
  id: string;
}

export interface Profile {
  id: string;
  full_name: string;  // Changed from 'name' to 'full_name' to match database schema
  username: string;
  bio: string;
  location?: string;
  website?: string;
  avatarUrl: string;
  bannerUrl: string;
  createdAt: string;
  updatedAt: string;
  email?: string;
  user_metadata?: {
    username?: string;
    [key: string]: unknown;
  };
  links?: string[];
  tags?: string[];
  defaultTab?: string;
  disabledTabs?: string[];
  tabOrder?: string[];
  // Professional Info
  professionalTitle?: string;
  genres?: string[];
  instruments?: string[];
  yearsOfExperience?: number;
  rates?: Rates;
  availability?: 'available' | 'busy' | 'not_available';
  // Social Media
  socialLinks?: {
    platform: string;
    url: string;
  }[];
  // Appearance
  accentColor?: string;
  theme?: 'light' | 'dark' | 'system';
  displayLayout?: 'grid' | 'list';
  // Privacy
  privacySettings?: {
    showEmail: boolean;
    showLocation: boolean;
    showRates: boolean;
    showStats: boolean;
    profileVisibility: 'public' | 'private' | 'connections_only';
  };
}

export interface Rates {
  hourly?: number;
  project?: number;
}

export interface ProfileStats {
  user_id: string;
  streams: number;
  followers: number;
  gems: number;
  tracks: number;
  playlists: number;
  albums: number;
}

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder' | 'audio' | 'image' | 'video' | 'document';
  size?: string;
  modified?: string;
  icon?: React.ReactNode;
  children?: FileItem[];
  pinned?: boolean;
  starred?: boolean;
  tags?: string[];
  audio_url?: string;
  file_path?: string;
  folder_id?: string | null;
  user_id?: string;
  badge?: {
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    label: string;
    color?: string;
  };
}

export interface DatabaseFile {
  id: string;
  name: string;
  file_url: string;
  file_path: string;
  size: number;
  file_type: string;
  user_id: string;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseFolder {
  id: string;
  name: string;
  user_id: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Track {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  // Add other relevant track properties here
  artist?: string;
  duration?: number; // in seconds
  audio_url?: string;
  cover_art_url?: string;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  // Add other relevant playlist properties here
  description?: string;
  cover_art_url?: string;
  track_ids?: string[]; // Array of track IDs in the playlist
}

export interface Album {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  // Add other relevant album properties here
  artist?: string;
  release_date?: string;
  cover_art_url?: string;
  track_ids?: string[]; // Array of track IDs in the album
}

export interface Service {
  id: string;
  title: string;
  type: string;
  description: string;
  price: number | null;
  delivery_time: string | null;
  revisions: number | null;
  is_featured: boolean;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  rating?: number;
  reviews?: number;
  tags?: string[];
}

export interface ProfileWithStatsResponse {
  profile: Profile;
  stats: ProfileStats | null;
}

// Messaging types
export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  participants: ConversationParticipant[];
  last_message?: Message;
}

export interface ConversationParticipant {
  conversation_id: string;
  user_id: string;
  joined_at: string;
  last_read_at: string;
  is_pinned: boolean;
  profile?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_read: boolean;
  metadata?: any;
  sender?: Profile;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_url: string;
  file_type: string;
  file_name: string;
  file_size?: number;
  created_at: string;
}
