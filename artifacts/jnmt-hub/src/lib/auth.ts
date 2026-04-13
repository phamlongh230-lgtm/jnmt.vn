export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  avatarColor?: string;
  createdAt?: string;
}

export function getToken(): string | null {
  return localStorage.getItem("jnmt_token");
}

export function setToken(token: string): void {
  localStorage.setItem("jnmt_token", token);
}

export function removeToken(): void {
  localStorage.removeItem("jnmt_token");
  localStorage.removeItem("jnmt_user");
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem("jnmt_user");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function setStoredUser(user: User): void {
  localStorage.setItem("jnmt_user", JSON.stringify(user));
}
