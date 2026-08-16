import { apiFetch } from "./client";
import type { AuthResponse, LoginPayload, RegisterPayload, RegisterResponse } from "../types/auth";

export function login(payload: LoginPayload) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function register(payload: RegisterPayload) {
  return apiFetch<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}