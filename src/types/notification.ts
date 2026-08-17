export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  outcome: string | null; // "Accepted" | "Declined" | null while pending
  actions: string[];      // e.g. ["accept", "decline"], or [] once resolved
  createdAt: string;
}

export type NotificationAction = "accept" | "decline";