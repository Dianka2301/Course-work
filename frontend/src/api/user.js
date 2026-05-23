export async function updateProfile(formData, token) {
  const res = await fetch("http://localhost:4000/api/profile", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Не вдалося оновити профіль");

  return res.json();
}

export async function fetchProfile(token) {
  const res = await fetch("http://localhost:4000/api/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Не вдалося завантажити профіль");

  return res.json();
}
