import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, UserMinus, Crown } from "lucide-react";
import { AppHeader } from "../components/AppHeader";
import { Button } from "../components/Button";
import { Avatar } from "../components/Avatar";
import { InviteToLobbyModal } from "../components/InviteToLobbyModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { leaveLobby, kickMember, startGame, closeLobby } from "../api/lobbies";
import { ApiError } from "../api/client";
import { useLobby } from "../context/lobby-context";
import { useAuth } from "../context/auth-context";

export function Lobby() {
  const { currentLobby, setCurrentLobby } = useLobby();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [memberToKick, setMemberToKick] = useState<{ userId: string; name: string } | null>(null);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentLobby || !user) {
    return (
      <div className="min-h-screen bg-bg">
        <AppHeader />
        <div className="p-8 text-text/50">You're not currently in a lobby.</div>
      </div>
    );
  }

  const isHost = currentLobby.hostUserId === user.id;
  const allOnline = currentLobby.members.every((m) => m.isOnline);
  const canStart = currentLobby.members.length >= 2 && allOnline;
  const emptySlots = currentLobby.maxPlayers - currentLobby.members.length;

  async function handleLeave() {
    setIsSubmitting(true);
    setActionError(null);
    try {
      await leaveLobby();
      setCurrentLobby(null);
      setIsLeaveConfirmOpen(false);
      navigate("/");
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't leave the lobby.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleClose() {
    setIsSubmitting(true);
    setActionError(null);
    try {
      await closeLobby();
      setCurrentLobby(null);
      setIsCloseConfirmOpen(false);
      navigate("/");
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't close the lobby.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleKick() {
    // Snapshot both values locally before the await — TypeScript can't carry
    // narrowing on `currentLobby` (captured from the hook) across an await,
    // so we capture it in a local const while it's still known non-null.
    const lobby = currentLobby;
    const target = memberToKick;
    if (!lobby || !target) return;

    setIsSubmitting(true);
    setActionError(null);
    try {
      await kickMember(target.userId);
      setCurrentLobby({
        ...lobby,
        members: lobby.members.filter((m) => m.userId !== target.userId),
      });
      setMemberToKick(null);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't remove that player.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStart() {
    setIsSubmitting(true);
    setActionError(null);
    try {
      await startGame();
      // GameStarting arrives over SignalR and syncs lobby.status to InProgress;
      // navigation to the actual game screen is Phase 3.
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't start the game.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <AppHeader />

      <div className="flex items-center gap-2 border-b border-accent/20 bg-accent/5 px-8 py-3 text-sm">
        <span className="h-2 w-2 rounded-full bg-accent" />
        <span className="font-medium text-text">You're in a lobby</span>
        <span className="text-text/40">&middot; Monopoly</span>
      </div>

      <main className="p-8">
        <h1 className="mb-1 text-2xl font-bold text-text">Monopoly Lobby</h1>
        <p className="mb-6 text-sm text-text/50">
          {currentLobby.members.length} of {currentLobby.maxPlayers} players
          {!allOnline && currentLobby.members.length >= 2 && " · waiting for everyone to be online"}
        </p>

        <h2 className="mb-3 text-xs font-semibold tracking-wide text-text/50">PLAYERS</h2>
        <div className="mb-8 grid grid-cols-4 gap-4">
          {currentLobby.members.map((member) => (
            <div key={member.userId} className="group relative rounded-xl border border-white/10 p-5 text-center">
              {member.isHost && (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent">
                  <Crown size={11} className="text-bg" />
                </span>
              )}

              {isHost && !member.isHost && (
                <button
                  onClick={() => setMemberToKick({ userId: member.userId, name: `${member.firstName} ${member.lastName}` })}
                  aria-label={`Remove ${member.firstName} ${member.lastName}`}
                  className="absolute left-3 top-3 rounded-md p-1 text-text/30 opacity-0 transition-opacity hover:bg-white/5 hover:text-danger group-hover:opacity-100"
                >
                  <UserMinus size={14} />
                </button>
              )}

              <div className="mb-3 flex justify-center">
                <Avatar
                  firstName={member.firstName}
                  lastName={member.lastName}
                  variant={member.userId === user.id ? "accent" : "neutral"}
                />
              </div>
              <p className="mb-1 text-sm font-medium text-text">
                {member.firstName} {member.lastName}
                {member.userId === user.id && <span className="text-text/40"> (you)</span>}
              </p>
              <p className={`flex items-center justify-center gap-1 text-xs ${member.isOnline ? "text-accent" : "text-text/40"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${member.isOnline ? "bg-accent" : "bg-text/30"}`} />
                {member.isOnline ? "Online" : "Offline"}
              </p>
            </div>
          ))}

          {Array.from({ length: emptySlots }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/15 p-5 text-text/30"
            >
              <UserPlus size={20} className="mb-2" />
              <span className="text-xs">Empty slot</span>
            </div>
          ))}
        </div>

        {actionError && <p className="mb-4 text-sm text-danger">{actionError}</p>}

        <div className="flex items-center justify-between border-t border-white/10 pt-6">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              className="w-auto border-danger px-4 text-danger hover:bg-danger hover:text-text"
              onClick={() => setIsLeaveConfirmOpen(true)}
            >
              Leave lobby
            </Button>

            {isHost && (
              <Button
                variant="secondary"
                className="w-auto border-danger px-4 text-danger hover:bg-danger hover:text-text"
                onClick={() => setIsCloseConfirmOpen(true)}
              >
                Close lobby
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isHost && (
              <Button
                variant="secondary"
                className="flex w-auto items-center gap-2 border-accent px-4 text-accent"
                onClick={() => setIsInviteOpen(true)}
              >
                <UserPlus size={16} /> Invite friends
              </Button>
            )}

            {isHost && (
              <div className="text-right">
                <Button className="w-auto px-4" disabled={!canStart || isSubmitting} onClick={handleStart}>
                  Start game
                </Button>
                {!canStart && (
                  <p className="mt-1 text-xs text-text/40">
                    {currentLobby.members.length < 2 ? "Need at least 2 players" : "Waiting for everyone to be online"}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {isInviteOpen && (
        <InviteToLobbyModal memberUserIds={currentLobby.members.map((m) => m.userId)} onClose={() => setIsInviteOpen(false)} />
      )}

      {memberToKick && (
        <ConfirmDialog
          title="Remove player"
          message={`Remove ${memberToKick.name} from the lobby?`}
          confirmLabel="Remove"
          isSubmitting={isSubmitting}
          onConfirm={handleKick}
          onCancel={() => setMemberToKick(null)}
        />
      )}

      {isLeaveConfirmOpen && (
        <ConfirmDialog
          title="Leave lobby"
          message={
            isHost
              ? "Are you sure you want to leave? Host will transfer to the next player."
              : "Are you sure you want to leave this lobby?"
          }
          confirmLabel="Leave"
          isSubmitting={isSubmitting}
          onConfirm={handleLeave}
          onCancel={() => setIsLeaveConfirmOpen(false)}
        />
      )}

      {isCloseConfirmOpen && (
        <ConfirmDialog
          title="Close lobby"
          message="This will remove everyone from the lobby and end it. This can't be undone. Are you sure?"
          confirmLabel="Close lobby"
          isSubmitting={isSubmitting}
          onConfirm={handleClose}
          onCancel={() => setIsCloseConfirmOpen(false)}
        />
      )}
    </div>
  );
}