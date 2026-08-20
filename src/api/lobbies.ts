import { apiFetch } from "./client";
import { ApiError } from "./client";
import type { Lobby } from "../types/lobby";

export interface CreateLobbyPayload {
  maxPlayers: number;
}

export function createLobby(payload: CreateLobbyPayload) {
  return apiFetch<Lobby>("/lobbies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// GetCurrent returns a 404 (not a 200-with-null) when the user has no active
// lobby — that's the expected "no lobby" case here, not a real error.
export async function getCurrentLobby(): Promise<Lobby | null> {
  try {
    return await apiFetch<Lobby>("/lobbies/current");
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export function inviteToLobby(inviteeUserId: string) {
  return apiFetch<null>("/lobbies/invites", {
    method: "POST",
    body: JSON.stringify({ inviteeUserId }),
  });
}

export function leaveLobby() {
  return apiFetch<null>("/lobbies/leave", { method: "POST" });
}

export function kickMember(targetUserId: string) {
  return apiFetch<null>(`/lobbies/kick/${targetUserId}`, { method: "POST" });
}

export function startGame() {
  return apiFetch<null>("/lobbies/start", { method: "POST" });
}

export function closeLobby() {
  return apiFetch<null>("/lobbies/close", { method: "POST" });
}