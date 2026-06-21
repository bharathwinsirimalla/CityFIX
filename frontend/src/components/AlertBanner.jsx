import React from "react";

export default function AlertBanner({ type = "info", message, onDismiss }) {
  if (!message) return null;

  const styles = {
    success: "border-accent/30 bg-accent/10 text-accent",
    error: "border-error/30 bg-error/10 text-error",
    info: "border-primary/30 bg-primary/10 text-primary"
  };

  return (
    <div className={`mb-6 flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${styles[type]}`}>
      <span>{message}</span>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="font-semibold opacity-70 hover:opacity-100">
          Dismiss
        </button>
      )}
    </div>
  );
}
