import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import { register, login } from "../api/auth";
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
      // Step 1: create the account. This only returns the new user's id — no token.
      await register({ firstName, lastName, email, password });

      // Step 2: log in immediately with the same credentials to get a token + user.
      const { token, user } = await login({ email, password });
      setSession(token, user);
      navigate("/home");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message); // e.g. "An account with this email already exists."
      } else {
        setError("Unable to create account. Please try again.");
      }
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
            <TextField
              id="firstName"
              label="First name"
              placeholder="Alex"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <TextField
              id="lastName"
              label="Last name"
              placeholder="Rivera"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <TextField
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
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