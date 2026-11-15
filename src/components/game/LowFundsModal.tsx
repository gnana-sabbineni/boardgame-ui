import { ArrowRight, CircleAlert } from "lucide-react";
import type { GameApi } from "../../hooks/useGame";
import { money } from "../../lib/board";
import { GameDialog, SectionLabel } from "./GameDialog";
import { PieceAvatar } from "./PieceAvatar";
import { PropertyList, usePlayerProperties } from "./PropertyList";

// Design screen 7. Appears for the active player while the server holds a
// pendingDebt: raise cash (sell buildings, mortgage), trade, pay, or go bankrupt.
export function LowFundsModal({ g, onOpenTrade }: { g: GameApi; onOpenTrade: () => void }) {
  const { game, me, myUserId, actions, busy, run, api } = g;
  const { data, error, reload } = usePlayerProperties(g, myUserId);
  const debt = game?.pendingDebt;
  if (!game || !me || !debt || !game.pendingDebt || game.currentTurnUserId !== myUserId) return null;

  const creditor = debt.creditorUserId ? game.players.find((p) => p.userId === debt.creditorUserId) : null;
  const short = Math.max(0, debt.amount - me.cash);
  const canPay = short === 0;
  const raised = Math.min(100, Math.round((me.cash / debt.amount) * 100));

  return (
    <GameDialog widthClass="max-w-[540px]" borderClass="border-danger/45">
      <div className="mb-4 flex items-center gap-2 text-danger">
        <CircleAlert size={18} />
        <h2 className="text-lg font-semibold">Not enough cash</h2>
      </div>

      <div className="mb-5 flex items-center gap-3.5">
        <PieceAvatar player={me} myUserId={myUserId} size={36} />
        <ArrowRight size={16} className="text-text/40" />
        {creditor ? <PieceAvatar player={creditor} myUserId={myUserId} size={36} /> : null}
        <div className="text-sm text-text/70">
          You owe <span className="font-medium text-text">{creditor ? creditor.firstName : "the bank"} {money(debt.amount)}</span>.
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <Figure label="Owed" value={money(debt.amount)} />
        <Figure label="Cash now" value={money(me.cash)} />
        <Figure label="Still short" value={money(short)} danger={short > 0} />
      </div>

      <div className="mb-5">
        <div className="mb-1.5 flex justify-between text-xs text-text/50">
          <span>{canPay ? "You can cover it" : `Raise ${money(short)} more`}</span>
          <span>{raised}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-accent transition-all" style={{ width: `${raised}%` }} />
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-2">
        <SectionLabel>Mortgage or sell</SectionLabel>
        {error && <p className="text-sm text-danger">{error}</p>}
        {data && <PropertyList g={g} groups={data.groups} manage onChanged={reload} />}
        <div className="text-xs text-text/40">Sell every house in a group before mortgaging its properties.</div>
      </div>

      {g.actionError && <p className="mb-3 text-sm text-danger">{g.actionError}</p>}

      <div className="flex items-center justify-between gap-3">
        {actions.has("declareBankruptcy") && (
          <button
            disabled={busy}
            onClick={() => {
              if (window.confirm("Declare bankruptcy? You will leave the game.")) void run(api.declareBankruptcy);
            }}
            className="rounded-lg border border-danger px-4 py-2 text-[13px] font-medium text-danger transition-colors hover:bg-danger hover:text-bg disabled:opacity-40"
          >
            Declare bankruptcy
          </button>
        )}
        <div className="flex items-center gap-2.5">
          {actions.has("proposeTrade") && (
            <button
              onClick={onOpenTrade}
              className="rounded-lg border border-white/15 px-4 py-2 text-[13px] font-medium text-text transition-colors hover:border-white/30"
            >
              Propose trade
            </button>
          )}
          <button
            disabled={busy || !canPay || !actions.has("payDebt")}
            onClick={() => run(api.payDebt)}
            className="rounded-lg border border-accent px-4 py-2 text-[13px] font-medium text-accent transition-colors hover:bg-accent hover:text-bg disabled:cursor-not-allowed disabled:opacity-40"
          >
            Pay {money(debt.amount)}
          </button>
        </div>
      </div>
    </GameDialog>
  );
}

function Figure({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 px-3.5 py-3">
      <div className="text-xs text-text/40">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${danger ? "text-danger" : "text-text"}`}>{value}</div>
    </div>
  );
}
