const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function fetchRecipes() {
  const res = await fetch(`${API_URL}/recipes`);
  if (!res.ok) throw new Error("Помилка при отриманні рецептів");
  return res.json();
}

export async function fetchMyRecipes(page = 1, limit = 6) {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${API_URL}/api/my-recipes?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) throw new Error("Load my recipes failed");
  return res.json();
}

/* ------------------ CREATE ------------------ */
export async function createRecipe(data) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/my-recipes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return res.json();
}

/* ------------------ UPDATE ------------------ */
export async function updateRecipe(id, data) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/my-recipes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return res.json();
}

/* ------------------ DELETE ------------------ */
export async function deleteRecipe(id) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/my-recipes/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}
