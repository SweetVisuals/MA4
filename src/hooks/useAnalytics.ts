import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface AnalyticsEvent {
  id: string;
  event_name: string;
  event_category: string;
  event_value: number;
  metadata: any;
  created_at: string;
}

interface AnalyticsMetrics {
  totalPlays: number;
  totalRevenue: number;
  totalGems: number;
  totalLikes: number;
  totalShares: number;
  uniqueListeners: number;
}

interface ChartDataPoint {
  date: string;
  plays?: number;
  revenue?: number;
  gems?: number;
  likes?: number;
  shares?: number;
  listeners?: number;
  [key: string]: any;
}

export function useAnalytics(userId: string) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalPlays: 0,
    totalRevenue: 0,
    totalGems: 0,
    totalLikes: 0,
    totalShares: 0,
    uniqueListeners: 0
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics events
  const fetchEvents = async (timeRange: '7d' | '30d' | '90d' = '30d') => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const startDate = getStartDate(timeRange);
      
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setEvents(data || []);
      
      // Calculate metrics
      calculateMetrics(data || []);
      
      // Generate chart data
      generateChartData(data || [], timeRange);
    } catch (err) {
      console.error('Error fetching analytics events:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Record a new analytics event
  const recordEvent = async (
    eventName: string,
    eventCategory: string,
    eventValue: number = 0,
    metadata: any = {}
  ) => {
    if (!userId) return { success: false, error: 'User not authenticated' };
    
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .insert([{
          user_id: userId,
          event_name: eventName,
          event_category: eventCategory,
          event_value: eventValue,
          metadata
        }])
        .select();
      
      if (error) throw error;
      
      // Update local state
      setEvents(prev => [data[0], ...prev]);
      
      return { success: true, data: data[0] };
    } catch (err) {
      console.error('Error recording analytics event:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to record event'
      };
    }
  };

  // Calculate metrics from events
  const calculateMetrics = (events: AnalyticsEvent[]) => {
    const metrics = {
      totalPlays: 0,
      totalRevenue: 0,
      totalGems: 0,
      totalLikes: 0,
      totalShares: 0,
      uniqueListeners: new Set<string>()
    };
    
    events.forEach(event => {
      switch (event.event_name) {
        case 'track_play':
          metrics.totalPlays++;
          if (event.metadata?.listener_id) {
            metrics.uniqueListeners.add(event.metadata.listener_id);
          }
          break;
        case 'purchase':
        case 'service_payment':
          metrics.totalRevenue += event.event_value || 0;
          break;
        case 'gem_given':
        case 'gem_received':
          metrics.totalGems += event.event_value || 1;
          break;
        case 'like':
          metrics.totalLikes++;
          break;
        case 'share':
          metrics.totalShares++;
          break;
      }
    });
    
    setMetrics({
      totalPlays: metrics.totalPlays,
      totalRevenue: metrics.totalRevenue,
      totalGems: metrics.totalGems,
      totalLikes: metrics.totalLikes,
      totalShares: metrics.totalShares,
      uniqueListeners: metrics.uniqueListeners.size
    });
  };

  // Generate chart data from events
  const generateChartData = (events: AnalyticsEvent[], timeRange: '7d' | '30d' | '90d') => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const dates: { [key: string]: ChartDataPoint } = {};
    
    // Initialize dates
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      dates[dateStr] = {
        date: dateStr,
        plays: 0,
        revenue: 0,
        gems: 0,
        likes: 0,
        shares: 0,
        listeners: new Set<string>()
      };
    }
    
    // Aggregate events by date
    events.forEach(event => {
      const date = new Date(event.created_at).toISOString().split('T')[0];
      if (!dates[date]) return;
      
      switch (event.event_name) {
        case 'track_play':
          dates[date].plays = (dates[date].plays || 0) + 1;
          if (event.metadata?.listener_id) {
            (dates[date].listeners as Set<string>).add(event.metadata.listener_id);
          }
          break;
        case 'purchase':
        case 'service_payment':
          dates[date].revenue = (dates[date].revenue || 0) + (event.event_value || 0);
          break;
        case 'gem_given':
        case 'gem_received':
          dates[date].gems = (dates[date].gems || 0) + (event.event_value || 1);
          break;
        case 'like':
          dates[date].likes = (dates[date].likes || 0) + 1;
          break;
        case 'share':
          dates[date].shares = (dates[date].shares || 0) + 1;
          break;
      }
    });
    
    // Convert to array and replace Set with count
    const chartData = Object.values(dates).map(point => ({
      ...point,
      listeners: point.listeners instanceof Set ? point.listeners.size : point.listeners
    }));
    
    setChartData(chartData);
  };

  // Helper function to get start date based on time range
  const getStartDate = (timeRange: '7d' | '30d' | '90d') => {
    const date = new Date();
    switch (timeRange) {
      case '7d':
        date.setDate(date.getDate() - 7);
        break;
      case '30d':
        date.setDate(date.getDate() - 30);
        break;
      case '90d':
        date.setDate(date.getDate() - 90);
        break;
    }
    return date;
  };

  // Initialize by fetching events
  useEffect(() => {
    if (userId) {
      fetchEvents();
    }
  }, [userId]);

  return {
    events,
    metrics,
    chartData,
    loading,
    error,
    fetchEvents,
    recordEvent
  };
}