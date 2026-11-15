import type { GamePlayer } from "../../types/game";
import { pieceFor, ME_BG, OTHER_BG } from "../../lib/pieces";

interface PieceAvatarProps {
  player: Pick<GamePlayer, "seat" | "userId">;
  myUserId: string | null;
  size?: number; // px
}

export function PieceAvatar({ player, myUserId, size = 40 }: PieceAvatarProps) {
  const Icon = pieceFor(player.seat).icon;
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full text-text"
      style={{ width: size, height: size, background: player.userId === myUserId ? ME_BG : OTHER_BG }}
    >
      <Icon size={Math.round(size * 0.5)} />
    </div>
  );
}
