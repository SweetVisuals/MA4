import { useState, useEffect } from 'react';
import useProfile from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { Service } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/@/ui/card';
import { Badge } from '@/components/@/ui/badge';
import { Button } from '@/components/@/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/@/ui/avatar';
import { Briefcase, Clock, DollarSign, Star, CheckCircle, MessageSquare, Heart } from 'lucide-react';

const AlbumsTab = () => {
  const { profile } = useProfile();
  const userId = profile?.id;
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
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
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(err instanceof Error ? err.message : 'Unknown error fetching services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [userId]);

  if (!userId) return <div className="p-4">Please log in to view services.</div>;
  if (loading) return <div className="p-4 animate-pulse">Loading services...</div>;
  if (error) return <div className="p-4 text-destructive">Error: {error}</div>;
  if (!services.length) return <div className="p-4">No services found.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      {services.map((service) => (
        <Card key={service.id} className="flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle>{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </div>
              <Button variant="ghost" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <Avatar>
                <AvatarImage src={profile?.avatarUrl || ''} />
                <AvatarFallback>{profile?.username?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{profile?.username || 'User'}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                    {service.rating ?? '4.8'}
                  </div>
                  <span>•</span>
                  <div>{service.reviews ?? 0} reviews</div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {service.type}
              </Badge>
              {service.tags?.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-4 text-sm">
              {service.delivery_time && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {service.delivery_time}
                </div>
              )}
              {service.price && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Starting at ${service.price}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact
              </Button>
              <Button size="sm">
                Book Now
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default AlbumsTab;
