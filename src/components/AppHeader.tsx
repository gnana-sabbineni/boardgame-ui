import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAuth } from "../context/auth-context";
import { useLobby } from "../context/lobby-context";
import { Avatar } from "./Avatar";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { useNotifications } from "../hooks/useNotifications";
import type { NotificationAction } from "../types/notification";

interface AppHeaderProps {
  onAccepted?: () => void;
}

export function AppHeader({ onAccepted }: AppHeaderProps) {
  const { user } = useAuth();
  const { currentLobby, refreshCurrentLobby } = useLobby();
  const navigate = useNavigate();
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

    if (action !== "accept") return;

    // We don't yet know the notification's type (friend vs. lobby invite —
    // no Type field on NotificationResponse). Instead of guessing, we just
    // check the *outcome*: if we weren't in a lobby before and we are one
    // now, this accept must have been a lobby invite — redirect.
    const wasInLobby = !!currentLobby;
    const updatedLobby = await refreshCurrentLobby();

    onAccepted?.();

    if (!wasInLobby && updatedLobby) {
      setIsOpen(false);
      navigate("/lobby");
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