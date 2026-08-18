import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { Avatar } from "./Avatar";
import { getFriends } from "../api/friends";
import { inviteToLobby } from "../api/lobbies";
import { ApiError } from "../api/client";
import type { Friend } from "../types/friend";

interface InviteToLobbyModalProps {
  memberUserIds: string[];
  onClose: () => void;
}

export function InviteToLobbyModal({ memberUserIds, onClose }: InviteToLobbyModalProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [query, setQuery] = useState("");
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFriends().then(setFriends);
  }, []);

  const visible = friends.filter((f) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return f.firstName.toLowerCase().includes(q) || f.lastName.toLowerCase().includes(q) || f.email.toLowerCase().includes(q);
  });

  async function handleInvite(friendUserId: string) {
    setPendingIds((prev) => new Set(prev).add(friendUserId));
    setError(null);
    try {
      await inviteToLobby(friendUserId);
      setInvitedIds((prev) => new Set(prev).add(friendUserId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send invite.");
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(friendUserId);
        return next;
      });
    }
  }

  return (
    <Modal title="Invite friends" onClose={onClose}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search friends"
        className="mb-4 w-full rounded-lg border border-white/10 bg-bg px-3 py-2.5 text-sm text-text outline-none placeholder:text-text/30 focus:border-accent"
      />

      <h2 className="mb-3 text-xs font-semibold tracking-wide text-text/50">FRIENDS</h2>

      {error && <p className="mb-3 text-sm text-danger">{error}</p>}

      <div className="flex max-h-80 flex-col gap-3 overflow-y-auto">
        {visible.length === 0 && <p className="py-4 text-center text-sm text-text/40">No friends to show.</p>}

        {visible.map((friend) => {
          const isInLobby = memberUserIds.includes(friend.userId);
          const isInvited = invitedIds.has(friend.userId);
          const isPending = pendingIds.has(friend.userId);

          return (
            <div key={friend.userId} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar firstName={friend.firstName} lastName={friend.lastName} size="sm" />
                <div>
                  <p className="text-sm font-medium text-text">
                    {friend.firstName} {friend.lastName}
                  </p>
                  <p className="text-xs text-text/40">{friend.email}</p>
                </div>
              </div>

              {isInLobby ? (
                <span className="text-xs text-text/40">In lobby</span>
              ) : isInvited ? (
                <span className="rounded-md border border-white/10 px-3 py-1 text-xs text-text/40">Invited</span>
              ) : (
                <button
                  onClick={() => handleInvite(friend.userId)}
                  disabled={isPending}
                  className="rounded-md border border-accent px-3 py-1 text-xs font-medium text-accent hover:bg-accent hover:text-bg disabled:opacity-50"
                >
                  {isPending ? "Sending…" : "Invite"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}