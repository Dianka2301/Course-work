export async function updateProfile(formData, token) {
  const res = await fetch("http://localhost:4000/api/auth/profile", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Не вдалося оновити профіль");

  return res.json();
}
