import { forwardRef, ReactNode, ButtonHTMLAttributes, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2, Check, X, AlertCircle } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  icon?: LucideIcon;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: ReactNode;
}

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      loading = false,
      success = false,
      error = false,
      icon: Icon,
      loadingText,
      successText,
      errorText,
      variant = 'default',
      size = 'default',
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Determine current state
    const getCurrentState = () => {
      if (loading) return 'loading';
      if (success) return 'success';
      if (error) return 'error';
      return 'idle';
    };

    const state = getCurrentState();

    // Get icon for current state
    const getStateIcon = () => {
      switch (state) {
        case 'loading':
          return <Loader2 className="h-4 w-4 animate-spin" />;
        case 'success':
          return <Check className="h-4 w-4" />;
        case 'error':
          return <X className="h-4 w-4" />;
        default:
          return Icon ? <Icon className="h-4 w-4" /> : null;
      }
    };

    // Get text for current state
    const getStateText = () => {
      switch (state) {
        case 'loading':
          return loadingText || children;
        case 'success':
          return successText || children;
        case 'error':
          return errorText || children;
        default:
          return children;
      }
    };

    // Get variant for current state
    const getStateVariant = () => {
      if (error) return 'destructive';
      if (success) return 'default';
      return variant;
    };

    return (
      <motion.div
        whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
        whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      >
        <Button
          ref={ref}
          variant={getStateVariant()}
          size={size}
          disabled={disabled || loading || success}
          className={cn(
            'gap-2 transition-all duration-200',
            success && 'bg-green-600 hover:bg-green-600',
            className
          )}
          {...props}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={state}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              {getStateIcon()}
              <span>{getStateText()}</span>
            </motion.div>
          </AnimatePresence>
        </Button>
      </motion.div>
    );
  }
);

ActionButton.displayName = 'ActionButton';

/**
 * Confirmation button with built-in confirm/cancel flow
 */
interface ConfirmButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  children: ReactNode;
}

export function ConfirmButton({
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  icon: Icon,
  variant = 'destructive',
  className,
  children,
  ...props
}: ConfirmButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-2"
      >
        <Button
          size="sm"
          variant={variant}
          onClick={handleConfirm}
          disabled={loading}
          className="gap-1"
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Check className="h-3 w-3" />
          )}
          {confirmText}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowConfirm(false)}
          disabled={loading}
          className="gap-1"
        >
          <X className="h-3 w-3" />
          {cancelText}
        </Button>
      </motion.div>
    );
  }

  return (
    <Button
      variant={variant}
      onClick={() => setShowConfirm(true)}
      className={cn('gap-2', className)}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </Button>
  );
}
