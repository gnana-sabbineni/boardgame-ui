import { createContext, useContext } from "react";
import type { Lobby } from "../types/lobby";

export interface LobbyContextValue {
  currentLobby: Lobby | null;
  isLoading: boolean;
  refreshCurrentLobby: () => Promise<Lobby | null>; // now returns the fetched lobby
  setCurrentLobby: (lobby: Lobby | null) => void;
}

export const LobbyContext = createContext<LobbyContextValue | undefined>(undefined);

export function useLobby() {
  const ctx = useContext(LobbyContext);
  if (!ctx) throw new Error("useLobby must be used inside LobbyProvider");
  return ctx;
}