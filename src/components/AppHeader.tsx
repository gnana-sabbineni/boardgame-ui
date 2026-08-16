import { Bell } from "lucide-react";
import { useAuth } from "../context/auth-context";
import { Avatar } from "./Avatar";

interface AppHeaderProps {
  notificationCount?: number;
}

export function AppHeader({ notificationCount = 0 }: AppHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-bg px-8 py-4">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-accent" />
        <span className="font-semibold text-text">Boardwalk</span>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="relative rounded-full p-2 text-text/70 hover:bg-white/5 hover:text-text"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-semibold text-text">
              {notificationCount}
            </span>
          )}
        </button>

        {user && (
          <div className="flex items-center gap-2">
            <Avatar firstName={user.firstName} lastName={user.lastName} variant="accent" size="sm" />
            <span className="text-sm font-medium text-text">
              {user.firstName} {user.lastName}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}