import { TOKEN_KEY } from "../lib/storage-keys";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface ApiEnvelope<T> {
  isSuccess: boolean;
  message: string;
  data: T | null;
  statusCode: number;
}

function extractErrorMessage(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const b = body as Record<string, unknown>;

  if (typeof b.message === "string") return b.message;

  if (b.errors && typeof b.errors === "object") {
    const firstFieldErrors = Object.values(b.errors as Record<string, unknown>)[0];
    if (Array.isArray(firstFieldErrors) && typeof firstFieldErrors[0] === "string") {
      return firstFieldErrors[0];
    }
  }

  if (typeof b.title === "string") return b.title;

  return undefined;
}

export async function apiFetch<TData>(
  path: string,
  options: RequestInit = {}
): Promise<TData> {
  const token = localStorage.getItem(TOKEN_KEY);

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(extractErrorMessage(body) ?? "Something went wrong", res.status);
  }

  if (body && typeof body === "object" && "isSuccess" in body) {
    return (body as ApiEnvelope<TData>).data as TData;
  }

  return body as TData;
}