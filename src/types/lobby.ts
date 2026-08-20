export interface LobbyMember {
  userId: string;
  firstName: string;
  lastName: string;
  isHost: boolean;
  isOnline: boolean;
}

export type LobbyStatusValue = "Open" | "InProgress" | "Closed";

export interface Lobby {
  id: string;
  hostUserId: string;
  status: LobbyStatusValue;
  maxPlayers: number;
  members: LobbyMember[];
  createdAt: string;
}