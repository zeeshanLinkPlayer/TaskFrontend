import { cn } from "../../lib/utils";
// @ts-nocheck

interface StatusBadgeProps {
  status: string;
  className?: string;
}
const TaskStatus={
  PENDING:"pending",
  IN_PROGRESS:"in_progress",
  COMPLETED:"completed"
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  let statusColor = "";
  
  switch (status) {
    case TaskStatus.PENDING:
      statusColor = "bg-amber-50 text-amber-600";
      break;
    case TaskStatus.IN_PROGRESS:
      statusColor = "bg-indigo-50 text-indigo-600";
      break;
    case TaskStatus.COMPLETED:
      statusColor = "bg-emerald-50 text-emerald-600";
      break;
    default:
      statusColor = "bg-slate-50 text-slate-600";
  }
  
  return (
    <span className={cn(
      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
      statusColor,
      className
    )}>
      {status === TaskStatus.IN_PROGRESS ? "In Progress" : 
        status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;
