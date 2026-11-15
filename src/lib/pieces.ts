import { Sailboat, Anchor, ShipWheel, Compass, Bird, Fish, type LucideIcon } from "lucide-react";

// A player's piece is chosen from their seat. (The design has a "choose your
// piece" lobby screen, but the API has no piece endpoint yet, so the seat
// decides. When the API grows one, replace this lookup.)
const PIECES: { name: string; icon: LucideIcon }[] = [
  { name: "Sailboat", icon: Sailboat },
  { name: "Anchor", icon: Anchor },
  { name: "Ship's wheel", icon: ShipWheel },
  { name: "Compass", icon: Compass },
  { name: "Gull", icon: Bird },
  { name: "Fish", icon: Fish },
];

export function pieceFor(seat: number) {
  return PIECES[((seat % PIECES.length) + PIECES.length) % PIECES.length];
}

// "You" get the green avatar from the design; everyone else is neutral grey.
export const ME_BG = "#1d4b39";
export const OTHER_BG = "#3a3d4d";
