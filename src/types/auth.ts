export interface User {
  id: string;       // Guid, serialized as a string over JSON
  firstName: string;
  lastName: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Register only returns the new user's id (a Guid, as a JSON string) — not a token/user.
export type RegisterResponse = string;