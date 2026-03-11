import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'textarea' | 'select';
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  options?: { value: string; label: string }[]; // For select type
  rows?: number; // For textarea type
  min?: number; // For number type
  max?: number; // For number type
  icon?: ReactNode;
  suffix?: ReactNode;
  validation?: (value: string | number) => string | undefined;
}

export default function FormFieldEnhanced({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  hint,
  required = false,
  placeholder,
  disabled = false,
  className,
  options = [],
  rows = 4,
  min,
  max,
  icon,
  suffix,
  validation,
}: FormFieldProps) {
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>();

  const handleBlur = () => {
    setTouched(true);
    if (validation) {
      const validationError = validation(value);
      setLocalError(validationError);
    }
  };

  const handleChange = (newValue: string | number) => {
    onChange(newValue);
    if (touched && validation) {
      const validationError = validation(newValue);
      setLocalError(validationError);
    }
  };

  const displayError = error || (touched ? localError : undefined);
  const hasError = !!displayError;
  const isValid = touched && !hasError && value !== '';

  const renderInput = () => {
    const baseClassName = cn(
      'transition-all duration-200',
      hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
      isValid && 'border-green-500 focus:border-green-500 focus:ring-green-500',
      icon && 'pl-10',
      suffix && 'pr-10'
    );

    switch (type) {
      case 'textarea':
        return (
          <Textarea
            id={name}
            name={name}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            rows={rows}
            className={baseClassName}
          />
        );

      case 'select':
        return (
          <Select
            value={String(value)}
            onValueChange={handleChange}
            disabled={disabled}
          >
            <SelectTrigger
              id={name}
              className={baseClassName}
              onBlur={handleBlur}
            >
              <SelectValue placeholder={placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            min={min}
            max={max}
            className={baseClassName}
          />
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('space-y-2', className)}
    >
      {/* Label */}
      <Label
        htmlFor={name}
        className={cn(
          'text-sm font-medium',
          hasError && 'text-red-600',
          isValid && 'text-green-600'
        )}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}

        {/* Input */}
        {renderInput()}

        {/* Suffix / Validation Icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {suffix}
          {isValid && !suffix && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </motion.div>
          )}
          {hasError && !suffix && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <AlertCircle className="h-4 w-4 text-red-500" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence mode="wait">
        {displayError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 text-sm text-red-600"
          >
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            <span>{displayError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {hint && !displayError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-xs text-slate-500"
        >
          <Info className="h-3 w-3 flex-shrink-0" />
          <span>{hint}</span>
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Common validation functions
 */
export const validators = {
  required: (value: string | number) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return 'This field is required';
    }
  },

  email: (value: string | number) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(String(value))) {
      return 'Please enter a valid email address';
    }
  },

  minLength: (min: number) => (value: string | number) => {
    if (String(value).length < min) {
      return `Must be at least ${min} characters`;
    }
  },

  maxLength: (max: number) => (value: string | number) => {
    if (String(value).length > max) {
      return `Must be no more than ${max} characters`;
    }
  },

  pattern: (regex: RegExp, message: string) => (value: string | number) => {
    if (value && !regex.test(String(value))) {
      return message;
    }
  },

  minValue: (min: number) => (value: string | number) => {
    if (Number(value) < min) {
      return `Must be at least ${min}`;
    }
  },

  maxValue: (max: number) => (value: string | number) => {
    if (Number(value) > max) {
      return `Must be no more than ${max}`;
    }
  },

  phone: (value: string | number) => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (value && !phoneRegex.test(String(value))) {
      return 'Please enter a valid phone number';
    }
  },

  url: (value: string | number) => {
    try {
      new URL(String(value));
    } catch {
      return 'Please enter a valid URL';
    }
  },

  combine: (...validations: ((value: string | number) => string | undefined)[]) => {
    return (value: string | number) => {
      for (const validate of validations) {
        const error = validate(value);
        if (error) return error;
      }
    };
  },
};
