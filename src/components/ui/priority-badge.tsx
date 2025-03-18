import { cn } from "../../lib/utils";
// @ts-nocheck

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}
const TaskPriority={
  LOW:"Low",
  HIGH:"High",
  MEDIUM:"Medium",
  URGENT:"Urgent"
}

const PriorityBadge = ({ priority, className }: PriorityBadgeProps) => {
  // Define styling based on priority
  const getPriorityStyles = () => {
    switch (priority) {
      case TaskPriority.LOW:
        return "bg-slate-100 text-slate-800";
      case TaskPriority.MEDIUM:
        return "bg-blue-100 text-blue-800";
      case TaskPriority.HIGH:
        return "bg-amber-100 text-amber-800";
      case TaskPriority.URGENT:
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  // Format priority label
  const getPriorityLabel = () => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        getPriorityStyles(),
        className
      )}
    >
      {getPriorityLabel()}
    </span>
  );
};

export default PriorityBadge;