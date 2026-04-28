const API = "http://localhost:4000/api/auth";

export async function login(email, password) {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Login error");
  return res.json();
}

export async function register(email, password, firstName, lastName) {
  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, firstName, lastName }),
  });

  if (!res.ok) throw new Error("Register error");
  return res.json();
}

export async function verifyToken(token) {
  const res = await fetch("http://localhost:4000/api/auth/verify", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}
