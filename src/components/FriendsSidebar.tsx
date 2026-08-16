import { Avatar } from "./Avatar";
import type { Friend } from "../types/friend";

interface FriendsSidebarProps {
  friends: Friend[];
  onInvite?: (friendId: string) => void;
}

export function FriendsSidebar({ friends, onInvite }: FriendsSidebarProps) {
  return (
    <aside className="w-72 shrink-0 border-r border-white/10 p-6">
      <h2 className="mb-4 text-xs font-semibold tracking-wide text-text/50">FRIENDS</h2>
      <ul className="flex flex-col gap-3">
        {friends.map((friend) => (
          <li key={friend.id} className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Avatar firstName={friend.firstName} lastName={friend.lastName} size="sm" />
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${friend.isOnline ? "bg-accent" : "bg-white/20"}`} />
              <span className="truncate text-sm text-text">
                {friend.firstName} {friend.lastName}
              </span>
            </div>
            <button
              onClick={() => onInvite?.(friend.id)}
              className="shrink-0 rounded-md border border-white/10 px-2.5 py-1 text-xs font-medium text-text/80 hover:border-white/20 hover:text-text"
            >
              Invite
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}