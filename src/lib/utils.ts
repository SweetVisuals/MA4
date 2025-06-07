import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Profile } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function transformProfileFromDB(dbProfile: any): Profile {
  return {
    id: dbProfile.id,
    full_name: dbProfile.full_name || 'Unknown User', // Changed from name to full_name
    username: dbProfile.username || 'unknown',
    bio: dbProfile.bio || '',
    location: dbProfile.location,
    website: dbProfile.website_url,
    avatarUrl: dbProfile.profile_url || '/default-avatar.png',
    bannerUrl: dbProfile.banner_url || '/default-banner.jpg',
    professionalTitle: dbProfile.professional_title,
    genres: dbProfile.genres || [],
    instruments: dbProfile.instruments || [],
    yearsOfExperience: dbProfile.years_of_experience,
    rates: dbProfile.rates || {},
    availability: dbProfile.availability,
    accentColor: dbProfile.accent_color || '#3b82f6',
    theme: dbProfile.theme || 'light',
    displayLayout: dbProfile.display_layout || 'grid',
    privacySettings: dbProfile.privacy_settings || {
      showEmail: false,
      showLocation: false,
      showRates: false,
      showStats: true,
      profileVisibility: 'public'
    },
    createdAt: dbProfile.created_at,
    updatedAt: dbProfile.updated_at,
    email: dbProfile.email,
    user_metadata: {
      username: dbProfile.username || 'unknown'
    }
  };
}