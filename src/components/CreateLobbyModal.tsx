import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { createLobby } from "../api/lobbies";
import { ApiError } from "../api/client";
import { useLobby } from "../context/lobby-context";

interface CreateLobbyModalProps {
  onClose: () => void;
}

export function CreateLobbyModal({ onClose }: CreateLobbyModalProps) {
  const { setCurrentLobby } = useLobby();
  const navigate = useNavigate();
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const lobby = await createLobby({ maxPlayers });
      setCurrentLobby(lobby);
      navigate("/lobby");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create lobby.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title="Create Monopoly lobby" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <label htmlFor="maxPlayers" className="mb-1.5 block text-sm text-text/70">
          Max players
        </label>
        <select
          id="maxPlayers"
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(Number(e.target.value))}
          className="mb-4 w-full rounded-lg border border-white/10 bg-bg px-3 py-2.5 text-text outline-none focus:border-accent"
        >
          {[2, 3, 4, 5, 6, 7, 8].map((n) => (
            <option key={n} value={n}>
              {n} players
            </option>
          ))}
        </select>

        {error && <p className="mb-4 text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" className="w-auto px-4" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="w-auto px-4" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create lobby"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}