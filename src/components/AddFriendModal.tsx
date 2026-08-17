import { useEffect, useState, startTransition } from "react";
import { Search, Clock, Check } from "lucide-react";
import { Modal } from "./Modal";
import { Avatar } from "./Avatar";
import { searchUsers, sendFriendRequest } from "../api/friends";
import { ApiError } from "../api/client";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { RelationshipStatus, type UserSearchResult } from "../types/friend";

interface AddFriendModalProps {
  onClose: () => void;
}

export function AddFriendModal({ onClose }: AddFriendModalProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const hasQuery = debouncedQuery.trim().length >= 2;

  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!hasQuery) return; // `hasQuery` alone decides what's rendered — no state to clear

    let isStale = false;

    startTransition(() => {
      setIsSearching(true);
      setError(null);
    });

    searchUsers(debouncedQuery)
      .then((data) => {
        if (!isStale) setResults(data);
      })
      .catch((err) => {
        if (!isStale) setError(err instanceof ApiError ? err.message : "Search failed.");
      })
      .finally(() => {
        if (!isStale) setIsSearching(false);
      });

    return () => {
      isStale = true;
    };
  }, [debouncedQuery, hasQuery]);

  async function handleAdd(userId: string) {
    setPendingIds((prev) => new Set(prev).add(userId));
    try {
      await sendFriendRequest({ targetUserId: userId });
      setResults((prev) =>
        prev.map((r) =>
          r.userId === userId ? { ...r, status: RelationshipStatus.PendingSentByMe } : r
        )
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send request.");
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  }

  return (
    <Modal title="Add friend" onClose={onClose}>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text/40" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email"
          className="w-full rounded-lg border border-white/10 bg-bg py-2.5 pl-9 pr-3 text-text outline-none placeholder:text-text/30 focus:border-accent"
        />
      </div>

      {error && <p className="mb-3 text-sm text-danger">{error}</p>}

      <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
        {hasQuery && isSearching && (
          <p className="py-4 text-center text-sm text-text/40">Searching…</p>
        )}

        {hasQuery && !isSearching && results.length === 0 && (
          <p className="py-4 text-center text-sm text-text/40">No users found.</p>
        )}

        {hasQuery &&
          !isSearching &&
          results.map((user) => (
            <div
              key={user.userId}
              className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-white/5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar firstName={user.firstName} lastName={user.lastName} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="truncate text-xs text-text/40">{user.email}</p>
                </div>
              </div>

              {user.status === RelationshipStatus.Friends ? (
                <span className="flex shrink-0 items-center gap-1 text-xs text-text/40">
                  <Check size={14} /> Friends
                </span>
              ) : user.status === RelationshipStatus.PendingSentByMe ? (
                <span className="flex shrink-0 items-center gap-1 text-xs text-text/40">
                  <Clock size={14} /> Requested
                </span>
              ) : user.status === RelationshipStatus.PendingReceivedByMe ? (
                <span className="shrink-0 text-xs text-text/40">Sent you a request</span>
              ) : (
                <button
                  onClick={() => handleAdd(user.userId)}
                  disabled={pendingIds.has(user.userId)}
                  className="shrink-0 rounded-md border border-accent px-2.5 py-1 text-xs font-medium text-accent hover:bg-accent hover:text-bg disabled:opacity-50"
                >
                  {pendingIds.has(user.userId) ? "Sending…" : "Add"}
                </button>
              )}
            </div>
          ))}
      </div>
    </Modal>
  );
}