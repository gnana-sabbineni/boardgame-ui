import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/auth-context";
import { LobbyProvider } from "./context/LobbyProvider";
import { Onboarding } from "./pages/Onboarding";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Home } from "./pages/Home";
import { Settings } from "./pages/Settings";
import { ResetPassword } from "./pages/ResetPassword";
import { Lobby } from "./pages/Lobby";
import { ReturnToLobbyBanner } from "./components/ReturnToLobbyBanner";

function RequireAuth({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <LobbyProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/home"
              element={
                <RequireAuth>
                  <Home />
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <Settings />
                </RequireAuth>
              }
            />
            <Route
              path="/lobby"
              element={
                <RequireAuth>
                  <Lobby />
                </RequireAuth>
              }
            />
          </Routes>
          <ReturnToLobbyBanner />
        </BrowserRouter>
      </LobbyProvider>
    </AuthProvider>
  );
}