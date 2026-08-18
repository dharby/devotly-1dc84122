import { ReactNode } from "react";
import { cn } from "@/lib/utils";

const EmptyState = ({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) => (
  <div className={cn("flex flex-col items-center justify-center text-center py-16 px-6", className)}>
    {icon && (
      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
        {icon}
      </div>
    )}
    <p className="font-display text-lg font-semibold">{title}</p>
    {description && (
      <p className="text-sm text-muted-foreground mt-1.5 max-w-xs leading-relaxed">{description}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
