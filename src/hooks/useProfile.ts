import { create } from 'zustand';
import { Profile, ProfileStats, ProfileWithStatsResponse } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { transformProfileFromDB } from '@/lib/utils';

interface ProfileStore {
  profile: Profile | null;
  stats: ProfileStats | null;
  loading: boolean;
  error: string | null;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (values: Partial<Profile>) => Promise<void>;
  updateStats: (values: Partial<ProfileStats>) => Promise<void>;
}

const useProfile = create<ProfileStore>((set) => ({
  profile: null,
  stats: null,
  loading: false,
  error: null,
  fetchProfile: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .rpc('get_profile_with_stats', { profile_id: userId })
        .single<ProfileWithStatsResponse>();

      if (error) throw error;

      const profile = transformProfileFromDB(data.profile);
      const statsData = data.stats;

      set({
        profile: profile,
        stats: statsData || null,
        loading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch profile',
        loading: false
      });
    }
  },
  updateProfile: async (values) => {
    if (!values.id) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq('id', values.id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        profile: state.profile ? { ...state.profile, ...data, id: state.profile.id } : data
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update profile'
      });
    }
  },
  updateStats: async (values) => {
    if (!values.user_id) return;
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .update(values)
        .eq('user_id', values.user_id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        stats: { ...state.stats, ...data }
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update stats'
      });
    }
  },
}));

export default useProfile;
