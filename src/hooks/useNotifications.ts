import { useEffect, useMemo, useState, startTransition } from "react";
import { getNotifications, respondToNotification } from "../api/notifications";
import { ApiError } from "../api/client";
import type { Notification, NotificationAction } from "../types/notification";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isStale = false;

    startTransition(() => {
      setIsLoading(true);
      setError(null);
    });

    getNotifications()
      .then((data) => {
        if (!isStale) setNotifications(data);
      })
      .catch((err) => {
        if (!isStale) setError(err instanceof ApiError ? err.message : "Couldn't load notifications.");
      })
      .finally(() => {
        if (!isStale) setIsLoading(false);
      });

    return () => {
      isStale = true;
    };
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  async function respond(notificationId: string, action: NotificationAction) {
    const updated = await respondToNotification(notificationId, action);
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? updated : n)));
  }

  return { notifications, unreadCount, isLoading, error, respond };
}