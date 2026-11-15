import { ArrowRight, Anchor, House, Lock, Receipt, ShoppingBag, TriangleAlert, type LucideIcon } from "lucide-react";
import type { GameApi } from "../../hooks/useGame";
import type { PopupKind } from "../../lib/gameEvents";
import { GROUP_COLORS, money } from "../../lib/board";
import { PieceAvatar } from "./PieceAvatar";

const KIND_ICON: Record<PopupKind, LucideIcon> = {
  bought: ShoppingBag,
  rent: ArrowRight,
  start: Anchor,
  detention: Lock,
  built: House,
  tax: Receipt,
  bankrupt: TriangleAlert,
};

// Design screen 6: a card over the board centre that auto-dismisses after 4s.
export function ActivityPopup({ g }: { g: GameApi }) {
  const { popup, game, myUserId, dismissPopup } = g;
  if (!popup || !game) return null;

  const actor = game.players.find((p) => p.seat === popup.actorSeat);
  const other = popup.otherSeat !== undefined ? game.players.find((p) => p.seat === popup.otherSeat) : undefined;
  const Icon = KIND_ICON[popup.kind];
  const color = popup.tileColorGroup ? GROUP_COLORS[popup.tileColorGroup] : null;
  const gain = popup.kind === "start";

  return (
    // Sits at the top of the board centre with no backdrop, so the timer, dice and
    // action buttons below stay visible and clickable while it shows.
    <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center">
      <div
        key={popup.key}
        role="status"
        onClick={dismissPopup}
        className="pointer-events-auto flex w-80 cursor-pointer flex-col gap-3 rounded-2xl border border-accent/30 bg-surface p-4 shadow-xl"
      >
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50">
          <Icon size={14} className="text-accent" />
          {popup.title}
        </div>

        <div className="flex items-center gap-3.5">
          {actor && <PieceAvatar player={actor} myUserId={myUserId} size={44} />}
          {other && (
            <>
              <ArrowRight size={16} className="text-text/40" />
              <PieceAvatar player={other} myUserId={myUserId} size={44} />
            </>
          )}
          <div className="text-base font-medium text-text">
            {actor?.firstName}
            {other && <span className="text-text/50"> → {other.firstName}</span>}
          </div>
        </div>

        {popup.tileName && (
          <div
            className="rounded-lg px-3 py-2.5 text-sm text-text"
            style={{
              background: `color-mix(in oklab, ${color ?? "#6b6e7e"} 22%, #232532)`,
              border: `1px solid color-mix(in oklab, ${color ?? "#6b6e7e"} 75%, transparent)`,
            }}
          >
            {popup.tileName}
          </div>
        )}

        {popup.amount !== undefined && (
          <div className={`text-[28px] font-semibold ${gain ? "text-accent-hover" : "text-text"}`}>
            {gain ? "+" : ""}
            {money(popup.amount)}
          </div>
        )}
        {popup.detail && <div className="text-sm leading-relaxed text-text/60">{popup.detail}</div>}

        <div className="h-0.5 overflow-hidden rounded-[1px] bg-white/10">
          <div className="h-full bg-accent" style={{ animation: "popup-drain 4s linear forwards" }} />
        </div>
      </div>
    </div>
  );
}
