import { Link } from "react-router-dom";
import { Button } from "../components/Button";

export function Onboarding() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <div className="w-full max-w-3xl rounded-2xl border border-white/10 p-16 text-center">
        <div className="mb-16 flex items-center justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <span className="font-semibold text-text">Boardwalk</span>
        </div>

        <h1 className="mb-6 text-5xl font-bold leading-tight text-text">
          Play classic board games
          <br />
          online with friends.
        </h1>

        <p className="mx-auto mb-10 max-w-xl text-text/60">
          Starting with Monopoly. Create a lobby, invite your friends, and play in the browser.
        </p>

        <div className="flex items-center justify-center gap-6">
          <Link to="/login">
            <Button className="w-auto px-6">Login</Button>
          </Link>
          <Link to="/register" className="font-medium text-accent hover:text-accent-hover">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}