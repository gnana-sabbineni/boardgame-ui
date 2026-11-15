// Mirrors BoardWalk.Monopoly.Contracts (see boardwalk-api/docs/GAME_API.md).
// The API serialises with camelCase, so property names here are camelCase.

export type TileType =
  | "Start"
  | "Property"
  | "Station"
  | "Utility"
  | "Tax"
  | "Chance"
  | "Detention"
  | "RestStop"
  | "GoToDetention";

export interface Tile {
  index: number;
  name: string;
  type: TileType;
  colorGroup: string | null;
  price: number;
  houseCost: number;
  taxAmount: number;
  rentTiers: number[]; // [base, 1 house, 2, 3, 4, hotel]
}

export interface Board {
  tiles: Tile[];
  passStartSalary: number;
  startingCash: number;
  detentionFine: number;
}

export interface GamePlayer {
  userId: string;
  firstName: string;
  lastName: string;
  seat: number;
  cash: number;
  position: number;
  inJail: boolean;
  getOutOfJailCards: number;
  isBankrupt: boolean;
  isCurrentTurn: boolean;
  controlledBy: string; // "Human" | "Bot"
  ownedTileIndexes: number[];
}

export interface GameProperty {
  tileIndex: number;
  ownerUserId: string | null;
  houses: number;
  isMortgaged: boolean;
}

export interface ChanceCard {
  id: number;
  title: string;
  description: string;
}

export interface PendingDebt {
  amount: number;
  creditorUserId: string | null;
}

export type GameAction =
  | "roll"
  | "buy"
  | "pass"
  | "endTurn"
  | "payJailFine"
  | "useJailCard"
  | "payDebt"
  | "declareBankruptcy"
  | "manageProperties"
  | "proposeTrade";

// [sequence, turn, type, ...args]; seats are TurnOrder numbers, -1 is the bank.
export type GameEvent = number[];

export interface GameState {
  id: string;
  status: string;
  currentTurnUserId: string;
  turnNumber: number;
  hasRolled: boolean;
  die1: number;
  die2: number;
  doublesCount: number;
  pendingPurchaseTileIndex: number | null;
  pendingDebt: PendingDebt | null;
  lastChanceCard: ChanceCard | null;
  winnerUserId: string | null;
  turnDeadlineAt: string | null;
  serverTime: string;
  players: GamePlayer[];
  properties: GameProperty[];
  recentEvents: GameEvent[]; // newest first
  availableActions: GameAction[];
}

export interface RollResult {
  die1: number;
  die2: number;
  isDoubles: boolean;
  state: GameState;
}

export interface OwnedProperty {
  tileIndex: number;
  name: string;
  price: number;
  houseCost: number;
  houses: number;
  isMortgaged: boolean;
  currentRent: number;
}

export interface PropertyGroup {
  group: string;
  ownsWholeGroup: boolean;
  properties: OwnedProperty[];
}

export interface PlayerProperties {
  userId: string;
  firstName: string;
  lastName: string;
  cash: number;
  isBankrupt: boolean;
  totalHouses: number;
  totalHotels: number;
  canManage: boolean;
  groups: PropertyGroup[];
}

export interface Trade {
  id: string;
  proposerUserId: string;
  proposerName: string;
  recipientUserId: string;
  recipientName: string;
  offerCash: number;
  requestCash: number;
  offeredTileIndexes: number[];
  requestedTileIndexes: number[];
  status: string;
  createdAt: string;
}

export interface ProposeTradePayload {
  recipientUserId: string;
  offerCash: number;
  requestCash: number;
  offeredTileIndexes: number[];
  requestedTileIndexes: number[];
}
