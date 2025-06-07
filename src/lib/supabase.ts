import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

try {
  new URL(supabaseUrl)
} catch (error) {
  throw new Error("Invalid Supabase URL format")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
})

export async function updateProfile(updates: {
  id: string;
  name?: string;
  bio?: string;
  location?: string;
  professionalTitle?: string;
  genres?: string[];
  instruments?: string[];
  yearsOfExperience?: number;
  rates?: { hourly: number; project: number };
  availability?: 'available' | 'busy' | 'not_available';
  socialLinks?: { platform: string; url: string }[];
  theme?: 'light' | 'dark' | 'system';
  accentColor?: string;
  displayLayout?: 'grid' | 'list';
  privacySettings?: {
    showEmail: boolean;
    showLocation: boolean;
    showRates: boolean;
    showStats: boolean;
    profileVisibility: 'public' | 'private' | 'connections_only';
  };
  links?: string[];
  tags?: string[];
  disabledTabs?: string[];
  tabOrder?: string[];
  defaultTab?: string;
}) {
  // Map the 'name' property to 'full_name' to match the database schema
  const { name, ...otherUpdates } = updates;
  const dbUpdates = {
    ...otherUpdates,
    ...(name !== undefined && { full_name: name })
  };

  const { error } = await supabase
    .from('profiles')
    .update(dbUpdates)
    .eq('id', updates.id);

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}