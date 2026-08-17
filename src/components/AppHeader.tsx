import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAuth } from "../context/auth-context";
import { Avatar } from "./Avatar";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { useNotifications } from "../hooks/useNotifications";
import type { NotificationAction } from "../types/notification";

interface AppHeaderProps {
  onFriendRequestAccepted?: () => void;
}

export function AppHeader({ onFriendRequestAccepted }: AppHeaderProps) {
  const { user } = useAuth();
  const { notifications, unreadCount, isLoading, error, respond } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  async function handleRespond(id: string, action: NotificationAction) {
    await respond(id, action);
    // Only "accept" can change the friends list — lobby invites aren't
    // implemented yet, so any successful accept today is a friend request.
    if (action === "accept") {
      onFriendRequestAccepted?.();
    }
  }

  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-bg px-8 py-4">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-accent" />
        <span className="font-semibold text-text">Boardwalk</span>
      </div>

      <div className="flex items-center gap-4">
        <div ref={containerRef} className="relative">
          <button
            onClick={() => setIsOpen((o) => !o)}
            className="relative rounded-full p-2 text-text/70 hover:bg-white/5 hover:text-text"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-semibold text-text">
                {unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <NotificationsDropdown
              notifications={notifications}
              isLoading={isLoading}
              error={error}
              onRespond={handleRespond}
            />
          )}
        </div>

        {user && (
          <Link to="/settings" className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-white/5">
            <Avatar firstName={user.firstName} lastName={user.lastName} variant="accent" size="sm" />
            <span className="text-sm font-medium text-text">
              {user.firstName} {user.lastName}
            </span>
          </Link>
        )}
      </div>
    </header>
  );
}