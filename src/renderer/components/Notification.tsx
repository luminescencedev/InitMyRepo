import React, { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { VscError, VscCheckAll } from "react-icons/vsc";

interface NotificationProps {
  message: string;
  type: "success" | "error";
  visible: boolean;
  onClose?: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  visible,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(visible);

  // Auto-close notification after 5 seconds
  useEffect(() => {
    setIsVisible(visible);
    if (visible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center rounded-lg shadow-lg border border-zinc-700 py-3 px-4 pr-10 min-w-[300px] animate-slide-in-right",
        type === "success"
          ? "bg-zinc-900/95 text-zinc-100 border-l-4 border-l-green-500"
          : "bg-zinc-900/95 text-zinc-100 border-l-4 border-l-red-500"
      )}
    >
      <div className={cn("mr-3 flex-shrink-0")}>
        {type === "success" ? (
          <VscCheckAll className="h-6 w-6 text-green-400" />
        ) : (
          <VscError className="h-6 w-6 text-red-400" />
        )}
      </div>
      <div className="flex-1">
        <p
          className={cn(
            "text-sm font-medium",
            type === "success" ? "text-zinc-100" : "text-zinc-200"
          )}
        >
          {message}
        </p>
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          if (onClose) onClose();
        }}
        className="absolute top-1 right-1 p-1 rounded-md hover:bg-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-400"
      >
        <span className="sr-only">Close</span>
        <svg
          className="h-4 w-4 text-zinc-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

export default Notification;
