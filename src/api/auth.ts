import { apiFetch } from "./client";
import type { AuthResponse, LoginPayload, RegisterPayload, UpdateProfilePayload } from "../types/auth";

export function login(payload: LoginPayload) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function register(payload: RegisterPayload) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProfile(payload: UpdateProfilePayload) {
  return apiFetch<null>("/auth/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function forgotPassword(email: string) {
  return apiFetch<null>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token: string, newPassword: string) {
  return apiFetch<null>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}