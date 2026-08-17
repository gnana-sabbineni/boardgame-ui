import { apiFetch } from "./client";
import type { Notification, NotificationAction } from "../types/notification";

export function getNotifications() {
  return apiFetch<Notification[]>("/notifications");
}

export function respondToNotification(notificationId: string, action: NotificationAction) {
  return apiFetch<Notification>(`/notifications/${notificationId}/respond`, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}

export function markNotificationRead(notificationId: string) {
  return apiFetch<null>(`/notifications/${notificationId}/read`, { method: "POST" });
}