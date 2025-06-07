import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Track } from '@/lib/types';

export function useTracks(userId: string) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchTracks() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('audio_tracks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    setTracks(data || []);
    setLoading(false);
  }

  async function addTrack(track: Partial<Track>) {
    const { data, error } = await supabase
      .from('audio_tracks')
      .insert([{ ...track, user_id: userId }]);
    if (!error) fetchTracks();
    return { data, error };
  }

  async function updateTrack(id: string, updates: Partial<Track>) {
    const { data, error } = await supabase
      .from('audio_tracks')
      .update(updates)
      .eq('id', id);
    if (!error) fetchTracks();
    return { data, error };
  }

  async function deleteTrack(id: string) {
    const { data, error } = await supabase
      .from('audio_tracks')
      .delete()
      .eq('id', id);
    if (!error) fetchTracks();
    return { data, error };
  }

  useEffect(() => { if (userId) fetchTracks(); }, [userId]);

  return { tracks, loading, error, fetchTracks, addTrack, updateTrack, deleteTrack };
}
