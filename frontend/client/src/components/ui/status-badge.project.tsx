import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export type StatusVariant = 
  | 'success' | 'error' | 'warning' | 'info' | 'default'
  | 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'inactive'
  | 'sent' | 'accepted' | 'declined' | 'completed' | 'in-progress'
  | 'paid' | 'unpaid' | 'overdue' | 'partial';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  icon?: LucideIcon;
  animate?: boolean;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig: Record<StatusVariant, {
  className: string;
  dotColor?: string;
}> = {
  // Generic statuses
  success: {
    className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    dotColor: 'bg-green-500',
  },
  error: {
    className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    dotColor: 'bg-red-500',
  },
  warning: {
    className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    dotColor: 'bg-amber-500',
  },
  info: {
    className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    dotColor: 'bg-blue-500',
  },
  default: {
    className: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800',
    dotColor: 'bg-slate-500',
  },
  
  // Specific statuses
  draft: {
    className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800',
    dotColor: 'bg-slate-500',
  },
  pending: {
    className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    dotColor: 'bg-amber-500',
  },
  approved: {
    className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    dotColor: 'bg-green-500',
  },
  rejected: {
    className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    dotColor: 'bg-red-500',
  },
  active: {
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    dotColor: 'bg-emerald-500',
  },
  inactive: {
    className: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900/30 dark:text-slate-500 dark:border-slate-800',
    dotColor: 'bg-slate-400',
  },
  sent: {
    className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    dotColor: 'bg-blue-500',
  },
  accepted: {
    className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    dotColor: 'bg-green-500',
  },
  declined: {
    className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    dotColor: 'bg-red-500',
  },
  completed: {
    className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    dotColor: 'bg-green-500',
  },
  'in-progress': {
    className: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
    dotColor: 'bg-indigo-500',
  },
  paid: {
    className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    dotColor: 'bg-green-500',
  },
  unpaid: {
    className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    dotColor: 'bg-red-500',
  },
  overdue: {
    className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    dotColor: 'bg-red-500',
  },
  partial: {
    className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    dotColor: 'bg-amber-500',
  },
};

const sizeConfig = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export default function StatusBadge({
  status,
  variant,
  icon: Icon,
  animate = true,
  pulse = false,
  size = 'md',
  className,
}: StatusBadgeProps) {
  // Auto-detect variant from status if not provided
  const detectedVariant = variant || (status.toLowerCase().replace(/\s+/g, '-') as StatusVariant);
  const config = statusConfig[detectedVariant] || statusConfig.default;

  const badgeContent = (
    <Badge
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border',
        config.className,
        sizeConfig[size],
        className
      )}
    >
      {/* Status dot */}
      {pulse ? (
        <span className="relative flex h-2 w-2">
          <span className={cn(
            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
            config.dotColor
          )} />
          <span className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            config.dotColor
          )} />
        </span>
      ) : (
        <span className={cn('h-1.5 w-1.5 rounded-full', config.dotColor)} />
      )}

      {/* Icon */}
      {Icon && <Icon className="h-3.5 w-3.5" />}

      {/* Status text */}
      <span className="capitalize">{status}</span>
    </Badge>
  );

  if (!animate) {
    return badgeContent;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
    >
      {badgeContent}
    </motion.div>
  );
}

/**
 * Status indicators for different use cases
 */
export function StatusIndicator({ 
  variant, 
  label,
  size = 'md' 
}: { 
  variant: StatusVariant; 
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const config = statusConfig[variant] || statusConfig.default;
  
  const sizeMap = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  return (
    <div className="inline-flex items-center gap-2">
      <span className={cn('rounded-full', config.dotColor, sizeMap[size])} />
      {label && <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>}
    </div>
  );
}
