  // @ts-nocheck

import { cn } from "@/lib/utils";

interface AvatarInitialsProps {
  name?: string; // Make it optional to prevent errors
  className?: string;
}

const AvatarInitials = ({ name = "User", className }: AvatarInitialsProps) => {
  // Generate initials safely
  const initials = name
    .trim()
    .split(" ")
    .filter(Boolean) // Removes empty values
    .map(part => part[0]?.toUpperCase() || "") // Avoids errors on empty parts
    .join("")
    .substring(0, 2) || "U"; // Default to "U" if no initials

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-600",
        className
      )}
    >
      <span className="text-xs font-medium">{initials}</span>
    </span>
  );
};

export default AvatarInitials;
