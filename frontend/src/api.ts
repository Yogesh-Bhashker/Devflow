const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

async function rawFetch(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
}

export async function refreshAccessToken(): Promise<string | null> {
  const res = await rawFetch("/auth/refresh", { method: "POST" });
  if (!res.ok) return null;
  const data = await res.json();
  setAccessToken(data.accessToken);
  return data.accessToken;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res = await rawFetch(path, options);

  if (res.status === 401 && path !== "/auth/login" && path !== "/auth/refresh") {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await rawFetch(path, options);
    } else {
      setAccessToken(null);
      window.location.href = "/login";
      throw new Error("Session expired");
    }
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data as T;
}