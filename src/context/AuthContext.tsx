import { useState, useCallback, type ReactNode } from "react";
import type { User } from "../types/auth";
import { AuthContext } from "./auth-context";
import { TOKEN_KEY, USER_KEY } from "../lib/storage-keys";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  });

  const setSession = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const updateUser = useCallback((newUser: User) => {
  localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  setUser(newUser);
}, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

return (
  <AuthContext.Provider value={{ user, token, setSession, updateUser, clearSession }}>
    {children}
  </AuthContext.Provider>
);
}