import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Album } from '@/lib/types';

export function useAlbums(userId: string) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchAlbums() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    setAlbums(data || []);
    setLoading(false);
  }

  async function addAlbum(album: Partial<Album>) {
    const { data, error } = await supabase
      .from('albums')
      .insert([{ ...album, user_id: userId }]);
    if (!error) fetchAlbums();
    return { data, error };
  }

  async function updateAlbum(id: string, updates: Partial<Album>) {
    const { data, error } = await supabase
      .from('albums')
      .update(updates)
      .eq('id', id);
    if (!error) fetchAlbums();
    return { data, error };
  }

  async function deleteAlbum(id: string) {
    const { data, error } = await supabase
      .from('albums')
      .delete()
      .eq('id', id);
    if (!error) fetchAlbums();
    return { data, error };
  }

  useEffect(() => { if (userId) fetchAlbums(); }, [userId]);

  return { albums, loading, error, fetchAlbums, addAlbum, updateAlbum, deleteAlbum };
}
