import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Service } from '@/lib/types';

export function useServices(userId: string) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0
  });

  async function fetchServices() {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setServices(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const active = data?.filter(service => service.is_active).length || 0;
      setStats({ total, active });
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err instanceof Error ? err.message : 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }

  async function addService(service: Omit<Service, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert([{
          ...service,
          user_id: userId
        }])
        .select();
      
      if (error) throw error;
      
      // Update local state
      await fetchServices();
      
      return { success: true, data };
    } catch (err) {
      console.error('Error adding service:', err);
      setError(err instanceof Error ? err.message : 'Failed to add service');
      return { success: false, error: err };
    }
  }

  async function updateService(serviceId: string, updates: Partial<Service>) {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', serviceId)
        .eq('user_id', userId) // Ensure user can only update their own services
        .select();
      
      if (error) throw error;
      
      // Update local state
      await fetchServices();
      
      return { success: true, data };
    } catch (err) {
      console.error('Error updating service:', err);
      setError(err instanceof Error ? err.message : 'Failed to update service');
      return { success: false, error: err };
    }
  }

  async function deleteService(serviceId: string) {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)
        .eq('user_id', userId); // Ensure user can only delete their own services
      
      if (error) throw error;
      
      // Update local state
      await fetchServices();
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting service:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete service');
      return { success: false, error: err };
    }
  }

  async function toggleServiceStatus(serviceId: string, isActive: boolean) {
    return updateService(serviceId, { is_active: !isActive });
  }

  // Initialize by fetching services
  useEffect(() => {
    if (userId) {
      fetchServices();
    }
  }, [userId]);

  return {
    services,
    stats,
    loading,
    error,
    fetchServices,
    addService,
    updateService,
    deleteService,
    toggleServiceStatus
  };
}