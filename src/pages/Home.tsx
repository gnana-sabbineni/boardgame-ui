import { useState } from "react";
import { Plus, Grid3x3 } from "lucide-react";
import { AppHeader } from "../components/AppHeader";
import { FriendsSidebar } from "../components/FriendsSidebar";
import { GameCard } from "../components/GameCard";
import { Button } from "../components/Button";
import { CreateLobbyModal } from "../components/CreateLobbyModal";
import { useLobby } from "../context/lobby-context";

export function Home() {
  const { refreshCurrentLobby } = useLobby();
  const [friendsRefreshKey, setFriendsRefreshKey] = useState(0);
  const [isCreateLobbyOpen, setIsCreateLobbyOpen] = useState(false);

  function handleAccepted() {
    setFriendsRefreshKey((k) => k + 1);
    refreshCurrentLobby();
  }

  return (
    <div className="min-h-screen bg-bg">
      <AppHeader onAccepted={handleAccepted} />

      <div className="flex">
        <FriendsSidebar externalRefreshKey={friendsRefreshKey} />

        <main className="flex-1 p-8">
          <h1 className="mb-6 text-2xl font-bold text-text">Games</h1>

          <div className="flex flex-wrap gap-5">
            <GameCard
              icon={<Grid3x3 size={20} />}
              title="Monopoly"
              description="The classic property-trading game."
              meta="2–8 players"
              actions={
                <Button
                  variant="primary"
                  className="w-auto px-4 py-2 text-sm"
                  onClick={() => setIsCreateLobbyOpen(true)}
                >
                  Create lobby
                </Button>
              }
            />

            <div className="flex w-72 flex-col items-start rounded-xl border border-dashed border-white/15 p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-text/50">
                <Plus size={20} />
              </div>
              <h3 className="mb-1 font-semibold text-text/70">More games coming soon</h3>
              <p className="text-sm text-text/40">Chess, Clue, and more are on the roadmap.</p>
            </div>
          </div>
        </main>
      </div>

      {isCreateLobbyOpen && <CreateLobbyModal onClose={() => setIsCreateLobbyOpen(false)} />}
    </div>
  );
}