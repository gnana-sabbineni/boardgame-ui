import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { AppHeader } from "../components/AppHeader";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import { updateProfile } from "../api/auth";
import { ApiError } from "../api/client";
import { useAuth } from "../context/auth-context";

export function Settings() {
  const { user, updateUser, clearSession } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showMatchStatus = confirmNewPassword.length > 0;
  const passwordsMatch = newPassword === confirmNewPassword;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const wantsPasswordChange = newPassword.length > 0 || currentPassword.length > 0;
    if (wantsPasswordChange) {
      if (!currentPassword) {
        setError("Enter your current password to set a new one.");
        return;
      }
      if (!newPassword) {
        setError("Enter a new password, or clear the current password field.");
        return;
      }
      if (newPassword.length < 8) {
        setError("New password must be at least 8 characters.");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError("New password and confirmation don't match.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await updateProfile({
        firstName,
        lastName,
        email,
        currentPassword: wantsPasswordChange ? currentPassword : undefined,
        newPassword: wantsPasswordChange ? newPassword : undefined,
      });

      if (user) {
        updateUser({ ...user, firstName, lastName, email });
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setSuccessMessage("Profile updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLogout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-bg">
      <AppHeader />

      <main className="mx-auto max-w-2xl p-8">
        <h1 className="mb-8 text-2xl font-bold text-text">Settings</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <section>
            <h2 className="mb-4 text-xs font-semibold tracking-wide text-text/50">PROFILE</h2>
            <div className="flex gap-4">
              <div className="min-w-0 flex-1">
                <TextField id="firstName" label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="min-w-0 flex-1">
                <TextField id="lastName" label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>
          </section>

          <hr className="border-white/10" />

          <section>
            <h2 className="mb-4 text-xs font-semibold tracking-wide text-text/50">ACCOUNT</h2>
            <TextField id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </section>

          <hr className="border-white/10" />

          <section>
            <h2 className="mb-4 text-xs font-semibold tracking-wide text-text/50">PASSWORD</h2>
            <div className="flex flex-col gap-4">
              <TextField
                id="currentPassword"
                label="Current password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Leave blank to keep your current password"
              />
              <div className="flex gap-4">
                <div className="min-w-0 flex-1">
                  <TextField id="newPassword" label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div className="min-w-0 flex-1">
                  <TextField id="confirmNewPassword" label="Confirm new password" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                </div>
              </div>
              {showMatchStatus && (
                <p className={`-mt-2 text-xs ${passwordsMatch ? "text-accent" : "text-danger"}`}>
                  {passwordsMatch ? "Passwords match" : "Passwords don't match"}
                </p>
              )}
            </div>
          </section>

          {error && <p className="text-sm text-danger">{error}</p>}
          {successMessage && <p className="text-sm text-accent">{successMessage}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" className="w-auto px-4" onClick={() => navigate("/home")}>
              Cancel
            </Button>
            <Button type="submit" className="w-auto px-4" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>

        <hr className="my-8 border-white/10" />
        <section>
          <h2 className="mb-4 text-xs font-semibold tracking-wide text-text/50">SESSION</h2>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-danger/40 px-4 py-2.5 text-sm font-medium text-danger transition-colors duration-150 hover:bg-danger hover:text-text"
          >
            <LogOut size={16} />
            Log out
          </button>
        </section>
      </main>
    </div>
  );
}