import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Playlist } from '@/lib/types';

export function usePlaylists(userId: string) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchPlaylists() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    setPlaylists(data || []);
    setLoading(false);
  }

  async function addPlaylist(playlist: Partial<Playlist>) {
    const { data, error } = await supabase
      .from('playlists')
      .insert([{ ...playlist, user_id: userId }]);
    if (!error) fetchPlaylists();
    return { data, error };
  }

  async function updatePlaylist(id: string, updates: Partial<Playlist>) {
    const { data, error } = await supabase
      .from('playlists')
      .update(updates)
      .eq('id', id);
    if (!error) fetchPlaylists();
    return { data, error };
  }

  async function deletePlaylist(id: string) {
    const { data, error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', id);
    if (!error) fetchPlaylists();
    return { data, error };
  }

  useEffect(() => { if (userId) fetchPlaylists(); }, [userId]);

  return { playlists, loading, error, fetchPlaylists, addPlaylist, updatePlaylist, deletePlaylist };
}
