import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import { ForgotPasswordModal } from "../components/ForgotPasswordModal";
import { login } from "../api/auth";
import { ApiError } from "../api/client";
import { useAuth } from "../context/auth-context";

export function Login() {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false); // new

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { token, user } = await login({ email, password });
      setSession(token, user);
      navigate("/home");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to log in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-white/10 p-10">
        <div className="mb-2 flex items-center justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <span className="font-semibold text-text">Boardwalk</span>
        </div>
        <h1 className="mb-6 text-center text-2xl font-bold text-text">Log in</h1>

        <div className="mb-2 flex flex-col gap-4">
          <TextField id="email" label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <div>
            <TextField id="password" label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button
              type="button"
              onClick={() => setIsForgotOpen(true)}
              className="mt-1.5 text-xs text-text/50 hover:text-accent"
            >
              Forgot password?
            </button>
          </div>
        </div>

        {error && <p className="mb-4 mt-4 text-center text-sm text-danger">{error}</p>}

        <Button type="submit" className="mt-4 w-full" disabled={isSubmitting}>
          {isSubmitting ? "Logging in…" : "Log in"}
        </Button>

        <p className="mt-4 text-center text-sm text-text/60">
          Don't have an account?{" "}
          <Link to="/register" className="text-accent hover:text-accent-hover">
            Register
          </Link>
        </p>
      </form>

      {isForgotOpen && <ForgotPasswordModal onClose={() => setIsForgotOpen(false)} />}
    </div>
  );
}