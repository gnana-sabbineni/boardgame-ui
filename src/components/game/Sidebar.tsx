import { Play } from "lucide-react";
import type { GameApi } from "../../hooks/useGame";
import type { Board } from "../../types/game";
import { GROUP_COLORS, NEUTRAL_TILE_COLOR, money, playerName } from "../../lib/board";
import { describeEvent, seqOf } from "../../lib/gameEvents";
import { PieceAvatar } from "./PieceAvatar";
import { SectionLabel } from "./GameDialog";

interface SidebarProps {
  g: GameApi;
  board: Board;
  onSelectPlayer: (userId: string) => void;
}

export function Sidebar({ g, board, onSelectPlayer }: SidebarProps) {
  const { game, myUserId } = g;
  if (!game) return null;

  const ctx = { board, players: game.players };
  const log = game.recentEvents
    .map((e) => ({ seq: seqOf(e), text: describeEvent(e, ctx) }))
    .filter((x): x is { seq: number; text: string } => x.text !== null)
    .slice(0, 12);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-7">
      <div className="flex flex-col gap-3">
        <SectionLabel>Players</SectionLabel>
        {game.players.map((p) => {
          const mine = p.userId === myUserId;
          const tile = board.tiles[p.position];
          const status = p.isBankrupt
            ? "Bankrupt"
            : p.isCurrentTurn
              ? mine
                ? "Your turn"
                : "Taking their turn"
              : p.inJail
                ? "In Detention Cove"
                : `On ${tile?.name ?? "the board"}`;
          // One swatch per owned tile, in the group colour (grey for stations/utilities).
          const swatches = p.ownedTileIndexes.map((i) => {
            const t = board.tiles[i];
            return t?.colorGroup ? (GROUP_COLORS[t.colorGroup] ?? NEUTRAL_TILE_COLOR) : NEUTRAL_TILE_COLOR;
          });
          return (
            <button
              key={p.userId}
              onClick={() => onSelectPlayer(p.userId)}
              className={`flex flex-col gap-3 rounded-2xl border bg-surface p-4 text-left transition-colors hover:border-white/30 ${
                p.isCurrentTurn ? "border-accent/35" : "border-white/10"
              } ${p.isBankrupt ? "opacity-50" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <PieceAvatar player={p} myUserId={myUserId} size={40} />
                  {p.isCurrentTurn && !p.isBankrupt && (
                    <div className="absolute -right-[7px] -top-[5px] flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-bg">
                      <Play size={9} className="fill-accent-hover text-accent-hover" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-text">
                    {playerName(p)}
                    {mine && <span className="font-normal text-text/40"> (you)</span>}
                    {p.controlledBy !== "Human" && <span className="font-normal text-text/40"> · bot</span>}
                  </div>
                  <div className={`text-xs ${p.isCurrentTurn && !p.isBankrupt ? "text-accent-hover" : "text-text/40"}`}>
                    {status}
                  </div>
                </div>
                <div className="text-base font-semibold tabular-nums text-text">{money(p.cash)}</div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1">
                  {swatches.map((c, k) => (
                    <div key={k} className="h-3 w-3 rounded-[3px]" style={{ background: c }} />
                  ))}
                </div>
                <div className="shrink-0 text-xs text-text/40">
                  {p.ownedTileIndexes.length} {p.ownedTileIndexes.length === 1 ? "property" : "properties"}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        <SectionLabel>Activity</SectionLabel>
        <div className="flex flex-col gap-2.5 text-xs leading-snug text-text/50">
          {log.length === 0 && <div>Nothing yet.</div>}
          {log.map((l) => (
            <div key={l.seq}>{l.text}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
