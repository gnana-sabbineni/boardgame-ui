import type { GameApi } from "../../hooks/useGame";
import type { Board, Trade } from "../../types/game";
import { money } from "../../lib/board";
import { SectionLabel } from "./GameDialog";

function summarize(board: Board, cash: number, tiles: number[]): string {
  const parts = tiles.map((i) => board.tiles[i]?.name ?? `tile ${i}`);
  if (cash > 0) parts.push(money(cash));
  return parts.length ? parts.join(", ") : "nothing";
}

// Pending trades you proposed or received (GET /games/trades). The recipient
// accepts or declines; the proposer can cancel. The server revalidates on accept.
export function TradesInbox({ g, board }: { g: GameApi; board: Board }) {
  const { trades, myUserId, busy, run, api, refreshTrades } = g;
  const pending = trades.filter((t) => t.status.toLowerCase() === "pending");
  if (pending.length === 0) return null;

  async function act(fn: (id: string) => Promise<unknown>, t: Trade) {
    await run(() => fn(t.id));
    await refreshTrades();
  }

  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Trade offers</SectionLabel>
      {pending.map((t) => {
        const incoming = t.recipientUserId === myUserId;
        return (
          <div key={t.id} className="flex flex-col gap-2.5 rounded-2xl border border-accent/35 bg-surface p-4 text-[13px]">
            <div className="text-text">
              {incoming ? `${t.proposerName} offers you a trade` : `Your offer to ${t.recipientName}`}
            </div>
            <div className="text-xs leading-relaxed text-text/60">
              {incoming ? "You get: " : "You give: "}
              <span className="text-text">{summarize(board, t.offerCash, t.offeredTileIndexes)}</span>
              <br />
              {incoming ? "You give: " : "You get: "}
              <span className="text-text">{summarize(board, t.requestCash, t.requestedTileIndexes)}</span>
            </div>
            <div className="flex justify-end gap-2">
              {incoming ? (
                <>
                  <button
                    disabled={busy}
                    onClick={() => act(api.declineTrade, t)}
                    className="rounded-md border border-white/15 px-3 py-1.5 text-xs font-medium text-text hover:border-white/30 disabled:opacity-40"
                  >
                    Decline
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => act(api.acceptTrade, t)}
                    className="rounded-md border border-accent px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent hover:text-bg disabled:opacity-40"
                  >
                    Accept
                  </button>
                </>
              ) : (
                <button
                  disabled={busy}
                  onClick={() => act(api.cancelTrade, t)}
                  className="rounded-md border border-white/15 px-3 py-1.5 text-xs font-medium text-text hover:border-white/30 disabled:opacity-40"
                >
                  Cancel offer
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
