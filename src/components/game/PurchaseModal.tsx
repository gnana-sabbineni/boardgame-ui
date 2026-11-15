import type { ReactNode } from "react";
import { Building2, House } from "lucide-react";
import type { GameApi } from "../../hooks/useGame";
import type { Board } from "../../types/game";
import { GROUP_COLORS, groupLabel, money } from "../../lib/board";
import { DialogHeader, GameDialog, SectionLabel } from "./GameDialog";

const STATION_RENT = [25, 50, 100, 200]; // 1-4 stations owned (docs/GAME_API.md)

function RentRow({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="flex justify-between border-b border-white/5 py-2 text-[13px] last:border-0">
      <span className="flex items-center gap-1.5 text-text/60">
        {icon}
        {label}
      </span>
      <span className="text-text">{value}</span>
    </div>
  );
}

// Design screen 2. Shown to the player who landed on an unowned property
// (server says so via availableActions containing "buy" + pendingPurchaseTileIndex).
export function PurchaseModal({ g, board }: { g: GameApi; board: Board }) {
  const { game, me, busy, api, run, actions } = g;
  const idx = game?.pendingPurchaseTileIndex;
  if (!game || !me || idx === null || idx === undefined || !actions.has("buy")) return null;

  const tile = board.tiles[idx];
  if (!tile) return null;

  const color = tile.colorGroup ? GROUP_COLORS[tile.colorGroup] : "#6b6e7e";
  const groupTiles = tile.colorGroup ? board.tiles.filter((t) => t.colorGroup === tile.colorGroup) : [];
  const eyebrow =
    tile.type === "Property"
      ? `${groupLabel(tile.colorGroup)} group · ${groupTiles.findIndex((t) => t.index === idx) + 1} of ${groupTiles.length}`
      : tile.type;
  const canAfford = me.cash >= tile.price;

  return (
    <GameDialog widthClass="max-w-[400px]">
      <div className="-mx-6 -mt-6 mb-5 h-2.5 rounded-t-2xl" style={{ background: color }} />
      <DialogHeader title={tile.name} eyebrow={eyebrow} />

      <div className="mb-5 flex items-baseline justify-between rounded-xl border border-white/10 px-4 py-3.5">
        <span className="text-[13px] text-text/60">Price</span>
        <span className="text-[22px] font-semibold text-text">{money(tile.price)}</span>
      </div>

      <div className="mb-5">
        <SectionLabel>Rent</SectionLabel>
        <div className="mt-1.5">
          {tile.type === "Property" && tile.rentTiers.length >= 6 && (
            <>
              <RentRow label="Base" value={money(tile.rentTiers[0])} />
              <RentRow label="Full set (base × 2)" value={money(tile.rentTiers[0] * 2)} />
              {[1, 2, 3, 4].map((n) => (
                <RentRow
                  key={n}
                  label={`${n} house${n > 1 ? "s" : ""}`}
                  value={money(tile.rentTiers[n])}
                  icon={<House size={13} />}
                />
              ))}
              <RentRow label="Hotel" value={money(tile.rentTiers[5])} icon={<Building2 size={13} />} />
            </>
          )}
          {tile.type === "Station" &&
            STATION_RENT.map((r, i) => (
              <RentRow key={r} label={`${i + 1} station${i ? "s" : ""} owned`} value={money(r)} />
            ))}
          {tile.type === "Utility" && (
            <>
              <RentRow label="One utility owned" value="4 × dice" />
              <RentRow label="Both utilities owned" value="10 × dice" />
            </>
          )}
        </div>
        <div className="mt-2 flex gap-4 text-xs text-text/40">
          {tile.houseCost > 0 && <span>House cost {money(tile.houseCost)}</span>}
          <span>Mortgage {money(Math.floor(tile.price / 2))}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className={`text-xs ${canAfford ? "text-text/40" : "text-danger"}`}>You have {money(me.cash)}</div>
        <div className="flex gap-2.5">
          <button
            disabled={busy}
            onClick={() => run(api.passProperty)}
            className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-text transition-colors hover:border-white/30 disabled:opacity-40"
          >
            Pass
          </button>
          <button
            disabled={busy || !canAfford}
            onClick={() => run(api.buyProperty)}
            className="rounded-lg border border-accent px-5 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-bg disabled:cursor-not-allowed disabled:opacity-40"
          >
            Buy for {money(tile.price)}
          </button>
        </div>
      </div>
    </GameDialog>
  );
}
