import { cn } from '@/lib/utils';

interface ProfileStatProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  className?: string;
}

export function ProfileStat({ 
  icon, 
  value, 
  label, 
  className 
}: ProfileStatProps) {
  return (
    <div className={cn(
      "flex flex-col items-center p-2 rounded-lg bg-card hover:bg-card/80 transition-colors",
      className
    )}>
    </div>
  );
}
