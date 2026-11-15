import { useState } from "react";
import type { GameApi } from "../../hooks/useGame";
import { money, playerName } from "../../lib/board";
import { DialogHeader, GameDialog } from "./GameDialog";
import { PieceAvatar } from "./PieceAvatar";
import { PropertyList, usePlayerProperties } from "./PropertyList";

// Design screen 5. Click any player card to see their holdings; on your own
// turn you can switch to manage mode (build, sell, mortgage).
export function PropertiesPanel({ g, userId, onClose }: { g: GameApi; userId: string; onClose: () => void }) {
  const { game, myUserId, actions, busy, run, api } = g;
  const { data, error, reload } = usePlayerProperties(g, userId);
  const [manage, setManage] = useState(false);
  const player = game?.players.find((p) => p.userId === userId);
  if (!game || !player) return null;

  const mine = userId === myUserId;
  const canManage = !!data?.canManage && mine && actions.has("manageProperties");

  return (
    <GameDialog widthClass="max-w-[460px]" onClose={onClose}>
      <DialogHeader title={playerName(player) + (mine ? " (you)" : "")} onClose={onClose} />
      <div className="-mt-3 mb-5 flex items-center gap-3.5">
        <PieceAvatar player={player} myUserId={myUserId} size={52} />
        <div className={`text-xs ${player.isCurrentTurn ? "text-accent-hover" : "text-text/40"}`}>
          {player.isBankrupt ? "Bankrupt" : player.isCurrentTurn ? (mine ? "Your turn" : "Their turn") : "Waiting"}
          {player.controlledBy !== "Human" && " · bot"}
          {player.inJail && " · in Detention Cove"}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Stat label="Cash" value={money(player.cash)} />
        <Stat
          label="Houses / hotels"
          value={data ? `${data.totalHouses} / ${data.totalHotels}` : "–"}
        />
      </div>

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}
      {data && <PropertyList g={g} groups={data.groups} manage={manage && canManage} onChanged={reload} />}
      {!data && !error && <div className="text-sm text-text/40">Loading…</div>}

      {mine && (
        <div className="mt-6 flex items-center justify-between gap-2.5 pt-1">
          {actions.has("declareBankruptcy") ? (
            <button
              disabled={busy}
              onClick={() => {
                if (window.confirm("Declare bankruptcy? You will leave the game and your assets go to your creditor or the bank.")) {
                  void run(api.declareBankruptcy);
                  onClose();
                }
              }}
              className="rounded-lg border border-danger px-4 py-2 text-[13px] font-medium text-danger transition-colors hover:bg-danger hover:text-bg disabled:opacity-40"
            >
              Declare bankruptcy
            </button>
          ) : (
            <span />
          )}
          {canManage && (
            <button
              onClick={() => setManage((m) => !m)}
              className="rounded-lg border border-accent px-4 py-2 text-[13px] font-medium text-accent transition-colors hover:bg-accent hover:text-bg"
            >
              {manage ? "Done managing" : "Manage properties"}
            </button>
          )}
        </div>
      )}
    </GameDialog>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 px-3.5 py-3">
      <div className="text-xs text-text/40">{label}</div>
      <div className="mt-1 text-xl font-semibold text-text">{value}</div>
    </div>
  );
}
