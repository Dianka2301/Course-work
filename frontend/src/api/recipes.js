const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

/* ------------------ ALL RECIPES ------------------ */
export async function fetchRecipes() {
  const res = await fetch(`${API_URL}/recipes`);
  if (!res.ok) throw new Error("Помилка при отриманні рецептів");
  return res.json();
}

/* ------------------ MY RECIPES ------------------ */
export async function fetchMyRecipes(page = 1, limit = 6) {
  const token = localStorage.getItem("token");

  console.log("TOKEN:", token); // 🔥 ДОДАЙ ДЛЯ ПЕРЕВІРКИ

  const res = await fetch(`${API_URL}/my-recipes?page=${page}&limit=${limit}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) throw new Error("Load my recipes failed");
  return res.json();
}

/* ------------------ RATING ------------------ */
export async function rateRecipe(recipeId, rating) {
  const res = await fetch(`${API_URL}/recipes/${recipeId}/rating`, {
    // ❗ без /api
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rating }),
  });

  if (!res.ok) throw new Error("Rating failed");

  return res.json();
}

/* ------------------ CREATE ------------------ */
export async function createRecipe(data) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/my-recipes`, {
    // ❗ без /api
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

  const res = await fetch(`${API_URL}/my-recipes/${id}`, {
    // ❗ без /api
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

  const res = await fetch(`${API_URL}/my-recipes/${id}`, {
    // ❗ без /api
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

export async function fetchComments(recipeId) {
  const res = await fetch(`${API_URL}/recipes/${recipeId}/comments`);
  if (!res.ok) throw new Error("Load comments failed");
  return res.json();
}

export async function addComment(recipeId, data) {
  const user = JSON.parse(localStorage.getItem("user"));

  const res = await fetch(`${API_URL}/recipes/${recipeId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      userId: user?.id,
    }),
  });

  if (!res.ok) throw new Error("Add comment failed");
  return res.json();
}

/* ------------------ AI GENERATION (SECURE) ------------------ */
export async function generateAIRecipes(ingredients) {
  const token = localStorage.getItem("token"); 

  const res = await fetch(`${API_URL}/recipes/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}), 
    },
    body: JSON.stringify({ ingredients }),
  });

  if (!res.ok) throw new Error("AI Generation failed");
  return res.json();
}

/* ------------------ AI HISTORY ------------------ */

export async function fetchAIHistory() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/ai-history`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Не вдалося завантажити історію");
  }

  return res.json();
}