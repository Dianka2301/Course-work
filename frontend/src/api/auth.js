/* frontend/src/api/auth.js */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function register(email, password) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Помилка реєстрації.");

  return { user: data.user, token: data.token };
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Невірний email або пароль.");

  return { user: data.user, token: data.token };
}

export async function verifyToken(token) {
  if (!token) return null;

  const res = await fetch(`${API_URL}/health`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;

  try {
    return await res.json();
  } catch {
    return null;
  }
}
