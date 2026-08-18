import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection | null = null;

const HUB_URL = import.meta.env.VITE_LOBBY_HUB_URL;

export function getLobbyConnection(token: string): signalR.HubConnection {
  if (connection) return connection;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${HUB_URL}?access_token=${token}`)
    .withAutomaticReconnect([0, 2000, 5000, 10000, 15000])
    .build();

  return connection;
}

export function resetLobbyConnection() {
  connection = null;
}