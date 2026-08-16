import type { ReactNode } from "react";

interface GameCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  meta?: string;
  actions?: ReactNode;
}

export function GameCard({ icon, title, description, meta, actions }: GameCardProps) {
  return (
    <div className="w-72 rounded-xl border border-white/10 p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-bg">
        {icon}
      </div>
      <h3 className="mb-1 font-semibold text-text">{title}</h3>
      <p className="mb-1 text-sm text-text/60">{description}</p>
      {meta && <p className="mb-4 text-xs text-text/40">{meta}</p>}
      {actions && <div className="mt-4 flex gap-3">{actions}</div>}
    </div>
  );
}