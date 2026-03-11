import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const TooltipRoot = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    animate?: boolean;
  }
>(({ className, sideOffset = 4, animate = true, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-950 shadow-md",
      "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50",
      animate && "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

/**
 * Simple tooltip wrapper component
 */
interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  delayDuration?: number;
  asChild?: boolean;
}

function Tooltip({ 
  children, 
  content, 
  side = "top", 
  delayDuration = 200,
  asChild = true 
}: TooltipProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <TooltipRoot>
        <TooltipTrigger asChild={asChild}>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side}>
          {content}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  )
}

/**
 * Enhanced tooltip with icon and description
 */
interface EnhancedTooltipProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  shortcut?: string;
}

function EnhancedTooltip({
  children,
  title,
  description,
  icon,
  side = "top",
  shortcut,
}: EnhancedTooltipProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <TooltipRoot>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className="max-w-xs p-3"
        >
          <div className="flex items-start gap-2">
            {icon && (
              <div className="mt-0.5 text-indigo-500">
                {icon}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between gap-4 mb-1">
                <p className="font-semibold text-slate-900 dark:text-slate-50">
                  {title}
                </p>
                {shortcut && (
                  <kbd className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded">
                    {shortcut}
                  </kbd>
                )}
              </div>
              {description && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {description}
                </p>
              )}
            </div>
          </div>
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  )
}

/**
 * Info tooltip with question mark icon
 */
interface InfoTooltipProps {
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}

function InfoTooltip({ content, side = "top" }: InfoTooltipProps) {
  return (
    <Tooltip content={content} side={side}>
      <button
        type="button"
        className="inline-flex items-center justify-center w-4 h-4 text-xs rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
      >
        ?
      </button>
    </Tooltip>
  )
}

export { 
  Tooltip, 
  EnhancedTooltip, 
  InfoTooltip,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent 
}
