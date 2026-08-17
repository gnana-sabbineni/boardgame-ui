import { useState, type FormEvent } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { TextField } from "./TextField";
import { forgotPassword } from "../api/auth";
import { ApiError } from "../api/client";

interface ForgotPasswordModalProps {
  onClose: () => void;
}

export function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setIsSent(true);
    } catch (err) {
      // Only truly unexpected failures (network down, 500) land here — the
      // backend deliberately returns 200 whether or not the email exists,
      // so we never learn "that email isn't registered" from this call.
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSent) {
    return (
      <Modal title="Check your email" onClose={onClose}>
        <p className="text-sm text-text/70">
          If an account exists for <span className="text-text">{email}</span>, we've sent a link to
          reset your password. It expires in 30 minutes.
        </p>
      </Modal>
    );
  }

  return (
    <Modal title="Reset your password" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <p className="mb-4 text-sm text-text/60">
          Enter your account email and we'll send you a link to reset your password.
        </p>

        <TextField
          id="forgotPasswordEmail"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          required
        />

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}

        <div className="mt-5 flex justify-end gap-3">
          <Button type="button" variant="secondary" className="w-auto px-4" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="w-auto px-4" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send reset link"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}