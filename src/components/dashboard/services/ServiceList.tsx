import { useState } from 'react';
import { Service } from '@/lib/types';
import { ServiceCard } from './ServiceCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/@/ui/select';

interface ServiceListProps {
  services: Service[];
  onUpdate: () => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}

export function ServiceList({ services, onUpdate, onDelete, onToggleStatus }: ServiceListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort services
  const filteredAndSortedServices = services
    .filter(service => {
      // Apply search filter
      if (searchQuery && !service.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !service.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Apply type filter
      if (filterType && service.type !== filterType) {
        return false;
      }
      
      // Apply status filter
      if (filterStatus === 'active' && !service.is_active) {
        return false;
      }
      if (filterStatus === 'inactive' && service.is_active) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by created_at date
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  const serviceTypes = Array.from(new Set(services.map(service => service.type)));

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filterType || ''} onValueChange={(value) => setFilterType(value || null)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              {serviceTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterStatus || ''} onValueChange={(value) => setFilterStatus(value || null)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {filteredAndSortedServices.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No services found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedServices.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}