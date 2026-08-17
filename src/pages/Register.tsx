import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import { register } from "../api/auth";
import { ApiError } from "../api/client";
import { useAuth } from "../context/auth-context";

export function Register() {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { token, user } = await register({ firstName, lastName, email, password });
      setSession(token, user);
      navigate("/home");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to create account. Please try again.");
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
        <h1 className="mb-6 text-center text-2xl font-bold text-text">Create account</h1>

        <div className="mb-6 flex flex-col gap-4">
          <div className="flex gap-3">
  <div className="min-w-0 flex-1">
    <TextField id="firstName" label="First name" placeholder="Alex" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
  </div>
  <div className="min-w-0 flex-1">
    <TextField id="lastName" label="Last name" placeholder="Rivera" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
  </div>
</div>
          <TextField id="email" label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <TextField id="password" label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
        </div>

        {error && <p className="mb-4 text-center text-sm text-danger">{error}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>

        <p className="mt-4 text-center text-sm text-text/60">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:text-accent-hover">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}