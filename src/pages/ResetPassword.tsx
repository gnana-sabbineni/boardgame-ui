import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import { resetPassword } from "../api/auth";
import { ApiError } from "../api/client";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const showMatchStatus = confirmPassword.length > 0;
  const passwordsMatch = newPassword === confirmPassword;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (!token) {
      setError("This reset link is missing its token. Please request a new one.");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(token, newPassword);
      setIsDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "This link is invalid or has expired.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg p-6">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 p-10 text-center">
          <h1 className="mb-3 text-xl font-bold text-text">Invalid link</h1>
          <p className="mb-6 text-sm text-text/60">
            This password reset link is missing or malformed. Please request a new one from the login page.
          </p>
          <Link to="/login" className="text-sm text-accent hover:text-accent-hover">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg p-6">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 p-10 text-center">
          <h1 className="mb-3 text-xl font-bold text-text">Password reset!</h1>
          <p className="mb-6 text-sm text-text/60">You can now log in with your new password.</p>
          <Link to="/login" className="text-sm text-accent hover:text-accent-hover">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-white/10 p-10">
        <div className="mb-2 flex items-center justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <span className="font-semibold text-text">Boardwalk</span>
        </div>
        <h1 className="mb-6 text-center text-2xl font-bold text-text">Set a new password</h1>

        <div className="mb-2 flex flex-col gap-4">
          <TextField
            id="newPassword"
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
          />
          <TextField
            id="confirmPassword"
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {showMatchStatus && (
          <p className={`mb-4 text-xs ${passwordsMatch ? "text-accent" : "text-danger"}`}>
            {passwordsMatch ? "Passwords match" : "Passwords don't match"}
          </p>
        )}

        {error && <p className="mb-4 text-center text-sm text-danger">{error}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Updating…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}