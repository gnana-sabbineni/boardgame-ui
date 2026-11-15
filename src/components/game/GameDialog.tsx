import type { ReactNode } from "react";
import { X } from "lucide-react";

interface GameDialogProps {
  onClose?: () => void; // omit for dialogs that must be answered (e.g. low funds)
  widthClass?: string;
  borderClass?: string;
  children: ReactNode;
}

// Backdrop + centred surface card used by every in-game dialog (design screens 2-5, 7).
export function GameDialog({
  onClose,
  widthClass = "max-w-md",
  borderClass = "border-white/10",
  children,
}: GameDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className={`w-full ${widthClass} rounded-2xl border ${borderClass} bg-surface p-6`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({
  title,
  eyebrow,
  icon,
  onClose,
}: {
  title: string;
  eyebrow?: string;
  icon?: ReactNode;
  onClose?: () => void;
}) {
  return (
    <div className="mb-5 flex items-start justify-between">
      <div className="flex flex-col gap-1.5">
        {eyebrow && (
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50">
            {icon}
            {eyebrow}
          </div>
        )}
        <h2 className="text-xl font-semibold text-text">{title}</h2>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close"
          className="rounded-md p-1 text-text/50 hover:bg-white/5 hover:text-text"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

export const SectionLabel = ({ children }: { children: ReactNode }) => (
  <div className="text-xs uppercase tracking-widest text-white/50">{children}</div>
);
