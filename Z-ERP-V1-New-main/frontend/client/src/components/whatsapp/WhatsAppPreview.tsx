import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isOutgoing: boolean;
  status?: "sent" | "delivered" | "read";
}

interface WhatsAppPreviewProps {
  messages: Message[];
  className?: string;
}

export function WhatsAppPreview({ messages, className }: WhatsAppPreviewProps) {
  return (
    <div className={cn("bg-[#ECE5DD] rounded-lg p-4 min-h-[300px] max-h-[500px] overflow-y-auto", className)}>
      <div className="space-y-3">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  return (
    <div className={cn("flex", message.isOutgoing ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-3 py-2 shadow-sm",
          message.isOutgoing
            ? "bg-[#DCF8C6] rounded-br-none"
            : "bg-white rounded-bl-none"
        )}
      >
        <p className="text-sm text-gray-900">{message.text}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] text-gray-500">{message.timestamp}</span>
          {message.isOutgoing && message.status && (
            <MessageStatus status={message.status} />
          )}
        </div>
      </div>
    </div>
  );
}

function MessageStatus({ status }: { status: "sent" | "delivered" | "read" }) {
  const iconClass = status === "read" ? "text-blue-500" : "text-gray-400";
  
  if (status === "sent") {
    return <Check className={cn("w-3 h-3", iconClass)} />;
  }
  
  return <CheckCheck className={cn("w-3 h-3", iconClass)} />;
}
