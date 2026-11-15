import { ArrowLeftRight, Dices } from "lucide-react";
import type { GameApi } from "../../hooks/useGame";
import type { Board } from "../../types/game";
import { money } from "../../lib/board";
import { PieceAvatar } from "./PieceAvatar";
import { ActivityPopup } from "./ActivityPopup";

const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function Die({ value, rolling }: { value: number; rolling: boolean }) {
  const on = new Set(PIPS[value] ?? []);
  return (
    <div
      className={`grid h-[84px] w-[84px] grid-cols-3 grid-rows-3 gap-1 rounded-xl border border-white/20 bg-surface p-3.5 ${
        rolling ? "animate-pulse" : ""
      }`}
      aria-label={`Die showing ${value || "nothing"}`}
    >
      {Array.from({ length: 9 }, (_, k) => (
        <div key={k} className="flex items-center justify-center">
          <div className="h-[13px] w-[13px] rounded-full bg-text" style={{ opacity: on.has(k) ? 1 : 0 }} />
        </div>
      ))}
    </div>
  );
}

const btnBase =
  "flex items-center gap-2 rounded-lg border bg-transparent px-5 py-2.5 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40";
const btnPrimary = `${btnBase} border-accent text-accent hover:bg-accent hover:text-bg`;
const btnSecondary = `${btnBase} border-white/15 text-text hover:border-white/30`;

interface CenterPanelProps {
  g: GameApi;
  board: Board;
  onOpenTrade: () => void;
}

export function CenterPanel({ g, board, onOpenTrade }: CenterPanelProps) {
  const { game, me, actions, busy, api, run, secondsLeft, turnSeconds, isRolling, isMyTurn, myUserId } = g;
  if (!game) return null;

  const current = game.players.find((p) => p.userId === game.currentTurnUserId);
  const roller = current ? (isMyTurn ? "Your turn" : `${current.firstName}'s turn`) : "";
  const landed = current ? board.tiles[current.position] : null;
  const rolled = game.hasRolled ? game.die1 + game.die2 : null;

  const low = secondsLeft !== null && secondsLeft <= 10;
  const pct = secondsLeft === null ? 0 : Math.min(100, (secondsLeft / turnSeconds) * 100);
  const timerText = secondsLeft === null ? "--" : `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;
  const ring = low ? "#e5626a" : "#34a273";

  return (
    <>
      {/* title */}
      <div className="flex flex-col items-center gap-1.5">
        <div className="pl-[0.32em] text-4xl font-medium tracking-[0.32em] text-text">BOARDWALK</div>
        <div className="text-xs uppercase tracking-[0.08em] text-white/40">Monopoly</div>
      </div>

      {/* whose turn / what happened */}
      <div className="flex items-center gap-2.5 rounded-full border border-accent/35 py-1.5 pl-1.5 pr-3.5">
        {current && <PieceAvatar player={current} myUserId={myUserId} size={28} />}
        <div className="text-sm font-medium text-text">
          {roller}
          {rolled !== null && landed && (
            <span className="font-normal text-text/50">
              {" "}
              · rolled {rolled}, landed on {landed.name}
            </span>
          )}
        </div>
      </div>

      {/* timer + dice */}
      <div className="flex items-center gap-4">
        <div
          className="flex h-[116px] w-[116px] shrink-0 items-center justify-center rounded-full"
          style={{ background: `conic-gradient(${ring} ${pct}%, rgba(255,255,255,0.10) 0)` }}
        >
          <div className="flex h-[104px] w-[104px] flex-col items-center justify-center gap-0.5 rounded-full bg-bg">
            <div className="text-[28px] font-semibold tabular-nums text-text">{timerText}</div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-white/50">Turn time</div>
          </div>
        </div>
        <div className="mx-5 h-[84px] w-px bg-white/10" />
        <Die value={game.die1} rolling={isRolling} />
        <Die value={game.die2} rolling={isRolling} />
      </div>

      {/* Buttons come from availableActions: the server owns the rules. */}
      <div className="flex flex-wrap justify-center gap-3">
        {actions.has("roll") && (
          <button className={btnPrimary} disabled={busy} onClick={() => run(api.rollDice)}>
            <Dices size={16} /> Roll dice
          </button>
        )}
        {actions.has("payJailFine") && (
          <button className={btnPrimary} disabled={busy} onClick={() => run(api.payJailFine)}>
            Pay {money(board.detentionFine)} fine
          </button>
        )}
        {actions.has("useJailCard") && (
          <button className={btnSecondary} disabled={busy} onClick={() => run(api.useJailCard)}>
            Use Harbour Pass
          </button>
        )}
        {actions.has("proposeTrade") && (
          <button className={btnSecondary} disabled={busy} onClick={onOpenTrade}>
            <ArrowLeftRight size={16} /> Trade
          </button>
        )}
        {actions.has("endTurn") && (
          <button className={btnSecondary} disabled={busy} onClick={() => run(api.endTurn)}>
            End turn
          </button>
        )}
        {!isMyTurn && me && !me.isBankrupt && (
          <div className="py-2.5 text-sm text-text/40">Waiting for {current?.firstName ?? "the next player"}…</div>
        )}
      </div>

      <ActivityPopup g={g} />
    </>
  );
}
