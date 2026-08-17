import { useEffect, useMemo, useState, startTransition } from "react";
import { UserPlus, Search, X } from "lucide-react";
import { Avatar } from "./Avatar";
import { AddFriendModal } from "./AddFriendModal";
import { ConfirmDialog } from "./ConfirmDialog";
import { getFriends, removeFriend } from "../api/friends";
import { ApiError } from "../api/client";
import type { Friend } from "../types/friend";

interface FriendsSidebarProps {
  externalRefreshKey?: number;
}

export function FriendsSidebar({ externalRefreshKey = 0 }: FriendsSidebarProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const [friendToRemove, setFriendToRemove] = useState<Friend | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  useEffect(() => {
    let isStale = false;

    startTransition(() => {
      setIsLoading(true);
      setError(null);
    });

    getFriends()
      .then((data) => {
        if (!isStale) setFriends(data);
      })
      .catch((err) => {
        if (!isStale) setError(err instanceof ApiError ? err.message : "Couldn't load friends.");
      })
      .finally(() => {
        if (!isStale) setIsLoading(false);
      });

    return () => {
      isStale = true;
    };
  }, [reloadToken, externalRefreshKey]);

  const visibleFriends = useMemo(() => {
    const lowered = filter.trim().toLowerCase();
    if (!lowered) return friends;
    return friends.filter(
      (f) =>
        f.firstName.toLowerCase().includes(lowered) ||
        f.lastName.toLowerCase().includes(lowered) ||
        f.email.toLowerCase().includes(lowered)
    );
  }, [friends, filter]);

  async function handleConfirmRemove() {
    if (!friendToRemove) return;
    setIsRemoving(true);
    setRemoveError(null);
    try {
      await removeFriend(friendToRemove.userId);
      setFriends((prev) => prev.filter((f) => f.userId !== friendToRemove.userId));
      setFriendToRemove(null);
    } catch (err) {
      setRemoveError(err instanceof ApiError ? err.message : "Couldn't remove friend.");
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <aside className="w-72 shrink-0 border-r border-white/10 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-wide text-text/50">FRIENDS</h2>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-xs font-medium text-text/70 hover:border-white/20 hover:text-text"
        >
          <UserPlus size={14} /> Add
        </button>
      </div>

      {friends.length > 5 && (
        <div className="relative mb-4">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text/30" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter friends"
            className="w-full rounded-md border border-white/10 bg-bg py-1.5 pl-8 pr-2 text-xs text-text outline-none placeholder:text-text/30 focus:border-accent"
          />
        </div>
      )}

      {isLoading && <p className="text-sm text-text/40">Loading friends…</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
      {!isLoading && !error && friends.length === 0 && (
        <p className="text-sm text-text/40">No friends yet — add one to get started.</p>
      )}
      {!isLoading && !error && friends.length > 0 && visibleFriends.length === 0 && (
        <p className="text-sm text-text/40">No matches.</p>
      )}

      <ul className="flex flex-col gap-3">
        {visibleFriends.map((friend) => (
          <li key={friend.userId} className="group flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Avatar firstName={friend.firstName} lastName={friend.lastName} size="sm" />
              <span className="truncate text-sm text-text">
                {friend.firstName} {friend.lastName}
              </span>
            </div>
            <button
              onClick={() => setFriendToRemove(friend)}
              aria-label={`Remove ${friend.firstName} ${friend.lastName}`}
              className="shrink-0 rounded-md p-1 text-text/30 opacity-0 transition-opacity hover:bg-white/5 hover:text-danger group-hover:opacity-100"
            >
              <X size={14} />
            </button>
          </li>
        ))}
      </ul>

      {isAddOpen && (
        <AddFriendModal
          onClose={() => {
            setIsAddOpen(false);
            setReloadToken((t) => t + 1);
          }}
        />
      )}

      {friendToRemove && (
        <ConfirmDialog
          title="Remove friend"
          message={`Remove ${friendToRemove.firstName} ${friendToRemove.lastName} from your friends? You'll need to send a new request to reconnect.`}
          confirmLabel="Remove"
          isSubmitting={isRemoving}
          error={removeError}
          onConfirm={handleConfirmRemove}
          onCancel={() => {
            setFriendToRemove(null);
            setRemoveError(null);
          }}
        />
      )}
    </aside>
  );
}