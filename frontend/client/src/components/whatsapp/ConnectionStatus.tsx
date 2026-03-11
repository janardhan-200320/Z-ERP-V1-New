import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  status: "connected" | "disconnected" | "connecting";
  sessionName?: string;
  phoneNumber?: string;
  className?: string;
}

export function ConnectionStatus({ status, sessionName, phoneNumber, className }: ConnectionStatusProps) {
  const statusConfig = {
    connected: {
      color: "bg-green-500",
      text: "Connected",
      badge: "bg-green-100 text-green-800",
    },
    disconnected: {
      color: "bg-red-500",
      text: "Disconnected",
      badge: "bg-red-100 text-red-800",
    },
    connecting: {
      color: "bg-yellow-500",
      text: "Connecting",
      badge: "bg-yellow-100 text-yellow-800",
    },
  };

  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative">
        <motion.div
          className={cn("w-3 h-3 rounded-full", config.color)}
          animate={status === "connecting" ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        />
        {status === "connected" && (
          <motion.div
            className="absolute inset-0 w-3 h-3 rounded-full bg-green-500"
            animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>
      <div className="flex flex-col">
        <Badge variant="secondary" className={config.badge}>
          {config.text}
        </Badge>
        {sessionName && <span className="text-xs text-muted-foreground mt-1">{sessionName}</span>}
        {phoneNumber && <span className="text-xs text-muted-foreground">{phoneNumber}</span>}
      </div>
    </div>
  );
}

interface ConnectionIndicatorProps {
  isHealthy: boolean;
  label: string;
}

export function ConnectionIndicator({ isHealthy, label }: ConnectionIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-2 h-2 rounded-full", isHealthy ? "bg-green-500" : "bg-red-500")} />
      <span className="text-sm">{label}</span>
    </div>
  );
}
