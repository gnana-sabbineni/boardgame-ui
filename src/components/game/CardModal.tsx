import { Waves, Ship } from "lucide-react";
import type { ChanceCard } from "../../types/game";
import { DialogHeader, GameDialog } from "./GameDialog";

// Design screen 3. Only the player who drew the card sees the modal; everyone
// else gets the activity-log line. The server already applied the card's effect.
export function CardModal({ card, onClose }: { card: ChanceCard; onClose: () => void }) {
  return (
    <GameDialog widthClass="max-w-[360px]" onClose={onClose}>
      <DialogHeader
        title=""
        eyebrow="Fortune card"
        icon={<Waves size={16} className="text-accent" />}
        onClose={onClose}
      />
      <div className="mb-6 flex flex-col items-center gap-4 rounded-xl border border-white/10 px-2 py-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/35">
          <Ship size={26} className="text-accent" />
        </div>
        <div className="text-xl font-semibold text-text">{card.title}</div>
        <div className="px-4 text-sm leading-relaxed text-text/60 [text-wrap:pretty]">{card.description}</div>
      </div>
      <button
        onClick={onClose}
        className="w-full rounded-lg border border-accent px-5 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-bg"
      >
        OK
      </button>
    </GameDialog>
  );
}
