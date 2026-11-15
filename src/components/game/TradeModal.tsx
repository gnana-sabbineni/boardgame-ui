import { useState } from "react";
import { ArrowLeftRight, Plus, X } from "lucide-react";
import type { GameApi } from "../../hooks/useGame";
import type { Board, GamePlayer } from "../../types/game";
import { GROUP_COLORS, NEUTRAL_TILE_COLOR, groupLabel, money, playerName } from "../../lib/board";
import { ApiError } from "../../api/client";
import { DialogHeader, GameDialog, SectionLabel } from "./GameDialog";
import { PieceAvatar } from "./PieceAvatar";

interface TradeModalProps {
  g: GameApi;
  board: Board;
  onClose: () => void;
}

// Design screen 4. The server validates ownership, mortgages and cash; we only
// build the request and show its error message if it is refused.
export function TradeModal({ g, board, onClose }: TradeModalProps) {
  const { game, me, myUserId, busy, api } = g;
  const others = (game?.players ?? []).filter((p) => p.userId !== myUserId && !p.isBankrupt);
  const [partnerId, setPartnerId] = useState<string | null>(others[0]?.userId ?? null);
  const [offerTiles, setOfferTiles] = useState<number[]>([]);
  const [requestTiles, setRequestTiles] = useState<number[]>([]);
  const [offerCash, setOfferCash] = useState("0");
  const [requestCash, setRequestCash] = useState("0");
  const [picking, setPicking] = useState<"offer" | "request" | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (!game || !me) return null;

  const partner = others.find((p) => p.userId === partnerId) ?? null;
  const value = (tiles: number[], cash: string) =>
    tiles.reduce((s, i) => s + (board.tiles[i]?.price ?? 0), 0) + (parseInt(cash, 10) || 0);

  function choosePartner(p: GamePlayer) {
    setPartnerId(p.userId);
    setRequestTiles([]); // their properties changed, so clear the old selection
    setPicking(null);
  }

  const toggle = (list: number[], set: (v: number[]) => void, i: number) =>
    set(list.includes(i) ? list.filter((x) => x !== i) : [...list, i]);

  async function send() {
    if (!partner) return;
    setError(null);
    const oc = parseInt(offerCash, 10) || 0;
    const rc = parseInt(requestCash, 10) || 0;
    if (oc < 0 || rc < 0) return setError("Cash can't be negative.");
    if (!offerTiles.length && !requestTiles.length && !oc && !rc) return setError("Add something to the trade.");
    try {
      await api.proposeTrade({
        recipientUserId: partner.userId,
        offerCash: oc,
        requestCash: rc,
        offeredTileIndexes: offerTiles,
        requestedTileIndexes: requestTiles,
      });
      await g.refreshTrades();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send the trade.");
    }
  }

  return (
    <GameDialog widthClass="max-w-[760px]" onClose={onClose}>
      <DialogHeader title="Propose trade" onClose={onClose} />

      <div className="mb-6 flex flex-col gap-2.5">
        <SectionLabel>Trade with</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {others.length === 0 && <div className="text-sm text-text/40">No one to trade with.</div>}
          {others.map((p) => {
            const sel = p.userId === partnerId;
            return (
              <button
                key={p.userId}
                onClick={() => choosePartner(p)}
                className={`flex items-center gap-2 rounded-full border py-[5px] pl-[5px] pr-3.5 ${
                  sel ? "border-accent bg-accent/10" : "border-white/15"
                }`}
              >
                <PieceAvatar player={p} myUserId={myUserId} size={26} />
                <span className={`text-[13px] ${sel ? "font-medium text-text" : "text-text/60"}`}>{playerName(p)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-[1fr_auto_1fr] items-stretch gap-4">
        <Side
          title="You offer"
          total={value(offerTiles, offerCash)}
          board={board}
          tiles={offerTiles}
          onRemove={(i) => toggle(offerTiles, setOfferTiles, i)}
          onAdd={() => setPicking(picking === "offer" ? null : "offer")}
          cash={offerCash}
          setCash={setOfferCash}
          maxCash={me.cash}
        />
        <div className="flex items-center">
          <ArrowLeftRight size={20} className="text-text/40" />
        </div>
        <Side
          title="You request"
          total={value(requestTiles, requestCash)}
          board={board}
          tiles={requestTiles}
          onRemove={(i) => toggle(requestTiles, setRequestTiles, i)}
          onAdd={() => partner && setPicking(picking === "request" ? null : "request")}
          cash={requestCash}
          setCash={setRequestCash}
          maxCash={partner?.cash ?? 0}
        />
      </div>

      {picking && (
        <TilePicker
          board={board}
          tiles={(picking === "offer" ? me : partner)?.ownedTileIndexes ?? []}
          selected={picking === "offer" ? offerTiles : requestTiles}
          onToggle={(i) =>
            picking === "offer" ? toggle(offerTiles, setOfferTiles, i) : toggle(requestTiles, setRequestTiles, i)
          }
          onDone={() => setPicking(null)}
        />
      )}

      {error && <p className="mb-3 text-sm text-danger">{error}</p>}

      <div className="flex items-center justify-between">
        <div className="text-xs text-text/40">
          {partner ? `${partner.firstName} can accept or decline.` : ""}
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-text transition-colors hover:border-white/30"
          >
            Cancel
          </button>
          <button
            disabled={busy || !partner}
            onClick={send}
            className="rounded-lg border border-accent px-5 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-bg disabled:opacity-40"
          >
            Send proposal
          </button>
        </div>
      </div>
    </GameDialog>
  );
}

interface SideProps {
  title: string;
  total: number;
  board: Board;
  tiles: number[];
  onRemove: (i: number) => void;
  onAdd: () => void;
  cash: string;
  setCash: (v: string) => void;
  maxCash: number;
}

function Side({ title, total, board, tiles, onRemove, onAdd, cash, setCash, maxCash }: SideProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 p-4">
      <div className="flex items-center justify-between">
        <SectionLabel>{title}</SectionLabel>
        <div className="text-xs text-text/40">Value {money(total)}</div>
      </div>
      {tiles.map((i) => {
        const t = board.tiles[i];
        const color = t?.colorGroup ? GROUP_COLORS[t.colorGroup] : NEUTRAL_TILE_COLOR;
        return (
          <div key={i} className="flex items-center gap-2.5 rounded-lg bg-bg px-3 py-2.5">
            <div className="h-6 w-1 rounded-sm" style={{ background: color }} />
            <div className="flex-1">
              <div className="text-[13px] text-text">{t?.name}</div>
              <div className="text-[11px] text-text/40">
                {t?.colorGroup ? groupLabel(t.colorGroup) : t?.type} · {money(t?.price ?? 0)}
              </div>
            </div>
            <button onClick={() => onRemove(i)} aria-label={`Remove ${t?.name}`}>
              <X size={14} className="text-text/40 hover:text-text" />
            </button>
          </div>
        );
      })}
      <button
        onClick={onAdd}
        className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/15 py-2 text-[13px] text-text/60 transition-colors hover:border-white/30"
      >
        <Plus size={14} /> Add property
      </button>
      <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-bg px-3 py-2">
        <span className="text-[13px] text-text/40">Cash $</span>
        <input
          type="number"
          min={0}
          max={maxCash}
          value={cash}
          onChange={(e) => setCash(e.target.value)}
          className="w-full bg-transparent text-right text-sm font-medium text-text outline-none"
        />
      </label>
    </div>
  );
}

function TilePicker({
  board,
  tiles,
  selected,
  onToggle,
  onDone,
}: {
  board: Board;
  tiles: number[];
  selected: number[];
  onToggle: (i: number) => void;
  onDone: () => void;
}) {
  return (
    <div className="mb-5 rounded-xl border border-white/10 p-3">
      <div className="mb-2 flex items-center justify-between">
        <SectionLabel>Pick properties</SectionLabel>
        <button onClick={onDone} className="text-xs text-accent hover:text-accent-hover">
          Done
        </button>
      </div>
      {tiles.length === 0 && <div className="text-sm text-text/40">No properties to choose from.</div>}
      <div className="flex flex-wrap gap-2">
        {tiles.map((i) => {
          const t = board.tiles[i];
          const on = selected.includes(i);
          return (
            <button
              key={i}
              onClick={() => onToggle(i)}
              className={`rounded-full border px-3 py-1 text-xs ${
                on ? "border-accent bg-accent/10 text-text" : "border-white/15 text-text/60"
              }`}
            >
              {t?.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
