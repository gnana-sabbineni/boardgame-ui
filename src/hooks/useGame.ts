import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/auth-context";
import { getLobbyConnection } from "../signalr/lobbyConnection";
import { ApiError } from "../api/client";
import * as gamesApi from "../api/games";
import type { Board, ChanceCard, GameState, Trade } from "../types/game";
import { popupForEvent, seqOf, type Popup } from "../lib/gameEvents";

const POPUP_MS = 4000;
const TURN_SECONDS = 60; // only used to size the timer ring; the server owns the real deadline

// .NET may serialise a UTC DateTime without a trailing "Z"; treat it as UTC.
function parseUtc(s: string): number {
  return Date.parse(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : `${s}Z`);
}

/**
 * Everything the game screen needs: static board (fetched once), live state
 * (re-fetched whenever the server says GameUpdated), trades, a countdown
 * based on the server's clock, popups derived from new activity events, and
 * wrapped actions that surface rule errors (400s) instead of throwing.
 */
export function useGame() {
  const { token, user } = useAuth();
  const [board, setBoard] = useState<Board | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notInGame, setNotInGame] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [card, setCard] = useState<ChanceCard | null>(null);
  const [winnerUserId, setWinnerUserId] = useState<string | null>(null);
  const [popupQueue, setPopupQueue] = useState<Popup[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  const lastSeqRef = useRef<number | null>(null); // null until the first load: no popups for history
  const requestRef = useRef(0); // ignore out-of-order responses
  const boardRef = useRef<Board | null>(null);
  const clockOffsetRef = useRef(0); // serverNow - clientNow, ms
  const deadlineRef = useRef<number | null>(null);

  const applyState = useCallback((state: GameState) => {
    setGame(state);
    clockOffsetRef.current = parseUtc(state.serverTime) - Date.now();
    deadlineRef.current = state.turnDeadlineAt ? parseUtc(state.turnDeadlineAt) : null;
    if (state.winnerUserId) setWinnerUserId(state.winnerUserId);

    // New events -> popups (oldest first). recentEvents is newest first.
    const maxSeq = state.recentEvents.reduce((m, e) => Math.max(m, seqOf(e)), 0);
    if (lastSeqRef.current === null) {
      lastSeqRef.current = maxSeq;
    } else if (maxSeq > lastSeqRef.current) {
      const since = lastSeqRef.current;
      const ctx = { board: boardRef.current, players: state.players };
      const fresh = state.recentEvents
        .filter((e) => seqOf(e) > since)
        .reverse()
        .map((e) => popupForEvent(e, ctx))
        .filter((p): p is Popup => p !== null);
      lastSeqRef.current = maxSeq;
      if (fresh.length) setPopupQueue((q) => [...q, ...fresh].slice(-6));
    }
  }, []);

  const refresh = useCallback(async () => {
    const id = ++requestRef.current;
    try {
      const state = await gamesApi.getCurrentGame();
      if (id !== requestRef.current) return;
      if (state === null) {
        setNotInGame(true);
        return;
      }
      setNotInGame(false);
      applyState(state);
    } catch (err) {
      if (id === requestRef.current) {
        setActionError(err instanceof ApiError ? err.message : "Couldn't load the game.");
      }
    }
  }, [applyState]);

  const refreshTrades = useCallback(async () => {
    try {
      setTrades(await gamesApi.getTrades());
    } catch {
      /* trades are secondary; the next TradeUpdated retries */
    }
  }, []);

  // Initial load: board once (it never changes), then state and trades.
  useEffect(() => {
    if (!token) return;
    let stale = false;
    (async () => {
      try {
        const b = await gamesApi.getBoard();
        if (stale) return;
        boardRef.current = b;
        setBoard(b);
      } catch (err) {
        if (!stale) setActionError(err instanceof ApiError ? err.message : "Couldn't load the board.");
      }
      await refresh();
      await refreshTrades();
      if (!stale) setIsLoading(false);
    })();
    return () => {
      stale = true;
    };
  }, [token, refresh, refreshTrades]);

  // Realtime: the lobby hub (already connected by LobbyProvider) carries game events.
  useEffect(() => {
    if (!token || !user) return;
    const conn = getLobbyConnection(token);
    const myId = user.id;

    const onUpdated = () => void refresh();
    const onTrade = () => void refreshTrades();
    let active = true;
    let rollTimer: ReturnType<typeof setTimeout> | undefined;
    const onDice = () => {
      setIsRolling(true);
      clearTimeout(rollTimer);
      rollTimer = setTimeout(() => setIsRolling(false), 700);
    };
    const onCard = (userId: string, c: ChanceCard) => {
      if (userId === myId) setCard(c);
    };
    const onFinished = (winnerId: string) => {
      setWinnerUserId(winnerId);
      void refresh();
    };
    // After a dropped connection we may have missed events: resync everything.
    const onReconnected = () => {
      if (!active) return; // the hub has no "remove reconnected handler"
      void refresh();
      void refreshTrades();
    };

    conn.on("GameUpdated", onUpdated);
    conn.on("PlayerReplacedByBot", onUpdated);
    conn.on("TradeUpdated", onTrade);
    conn.on("DiceRolled", onDice);
    conn.on("CardDrawn", onCard);
    conn.on("GameFinished", onFinished);
    conn.onreconnected(onReconnected);
    return () => {
      active = false;
      clearTimeout(rollTimer);
      conn.off("GameUpdated", onUpdated);
      conn.off("PlayerReplacedByBot", onUpdated);
      conn.off("TradeUpdated", onTrade);
      conn.off("DiceRolled", onDice);
      conn.off("CardDrawn", onCard);
      conn.off("GameFinished", onFinished);
    };
  }, [token, user, refresh, refreshTrades]);

  // Countdown on the SERVER's clock: deadline - (now + offset), so a wrong
  // client clock cannot make the timer lie.
  useEffect(() => {
    const tick = () => {
      const d = deadlineRef.current;
      if (d === null) return setSecondsLeft(null);
      const ms = d - (Date.now() + clockOffsetRef.current);
      setSecondsLeft(Math.max(0, Math.ceil(ms / 1000)));
    };
    tick();
    const iv = setInterval(tick, 250);
    return () => clearInterval(iv);
  }, [game?.turnDeadlineAt, game?.serverTime]);

  // Show queued popups one at a time for 4 seconds each.
  const popup = popupQueue[0] ?? null;
  useEffect(() => {
    if (!popup) return;
    const t = setTimeout(() => setPopupQueue((q) => q.slice(1)), POPUP_MS);
    return () => clearTimeout(t);
  }, [popup]);

  // Run an action; show a rule violation as a message; always resync after.
  const run = useCallback(
    async (fn: () => Promise<unknown>) => {
      setBusy(true);
      setActionError(null);
      try {
        const result = await fn();
        if (result && typeof result === "object") {
          const r = result as { state?: GameState; players?: unknown };
          if (r.state) applyState(r.state);
          else if (r.players) applyState(result as GameState);
        }
      } catch (err) {
        setActionError(err instanceof ApiError ? err.message : "Something went wrong.");
        void refresh();
      } finally {
        setBusy(false);
      }
    },
    [applyState, refresh]
  );

  const me = useMemo(() => game?.players.find((p) => p.userId === user?.id) ?? null, [game, user]);
  const isMyTurn = !!game && game.currentTurnUserId === user?.id;
  const actions = useMemo(() => new Set(game?.availableActions ?? []), [game]);

  return {
    board,
    game,
    me,
    myUserId: user?.id ?? null,
    isMyTurn,
    actions,
    trades,
    isLoading,
    notInGame,
    busy,
    actionError,
    clearError: () => setActionError(null),
    card,
    dismissCard: () => setCard(null),
    winnerUserId,
    popup,
    dismissPopup: () => setPopupQueue((q) => q.slice(1)),
    isRolling,
    secondsLeft,
    turnSeconds: TURN_SECONDS,
    refresh,
    refreshTrades,
    run,
    api: gamesApi,
  };
}

export type GameApi = ReturnType<typeof useGame>;
