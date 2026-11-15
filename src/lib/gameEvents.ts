import type { Board, GameEvent, GamePlayer } from "../types/game";
import { money } from "./board";

// Event type numbers: GET /api/games/events/schema is the contract
// (types are never renumbered). Only the ones the UI reacts to are named.
export const EV = {
  GameStarted: 1,
  TurnStarted: 2,
  DiceRolled: 3,
  PassedStart: 4,
  LandedOn: 5,
  PropertyBought: 6,
  PropertyPassed: 7,
  RentPaid: 8,
  TaxPaid: 9,
  CardDrawn: 10,
  CardCash: 11,
  SentToDetention: 12,
  LeftDetention: 13,
  DetentionFailed: 14,
  DebtIncurred: 15,
  DebtPaid: 16,
  Built: 17,
  BuildingSold: 18,
  Mortgaged: 19,
  Unmortgaged: 20,
  TradeProposed: 21,
  TradeAccepted: 22,
  TradeDeclined: 23,
  TradeCancelled: 24,
  Bankrupt: 25,
  GameWon: 26,
  SeatTakenOverByBot: 27,
  TurnTimedOut: 28,
  GameAbandoned: 29,
} as const;

export const seqOf = (e: GameEvent) => e[0];
export const typeOf = (e: GameEvent) => e[2];
export const argsOf = (e: GameEvent) => e.slice(3);

interface Ctx {
  board: Board | null;
  players: GamePlayer[];
}

function seatName(ctx: Ctx, seat: number): string {
  if (seat < 0) return "The bank";
  const p = ctx.players.find((x) => x.seat === seat);
  return p ? p.firstName : `Seat ${seat + 1}`;
}

function tileName(ctx: Ctx, tile: number): string {
  return ctx.board?.tiles[tile]?.name ?? `tile ${tile}`;
}

// One plain sentence per event, for the activity list.
// Returns null for events that are noise in a log (e.g. a turn starting).
export function describeEvent(e: GameEvent, ctx: Ctx): string | null {
  const a = argsOf(e);
  const who = (i: number) => seatName(ctx, a[i]);
  switch (typeOf(e)) {
    case EV.GameStarted:
      return "The game started";
    case EV.DiceRolled:
      return `${who(0)} rolled ${a[1] + a[2]}`;
    case EV.PassedStart:
      return `${who(0)} passed Departure Gate and collected ${money(a[1])}`;
    case EV.LandedOn:
      return `${who(0)} landed on ${tileName(ctx, a[1])}`;
    case EV.PropertyBought:
      return `${who(0)} bought ${tileName(ctx, a[1])} for ${money(a[2])}`;
    case EV.PropertyPassed:
      return `${who(0)} passed on ${tileName(ctx, a[1])}`;
    case EV.RentPaid:
      return `${who(0)} paid ${who(1)} ${money(a[3])} rent on ${tileName(ctx, a[2])}`;
    case EV.TaxPaid:
      return `${who(0)} paid ${money(a[2])} at ${tileName(ctx, a[1])}`;
    case EV.CardDrawn:
      return `${who(0)} drew a Fortune card`;
    case EV.CardCash:
      return a[1] >= 0
        ? `${who(0)} received ${money(a[1])} from a card`
        : `${who(0)} paid ${money(-a[1])} because of a card`;
    case EV.SentToDetention:
      return `${who(0)} was sent to Detention Cove`;
    case EV.LeftDetention:
      return `${who(0)} left Detention Cove`;
    case EV.DetentionFailed:
      return `${who(0)} failed to roll doubles (attempt ${a[1]})`;
    case EV.DebtIncurred:
      return `${who(0)} owes ${who(1)} ${money(a[2])}`;
    case EV.DebtPaid:
      return `${who(0)} paid a ${money(a[2])} debt to ${who(1)}`;
    case EV.Built:
      return `${who(0)} built on ${tileName(ctx, a[1])} (${a[2] >= 5 ? "hotel" : `${a[2]} house${a[2] === 1 ? "" : "s"}`})`;
    case EV.BuildingSold:
      return `${who(0)} sold a building on ${tileName(ctx, a[1])} for ${money(a[3])}`;
    case EV.Mortgaged:
      return `${who(0)} mortgaged ${tileName(ctx, a[1])} for ${money(a[2])}`;
    case EV.Unmortgaged:
      return `${who(0)} lifted the mortgage on ${tileName(ctx, a[1])}`;
    case EV.TradeProposed:
      return `${who(0)} proposed a trade to ${who(1)}`;
    case EV.TradeAccepted:
      return `${who(1)} accepted a trade with ${who(0)}`;
    case EV.TradeDeclined:
      return `${who(1)} declined a trade from ${who(0)}`;
    case EV.TradeCancelled:
      return `${who(0)} cancelled a trade`;
    case EV.Bankrupt:
      return `${who(0)} went bankrupt`;
    case EV.GameWon:
      return `${who(0)} won the game`;
    case EV.SeatTakenOverByBot:
      return a[1] === 0 ? `${who(0)} left; a bot took the seat` : `${who(0)} missed turns; a bot took the seat`;
    case EV.TurnTimedOut:
      return `${who(0)} ran out of time`;
    case EV.GameAbandoned:
      return "The game was abandoned";
    default:
      return null; // TurnStarted and unknown (newer) types
  }
}

export type PopupKind = "bought" | "rent" | "start" | "detention" | "built" | "tax" | "bankrupt";

export interface Popup {
  key: number; // event sequence, unique per popup
  kind: PopupKind;
  title: string;
  actorSeat: number;
  otherSeat?: number; // rent payer -> owner
  detail?: string;
  amount?: number;
  tileColorGroup?: string | null;
  tileName?: string;
}

// Events that deserve the 4-second popup over the board centre (design screen 6).
// Fortune cards are shown by CardModal instead, so they are not here.
export function popupForEvent(e: GameEvent, ctx: Ctx): Popup | null {
  const a = argsOf(e);
  const key = seqOf(e);
  const tile = (i: number) => ctx.board?.tiles[i];
  switch (typeOf(e)) {
    case EV.PropertyBought:
      return { key, kind: "bought", title: "Property bought", actorSeat: a[0], tileName: tile(a[1])?.name, tileColorGroup: tile(a[1])?.colorGroup, amount: a[2] };
    case EV.RentPaid:
      return { key, kind: "rent", title: "Rent paid", actorSeat: a[0], otherSeat: a[1], tileName: tile(a[2])?.name, tileColorGroup: tile(a[2])?.colorGroup, amount: a[3] };
    case EV.PassedStart:
      return { key, kind: "start", title: "Passed Departure Gate", actorSeat: a[0], amount: a[1] };
    case EV.SentToDetention:
      return { key, kind: "detention", title: "Sent to Detention Cove", actorSeat: a[0], detail: "Pay the fine, use a Harbour Pass, or roll doubles to leave." };
    case EV.Built:
      return { key, kind: "built", title: "Building added", actorSeat: a[0], tileName: tile(a[1])?.name, tileColorGroup: tile(a[1])?.colorGroup, amount: a[3] };
    case EV.TaxPaid:
      return { key, kind: "tax", title: "Tax paid", actorSeat: a[0], tileName: tile(a[1])?.name, amount: a[2] };
    case EV.Bankrupt:
      return { key, kind: "bankrupt", title: "Bankrupt", actorSeat: a[0], detail: `${seatName(ctx, a[0])} is out of the game.` };
    default:
      return null;
  }
}

