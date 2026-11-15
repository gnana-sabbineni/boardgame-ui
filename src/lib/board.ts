import type { Tile } from "../types/game";

// Server colour-group key -> design colour. The server has 8 street groups;
// the design has 8 swatches, mapped in board order (first group to last).
export const GROUP_COLORS: Record<string, string> = {
  sand: "#8f735e",
  seafoam: "#d98f5c",
  coral: "#cfb054",
  amber: "#c9759b",
  orchid: "#9479cf",
  sky: "#4fa9b8",
  rose: "#5b86d6",
  indigo: "#7d86a6",
};
export const NEUTRAL_TILE_COLOR = "#6b6e7e";

export function groupLabel(group: string | null): string {
  if (!group) return "";
  return group.charAt(0).toUpperCase() + group.slice(1);
}

export function tileColor(tile: Tile): string {
  if (tile.colorGroup && GROUP_COLORS[tile.colorGroup]) return GROUP_COLORS[tile.colorGroup];
  return NEUTRAL_TILE_COLOR;
}

export type Side = "b" | "l" | "t" | "r";

// Same mapping as the design: tile 0 is bottom-right, going clockwise.
export function tilePlacement(i: number): { row: number; col: number; side: Side } {
  if (i <= 10) return { row: 11, col: 11 - i, side: "b" };
  if (i <= 20) return { col: 1, row: 11 - (i - 10), side: "l" };
  if (i <= 30) return { row: 1, col: 1 + (i - 20), side: "t" };
  return { col: 11, row: 1 + (i - 30), side: "r" };
}

export const isCorner = (i: number) => i % 10 === 0;

export function money(n: number): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString("en-US")}`;
}

export function playerName(p: { firstName: string; lastName: string }): string {
  return `${p.firstName} ${p.lastName}`.trim();
}
