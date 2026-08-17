import { useState } from "react";
import { Check } from "lucide-react";
import type { Notification, NotificationAction } from "../types/notification";

interface NotificationsDropdownProps {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  onRespond: (id: string, action: NotificationAction) => Promise<void>;
}

export function NotificationsDropdown({
  notifications,
  isLoading,
  error,
  onRespond,
}: NotificationsDropdownProps) {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  async function handleRespond(id: string, action: NotificationAction) {
    setProcessingIds((prev) => new Set(prev).add(id));
    try {
      await onRespond(id, action);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-96 rounded-2xl border border-white/10 bg-surface p-4 shadow-xl">
      <h2 className="mb-3 text-xs font-semibold tracking-wide text-text/50">NOTIFICATIONS</h2>

      {isLoading && <p className="py-4 text-center text-sm text-text/40">Loading…</p>}
      {error && <p className="py-4 text-center text-sm text-danger">{error}</p>}
      {!isLoading && !error && notifications.length === 0 && (
        <p className="py-4 text-center text-sm text-text/40">You're all caught up.</p>
      )}

      <div className="flex flex-col gap-4">
        {!isLoading &&
          !error &&
          notifications.map((n) => (
            <div key={n.id}>
              <p className="mb-2 text-sm text-text">{n.message}</p>

              {n.actions.length > 0 ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRespond(n.id, "accept")}
                    disabled={processingIds.has(n.id)}
                    className="rounded-md border border-accent px-3 py-1 text-xs font-medium text-accent hover:bg-accent hover:text-bg disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespond(n.id, "decline")}
                    disabled={processingIds.has(n.id)}
                    className="rounded-md border border-white/15 px-3 py-1 text-xs font-medium text-text hover:border-white/30 disabled:opacity-50"
                  >
                    Decline
                  </button>
                </div>
              ) : n.outcome ? (
                <span
                  className={
                    n.outcome === "Accepted"
                      ? "inline-flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-bg"
                      : "inline-flex items-center gap-1 rounded-md border border-white/15 px-2 py-0.5 text-xs font-medium text-text/60"
                  }
                >
                  {n.outcome === "Accepted" && <Check size={12} />}
                  {n.outcome}
                </span>
              ) : null}
            </div>
          ))}
      </div>
    </div>
  );
}