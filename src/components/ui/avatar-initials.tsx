import { cn } from "@/lib/utils";

interface AvatarInitialsProps {
  name: string;
  className?: string;
}

const AvatarInitials = ({ name, className }: AvatarInitialsProps) => {
  // Generate initials from name
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  return (
    <span className={cn(
      "inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-600",
      className
    )}>
      <span className="text-xs font-medium">{initials}</span>
    </span>
  );
};

export default AvatarInitials;
