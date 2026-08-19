import { useEffect, useState, useCallback, startTransition, type ReactNode } from "react";
import { getLobbyConnection } from "../signalr/lobbyConnection";
import { getCurrentLobby } from "../api/lobbies";
import { useAuth } from "./auth-context";
import { LobbyContext } from "./lobby-context";
import type { Lobby } from "../types/lobby";

export function LobbyProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [currentLobby, setCurrentLobby] = useState<Lobby | null>(null);
  const [isLoading, setIsLoading] = useState(true);

const refreshCurrentLobby = useCallback(async () => {
  const lobby = await getCurrentLobby();
  setCurrentLobby(lobby);
  return lobby; 
}, []);

  useEffect(() => {
    console.log("LobbyProvider effect running, token:", token);
    if (!token) {
      console.log("No token — bailing out before connecting.");
      startTransition(() => {
        setCurrentLobby(null);
        setIsLoading(false);
      });
      return;
    }

    let isStale = false;
    const conn = getLobbyConnection(token);

    function syncFromServer() {
      getCurrentLobby().then((lobby) => {
        if (!isStale) setCurrentLobby(lobby);
      });
    }

    conn.on("MemberJoined", syncFromServer);
    conn.on("MemberLeft", syncFromServer);
    conn.on("MemberKicked", syncFromServer);
    conn.on("MemberRemovedForDisconnect", syncFromServer);
    conn.on("GameStarting", syncFromServer);

    conn.on("MemberOnline", (userId: string) => {
      setCurrentLobby((prev) =>
        prev
          ? { ...prev, members: prev.members.map((m) => (m.userId === userId ? { ...m, isOnline: true } : m)) }
          : prev
      );
    });
    conn.on("MemberOffline", (userId: string) => {
      setCurrentLobby((prev) =>
        prev
          ? { ...prev, members: prev.members.map((m) => (m.userId === userId ? { ...m, isOnline: false } : m)) }
          : prev
      );
    });

    conn.onreconnected(syncFromServer);

    (async () => {
      setIsLoading(true);
      try {
          console.log("conn.state before start:", conn.state);
          if (conn.state === "Disconnected") {
            console.log("Calling conn.start()...");
            await conn.start();
            console.log("conn.start() succeeded, state:", conn.state);
          }
          const lobby = await getCurrentLobby();
          if (!isStale) setCurrentLobby(lobby);
        } catch (err) {
          console.error("SignalR connection failed:", err);
        } finally {
          if (!isStale) setIsLoading(false);
        }
    })();

    return () => {
      isStale = true;
      conn.off("MemberJoined", syncFromServer);
      conn.off("MemberLeft", syncFromServer);
      conn.off("MemberKicked", syncFromServer);
      conn.off("MemberRemovedForDisconnect", syncFromServer);
      conn.off("GameStarting", syncFromServer);
      conn.off("MemberOnline");
      conn.off("MemberOffline");
    };
  }, [token]);

  return (
    <LobbyContext.Provider value={{ currentLobby, isLoading, refreshCurrentLobby, setCurrentLobby }}>
      {children}
    </LobbyContext.Provider>
  );
}