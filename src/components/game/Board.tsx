import type { CSSProperties, ReactNode } from "react";
import {
  Anchor,
  Lightbulb,
  Lock,
  Receipt,
  Sunrise,
  TramFront,
  TriangleAlert,
  Waves,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Board as BoardData, GamePlayer, GameProperty, Tile } from "../../types/game";
import { isCorner, money, tileColor, tilePlacement } from "../../lib/board";
import { pieceFor, ME_BG, OTHER_BG } from "../../lib/pieces";

const TILE_ICONS: Record<string, LucideIcon> = {
  Start: Anchor,
  Detention: Lock,
  RestStop: Sunrise,
  GoToDetention: TriangleAlert,
  Station: TramFront,
  Chance: Waves,
  Tax: Receipt,
};

function tileIcon(tile: Tile): LucideIcon | null {
  if (tile.type === "Utility") return tile.name.toLowerCase().includes("power") ? Zap : Lightbulb;
  if (tile.type === "Chance") return Waves;
  return TILE_ICONS[tile.type] ?? null;
}

const CORNER_SUB: Record<string, string> = {
  Start: "Collect salary as you pass",
  Detention: "Just visiting",
  RestStop: "Rest a turn",
  GoToDetention: "Go to Detention Cove",
};

const FLEX_DIR: Record<string, CSSProperties["flexDirection"]> = {
  b: "column",
  t: "column-reverse",
  l: "row-reverse",
  r: "row",
};

interface BoardProps {
  board: BoardData;
  players: GamePlayer[];
  properties: GameProperty[];
  myUserId: string | null;
  highlightTile?: number | null;
  children: ReactNode; // the centre panel
}

export function Board({ board, players, properties, myUserId, highlightTile, children }: BoardProps) {
  const propByTile = new Map(properties.map((p) => [p.tileIndex, p]));
  const playerById = new Map(players.map((p) => [p.userId, p]));
  const alive = players.filter((p) => !p.isBankrupt);

  return (
    <div
      className="grid aspect-square w-full max-w-[884px] shrink-0 gap-[3px] overflow-hidden rounded-2xl border-2 border-white/30 bg-bg p-1"
      style={{
        gridTemplateColumns: "1.55fr repeat(9, 1fr) 1.55fr",
        gridTemplateRows: "1.55fr repeat(9, 1fr) 1.55fr",
      }}
    >
      {board.tiles.map((tile) => {
        const { row, col, side } = tilePlacement(tile.index);
        const vertical = side === "b" || side === "t";
        const color = tile.colorGroup ? tileColor(tile) : null;
        const prop = propByTile.get(tile.index);
        const owner = prop?.ownerUserId ? playerById.get(prop.ownerUserId) : undefined;
        const here = alive.filter((p) => p.position === tile.index);
        const Icon = tileIcon(tile);
        const corner = isCorner(tile.index);
        const buyable = tile.price > 0;
        const subline = tile.type === "Tax" ? `Pay ${money(tile.taxAmount)}` : buyable && !owner ? money(tile.price) : null;
        const houses = prop?.houses ?? 0;

        return (
          <div
            key={tile.index}
            title={tile.name}
            className="relative flex min-h-0 min-w-0 overflow-hidden rounded-md"
            style={{
              gridRow: row,
              gridColumn: col,
              flexDirection: FLEX_DIR[side],
              background: color
                ? `color-mix(in oklab, ${color} 22%, #232532)`
                : "color-mix(in oklab, #e9e9ed 5%, #232532)",
              border: `1px solid ${
                color
                  ? `color-mix(in oklab, ${color} 75%, transparent)`
                  : corner
                    ? "rgba(52,162,115,0.5)"
                    : "rgba(255,255,255,0.22)"
              }`,
              boxShadow: highlightTile === tile.index ? "0 0 0 2px #34a273 inset" : undefined,
              opacity: prop?.isMortgaged ? 0.55 : 1,
            }}
          >
            {color && (
              <div
                className="flex shrink-0 items-center justify-center gap-[3px]"
                style={{
                  background: color,
                  width: vertical ? "100%" : 7,
                  height: vertical ? 7 : "100%",
                  flexDirection: vertical ? "row" : "column",
                }}
              >
                {houses >= 5 ? (
                  <div className="h-[5px] w-3 rounded-[1px] bg-bg" title="Hotel" />
                ) : (
                  Array.from({ length: houses }, (_, k) => (
                    <div key={k} className="h-[5px] w-[5px] rounded-[1px] bg-bg" />
                  ))
                )}
              </div>
            )}

            {corner ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-1.5 p-2 text-center">
                {Icon && <Icon size={26} className="text-accent" />}
                <div className="text-xs font-semibold tracking-wide text-text">{tile.name}</div>
                <div className="text-[10px] leading-tight text-text/40">{CORNER_SUB[tile.type]}</div>
              </div>
            ) : (
              <div className="flex min-w-0 flex-1 flex-col items-center justify-between gap-[3px] px-1 py-1.5 text-center">
                <div className="flex flex-col items-center gap-[3px]">
                  {Icon && <Icon size={16} style={{ color: color ?? "rgba(233,233,237,0.6)" }} />}
                  <div className="text-[10px] font-medium leading-tight text-text [text-wrap:balance]">{tile.name}</div>
                </div>
                {owner && (
                  <div
                    className="flex h-[18px] w-[18px] items-center justify-center rounded-full"
                    style={{ background: owner.userId === myUserId ? ME_BG : OTHER_BG }}
                    title={`Owned by ${owner.firstName}`}
                  >
                    {(() => {
                      const OwnerIcon = pieceFor(owner.seat).icon;
                      return <OwnerIcon size={10} className="text-text" />;
                    })()}
                  </div>
                )}
                {subline && <div className="text-[10px] text-text/50">{subline}</div>}
              </div>
            )}

            {here.length > 0 && (
              <div className="absolute left-[3px] top-[3px] flex">
                {here.map((p, k) => {
                  const PieceIcon = pieceFor(p.seat).icon;
                  const mine = p.userId === myUserId;
                  return (
                    <div
                      key={p.userId}
                      title={p.firstName}
                      className="flex h-6 w-6 items-center justify-center rounded-full border-2"
                      style={{
                        background: mine ? ME_BG : OTHER_BG,
                        borderColor: mine ? "#34a273" : "#161826",
                        marginLeft: k ? -6 : 0,
                      }}
                    >
                      <PieceIcon size={13} className="text-text" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Centre: tiles 1-9 on each side leave an inner 9x9 area */}
      <div
        className="relative flex flex-col items-center justify-center gap-9 bg-bg p-10"
        style={{ gridRow: "2 / 11", gridColumn: "2 / 11" }}
      >
        {children}
      </div>
    </div>
  );
}

