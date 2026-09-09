"use client";

import { useEffect } from "react";
import { Icon } from "@iconify/react";

export type NotificationType = "success" | "error" | "info";

interface NotificationToastProps {
  type: NotificationType;
  message: string;
  onDismiss: () => void;
  durationMs?: number;
}

const toastStyles: Record<NotificationType, { container: string; icon: string; iconName: string }> = {
  success: {
    container:
      "border-accent/40 bg-linear-to-r from-[#1a1a1a] to-[#2a1f3d] text-foreground shadow-primary/20",
    icon: "text-accent",
    iconName: "mdi:check-circle-outline",
  },
  error: {
    container:
      "border-destructive/40 bg-linear-to-r from-[#1a1a1a] to-[#2d1515] text-foreground shadow-destructive/10",
    icon: "text-destructive",
    iconName: "mdi:alert-circle-outline",
  },
  info: {
    container:
      "border-primary/40 bg-linear-to-r from-[#1a1a1a] to-[#1f1633] text-foreground shadow-primary/15",
    icon: "text-primary",
    iconName: "mdi:information-outline",
  },
};

export function NotificationToast({
  type,
  message,
  onDismiss,
  durationMs = 4500,
}: NotificationToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(timer);
  }, [durationMs, message, onDismiss]);

  const style = toastStyles[type];

  return (
    <div className="fixed top-4 right-4 z-[60] max-w-sm w-[calc(100%-2rem)] sm:w-full pointer-events-none">
      <div
        className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3.5 shadow-xl backdrop-blur-md ${style.container}`}
        role="status"
      >
        <Icon
          icon={style.iconName}
          className={`w-5 h-5 shrink-0 mt-0.5 ${style.icon}`}
          aria-hidden
        />
        <p className="text-sm font-medium flex-1 text-foreground/95">{message}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-md p-0.5 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss notification"
        >
          <Icon icon="mdi:close" className="w-4 h-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
