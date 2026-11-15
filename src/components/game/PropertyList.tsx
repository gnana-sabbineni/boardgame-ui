import { useCallback, useEffect, useState } from "react";
import { House } from "lucide-react";
import type { GameApi } from "../../hooks/useGame";
import type { OwnedProperty, PlayerProperties, PropertyGroup } from "../../types/game";
import { ApiError } from "../../api/client";
import type { PropertyAction } from "../../api/games";
import { GROUP_COLORS, NEUTRAL_TILE_COLOR, groupLabel, money } from "../../lib/board";

export function groupColor(group: string): string {
  return GROUP_COLORS[group.toLowerCase()] ?? NEUTRAL_TILE_COLOR;
}

/**
 * Loads GET /games/players/{id}/properties and reloads it whenever the
 * game changes (latest activity sequence is a cheap "something happened" key).
 */
export function usePlayerProperties(g: GameApi, userId: string | null) {
  const [data, setData] = useState<PlayerProperties | null>(null);
  const [error, setError] = useState<string | null>(null);
  const changeKey = g.game?.recentEvents[0]?.[0] ?? 0;

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      setData(await g.api.getPlayerProperties(userId));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load properties.");
    }
    // g.api is a stable module object
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load, changeKey]);

  return { data, error, reload: load };
}

const smallBtn =
  "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40";
const greenBtn = `${smallBtn} border-accent text-accent hover:bg-accent hover:text-bg`;
const greyBtn = `${smallBtn} border-white/15 text-text/80 hover:border-white/30`;

interface PropertyListProps {
  g: GameApi;
  groups: PropertyGroup[];
  manage: boolean; // show build / sell / mortgage buttons
  onChanged?: () => void;
}

// Design screens 5 and 7. Buttons only appear in manage mode; the server
// still validates every action (even building, evenly, sell-before-mortgage...)
// and its message is shown in the game's error banner.
export function PropertyList({ g, groups, manage, onChanged }: PropertyListProps) {
  const { busy, run, api } = g;

  async function act(p: OwnedProperty, action: PropertyAction) {
    await run(() => api.managePropertyAction(p.tileIndex, action));
    onChanged?.();
  }

  if (groups.length === 0) return <div className="text-sm text-text/40">No properties yet.</div>;

  return (
    <div className="flex flex-col gap-[18px]">
      {groups.map((grp) => {
        const color = groupColor(grp.group);
        return (
          <div key={grp.group} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-[3px]" style={{ background: color }} />
                <div className="text-xs uppercase tracking-widest text-white/50">{groupLabel(grp.group)}</div>
              </div>
              {grp.ownsWholeGroup && <div className="text-[11px] text-accent-hover">Full set</div>}
            </div>
            {grp.properties.map((p) => (
              <div key={p.tileIndex} className="flex items-center justify-between gap-2 rounded-lg bg-bg px-3 py-2.5">
                <div className="min-w-0">
                  <div className={`truncate text-[13px] ${p.isMortgaged ? "text-text/60" : "text-text"}`}>{p.name}</div>
                  <div className="text-[11px] text-text/40">
                    {p.isMortgaged ? "Mortgaged" : `Rent now ${money(p.currentRent)}`}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {p.houses > 0 && (
                    <div className="flex items-center gap-[3px] text-sm text-text/60" title={`${p.houses} building(s)`}>
                      {Array.from({ length: Math.min(p.houses, 5) }, (_, k) => (
                        <House key={k} size={14} />
                      ))}
                    </div>
                  )}
                  {manage && !p.isMortgaged && p.houseCost > 0 && (
                    <>
                      <button className={greenBtn} disabled={busy} onClick={() => act(p, "build")}>
                        Build −{money(p.houseCost)}
                      </button>
                      {p.houses > 0 && (
                        <button className={greyBtn} disabled={busy} onClick={() => act(p, "sell-building")}>
                          Sell +{money(Math.floor(p.houseCost / 2))}
                        </button>
                      )}
                    </>
                  )}
                  {manage && p.isMortgaged && (
                    <button className={greenBtn} disabled={busy} onClick={() => act(p, "unmortgage")}>
                      Lift −{money(Math.ceil((p.price / 2) * 1.1))}
                    </button>
                  )}
                  {manage && !p.isMortgaged && p.houses === 0 && (
                    <button className={greyBtn} disabled={busy} onClick={() => act(p, "mortgage")}>
                      Mortgage +{money(Math.floor(p.price / 2))}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
