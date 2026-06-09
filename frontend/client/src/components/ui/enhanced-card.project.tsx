import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EnhancedCardProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  badge?: {
    text: string;
    variant?: 'default' | 'success' | 'warning' | 'error';
  };
  actions?: {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    variant?: 'default' | 'destructive';
  }[];
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  loading?: boolean;
  animate?: boolean;
  delay?: number;
}

export default function EnhancedCard({
  title,
  description,
  icon: Icon,
  badge,
  actions,
  children,
  footer,
  className,
  headerClassName,
  contentClassName,
  hoverable = false,
  clickable = false,
  onClick,
  loading = false,
  animate = true,
  delay = 0,
}: EnhancedCardProps) {
  const cardContent = (
    <Card
      className={cn(
        'transition-all duration-200',
        hoverable && 'hover:shadow-lg hover:-translate-y-1',
        clickable && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {(title || description || Icon || badge || actions) && (
        <CardHeader className={cn('pb-3', headerClassName)}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {Icon && (
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                  <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {title && (
                    <CardTitle className="text-lg font-semibold">
                      {title}
                    </CardTitle>
                  )}
                  {badge && (
                    <Badge
                      className={cn(
                        badge.variant === 'success' && 'bg-green-100 text-green-800 border-green-200',
                        badge.variant === 'warning' && 'bg-amber-100 text-amber-800 border-amber-200',
                        badge.variant === 'error' && 'bg-red-100 text-red-800 border-red-200'
                      )}
                    >
                      {badge.text}
                    </Badge>
                  )}
                </div>
                {description && (
                  <CardDescription className="mt-1">
                    {description}
                  </CardDescription>
                )}
              </div>
            </div>

            {actions && actions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {actions.map((action, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick();
                      }}
                      className={cn(
                        'gap-2 cursor-pointer',
                        action.variant === 'destructive' && 'text-red-600 focus:text-red-600'
                      )}
                    >
                      {action.icon && <action.icon className="h-4 w-4" />}
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent className={cn('pt-3', contentClassName)}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          children
        )}
      </CardContent>

      {footer && <CardFooter className="pt-0">{footer}</CardFooter>}
    </Card>
  );

  if (!animate) {
    return cardContent;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {cardContent}
    </motion.div>
  );
}

/**
 * Grid of cards with consistent layout
 */
interface CardGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CardGrid({ 
  children, 
  columns = 3, 
  gap = 'md',
  className 
}: CardGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const gapSize = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <div className={cn(
      'grid',
      gridCols[columns],
      gapSize[gap],
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Stat card for displaying metrics
 */
interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  className?: string;
  animate?: boolean;
  delay?: number;
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-indigo-600',
  iconBgColor = 'bg-indigo-100',
  className,
  animate = true,
  delay = 0,
}: StatCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-slate-500',
  };

  const trendSymbols = {
    up: '↗',
    down: '↘',
    neutral: '→',
  };

  const cardContent = (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {value}
            </p>
            {change && (
              <p className={cn(
                'text-sm font-medium mt-2 flex items-center gap-1',
                trendColors[change.trend]
              )}>
                <span>{trendSymbols[change.trend]}</span>
                <span>{change.value}</span>
              </p>
            )}
          </div>
          <div className={cn(
            'p-3 rounded-full',
            iconBgColor
          )}>
            <Icon className={cn('h-6 w-6', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!animate) {
    return cardContent;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay,
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ scale: 1.02 }}
    >
      {cardContent}
    </motion.div>
  );
}
