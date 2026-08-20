import { useNavigate, useLocation } from "react-router-dom";
import { Grid3x3, ArrowRight } from "lucide-react";
import { useLobby } from "../context/lobby-context";

export function ReturnToLobbyBanner() {
  const { currentLobby } = useLobby();
  const navigate = useNavigate();
  const location = useLocation();

  if (!currentLobby || location.pathname.startsWith("/lobby")) return null;

  return (
    <button
      onClick={() => navigate("/lobby")}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-accent/40 bg-surface px-4 py-2.5 text-sm font-medium text-text shadow-lg hover:border-accent"
    >
      <Grid3x3 size={16} className="text-accent" />
      Monopoly Lobby
      <span className="text-text/40">
        {currentLobby.members.length}/{currentLobby.maxPlayers}
      </span>
      <ArrowRight size={14} />
    </button>
  );
}