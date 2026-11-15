import { apiFetch, ApiError } from "./client";
import type {
  Board,
  GameState,
  PlayerProperties,
  ProposeTradePayload,
  RollResult,
  Trade,
} from "../types/game";

// The game always acts on the caller's current game, so no game id is sent.
const post = <T = GameState>(path: string, body?: unknown) =>
  apiFetch<T>(`/games${path}`, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });

export const getBoard = () => apiFetch<Board>("/games/board");

// 404 means "not in a game" (never started, or finished): not an error here.
export async function getCurrentGame(): Promise<GameState | null> {
  try {
    return await apiFetch<GameState>("/games/current");
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export const rollDice = () => post<RollResult>("/roll");
export const buyProperty = () => post("/buy");
export const passProperty = () => post("/pass");
export const endTurn = () => post("/end-turn");
export const payJailFine = () => post("/jail/pay");
export const useJailCard = () => post("/jail/card");
export const payDebt = () => post("/debt/pay");
export const declareBankruptcy = () => post("/bankruptcy");

export const getPlayerProperties = (userId: string) =>
  apiFetch<PlayerProperties>(`/games/players/${userId}/properties`);

export type PropertyAction = "build" | "sell-building" | "mortgage" | "unmortgage";
export const managePropertyAction = (tileIndex: number, action: PropertyAction) =>
  post(`/properties/${tileIndex}/${action}`);

export const getTrades = () => apiFetch<Trade[]>("/games/trades");
export const proposeTrade = (payload: ProposeTradePayload) => post<Trade>("/trades", payload);
export const acceptTrade = (id: string) => post(`/trades/${id}/accept`);
export const declineTrade = (id: string) => post(`/trades/${id}/decline`);
export const cancelTrade = (id: string) => post(`/trades/${id}/cancel`);
