"use client";
import * as React from "react";
import { X } from "lucide-react";

export type ToastProps = {
  id?: string;
  title?: string;
  description?: string;
  type?: "default" | "success" | "error" | "warning";
  duration?: number;      // ms
  onDismiss?: () => void; // called when toast closes
};

export const Toast: React.FC<ToastProps> = ({
  id,
  title,
  description,
  type = "default",
  duration = 4000,
  onDismiss,
}) => {
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setOpen(false);
      onDismiss?.();
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onDismiss]);

  if (!open) return null;

  const bg =
    type === "success"
      ? "bg-green-600"
      : type === "error"
      ? "bg-red-600"
      : type === "warning"
      ? "bg-yellow-600"
      : "bg-gray-800";

  return (
    <div
      data-toast-id={id}
      className={`w-80 rounded-lg p-4 shadow-md text-white ${bg}`}
      role="status"
      aria-live="polite"
      style={{ opacity: 1, transform: "translateY(0)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {title ? <p className="font-semibold truncate">{title}</p> : null}
          {description ? (
            <p className="text-sm text-gray-100 leading-snug break-words">
              {description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => {
            setOpen(false);
            onDismiss?.();
          }}
          className="shrink-0 text-gray-200 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
