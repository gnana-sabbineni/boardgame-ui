import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";
import { useGame } from "../hooks/useGame";
import { useLobby } from "../context/lobby-context";
import { leaveLobby } from "../api/lobbies";
import { ApiError } from "../api/client";
import { playerName } from "../lib/board";
import { Board } from "../components/game/Board";
import { CenterPanel } from "../components/game/CenterPanel";
import { Sidebar } from "../components/game/Sidebar";
import { TradesInbox } from "../components/game/TradesInbox";
import { PurchaseModal } from "../components/game/PurchaseModal";
import { CardModal } from "../components/game/CardModal";
import { TradeModal } from "../components/game/TradeModal";
import { PropertiesPanel } from "../components/game/PropertiesPanel";
import { LowFundsModal } from "../components/game/LowFundsModal";
import { GameDialog } from "../components/game/GameDialog";

export function Game() {
  const g = useGame();
  const navigate = useNavigate();
  const { refreshCurrentLobby } = useLobby();
  const { board, game, isLoading, notInGame, winnerUserId, myUserId } = g;

  const [tradeOpen, setTradeOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  // No game (never started, or already finished): go back to the lobby/home.
  useEffect(() => {
    if (!isLoading && notInGame && !winnerUserId) navigate("/home", { replace: true });
  }, [isLoading, notInGame, winnerUserId, navigate]);

  async function leaveToHome() {
    await refreshCurrentLobby().catch(() => null);
    navigate("/home", { replace: true });
  }

  async function handleLeave() {
    setLeaving(true);
    setLeaveError(null);
    try {
      // Leaving mid-game hands the seat to a bot (no rejoin yet).
      await leaveLobby();
      await leaveToHome();
    } catch (err) {
      setLeaveError(err instanceof ApiError ? err.message : "Couldn't leave the game.");
      setLeaving(false);
    }
  }

  if (isLoading || !board || !game) {
    return (
      <div className="min-h-screen bg-bg">
        <AppHeader />
        <p className="p-8 text-sm text-text/50">{g.actionError ?? "Loading game…"}</p>
      </div>
    );
  }

  const winner = winnerUserId ? game.players.find((p) => p.userId === winnerUserId) : null;
  const iAmOut = g.me?.isBankrupt ?? false;
  const highlight = game.pendingPurchaseTileIndex;
  const round = Math.max(1, Math.floor((game.turnNumber - 1) / Math.max(1, game.players.length)) + 1);

  return (
    <div className="min-h-screen bg-bg">
      <AppHeader />

      <div className="flex items-center justify-between border-b border-accent/25 bg-accent/8 px-8 py-3.5">
        <div className="flex items-center gap-2.5 text-sm">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <span className="font-medium text-text">In game</span>
          <span className="text-text/40">&middot;</span>
          <span className="text-text/60">Monopoly</span>
          <span className="text-text/40">&middot;</span>
          <span className="text-text/60">Round {round}</span>
        </div>
        <button
          onClick={() => setLeaveOpen(true)}
          className="rounded-lg border border-danger px-3.5 py-1.5 text-[13px] font-medium text-danger transition-colors hover:bg-danger hover:text-bg"
        >
          Leave game
        </button>
      </div>

      {g.actionError && (
        <div
          role="alert"
          className="mx-8 mt-4 flex items-center justify-between rounded-lg border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger"
        >
          <span>{g.actionError}</span>
          <button onClick={g.clearError} className="text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      <main className="flex flex-col gap-8 p-8 xl:flex-row">
        <Board
          board={board}
          players={game.players}
          properties={game.properties}
          myUserId={myUserId}
          highlightTile={highlight}
        >
          <CenterPanel g={g} board={board} onOpenTrade={() => setTradeOpen(true)} />
        </Board>

        <div className="flex min-w-0 flex-1 flex-col gap-7">
          <TradesInbox g={g} board={board} />
          <Sidebar g={g} board={board} onSelectPlayer={setSelectedPlayer} />
        </div>
      </main>

      {iAmOut && !winner && (
        <p className="px-8 pb-8 text-sm text-text/50">You're out of the game. You can keep watching until it ends.</p>
      )}

      {/* Dialogs. At most one decision dialog is open at a time. */}
      {!tradeOpen && !selectedPlayer && <PurchaseModal g={g} board={board} />}
      {!tradeOpen && !selectedPlayer && <LowFundsModal g={g} onOpenTrade={() => setTradeOpen(true)} />}
      {g.card && <CardModal card={g.card} onClose={g.dismissCard} />}
      {tradeOpen && <TradeModal g={g} board={board} onClose={() => setTradeOpen(false)} />}
      {selectedPlayer && (
        <PropertiesPanel g={g} userId={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}

      {leaveOpen && (
        <GameDialog onClose={() => !leaving && setLeaveOpen(false)}>
          <h2 className="mb-2 text-lg font-semibold text-text">Leave the game?</h2>
          <p className="mb-5 text-sm text-text/70">
            A bot will take over your seat and you won't be able to rejoin.
          </p>
          {leaveError && <p className="mb-4 text-sm text-danger">{leaveError}</p>}
          <div className="flex justify-end gap-3">
            <button
              disabled={leaving}
              onClick={() => setLeaveOpen(false)}
              className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-text hover:border-white/30"
            >
              Stay
            </button>
            <button
              disabled={leaving}
              onClick={handleLeave}
              className="rounded-lg border border-danger px-4 py-2.5 text-sm font-semibold text-danger hover:bg-danger hover:text-bg disabled:opacity-50"
            >
              {leaving ? "Leaving…" : "Leave game"}
            </button>
          </div>
        </GameDialog>
      )}

      {winnerUserId && (
        <GameDialog>
          <h2 className="mb-2 text-xl font-semibold text-text">
            {winnerUserId === myUserId ? "You won! 🎉" : `${winner ? playerName(winner) : "A player"} won`}
          </h2>
          <p className="mb-5 text-sm text-text/70">The game is over and the lobby has closed.</p>
          <button
            onClick={leaveToHome}
            className="w-full rounded-lg border border-accent px-4 py-2.5 text-sm font-semibold text-accent hover:bg-accent hover:text-bg"
          >
            Back to home
          </button>
        </GameDialog>
      )}
    </div>
  );
}
