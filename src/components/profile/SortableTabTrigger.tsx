import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TabsTrigger } from '@/components/@/ui/tabs';

interface SortableTabTriggerProps {
  id: string;
  value: string;
  className: string;
  children: React.ReactNode;
}

export function SortableTabTrigger({
  id,
  value,
  className,
  children,
}: SortableTabTriggerProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TabsTrigger
        value={value}
        className={className}
        {...listeners}
      >
        {children}
      </TabsTrigger>
    </div>
  );
}
