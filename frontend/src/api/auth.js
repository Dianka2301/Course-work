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

export async function forgotPassword(email) {
  const res = await fetch(`${API}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  return res.json();
}

export async function resetPassword(email, code, password) {
  const res = await fetch(`${API}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      code,
      password,
    }),
  });

  return res.json();
}
