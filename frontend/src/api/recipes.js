const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

/* ------------------ ALL RECIPES ------------------ */
/*export async function fetchRecipes() {
  const res = await fetch(`${API_URL}/recipes`);
  if (!res.ok) throw new Error("Помилка при отриманні рецептів");
  return res.json();
}*/
export async function fetchRecipes(category = "all", sort = "new") {
  const res = await fetch(
    `${API_URL}/recipes?category=${category}&sort=${sort}`,
  );

  if (!res.ok) throw new Error("Помилка при отриманні рецептів");
  return res.json();
}

export async function fetchRecipeDetails(id) {
  const res = await fetch(`${API_URL}/recipes/${id}`);
  if (!res.ok) throw new Error("Помилка при отриманні рецепта");
  return res.json();
}

export async function fetchSimilarRecipes(id) {
  const res = await fetch(`${API_URL}/recipes/${id}/similar`);
  if (!res.ok) return [];
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

export async function publishRecipe(id) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/my-recipes/${id}/publish`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Не вдалося надіслати рецепт на публікацію");
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

export async function fetchAdminRecipeRequests() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/admin/recipe-requests`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Не вдалося завантажити заявки");
  return res.json();
}

export async function fetchAdminRecipeRequest(id) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/admin/recipe-requests/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Не вдалося завантажити заявку");
  return res.json();
}

export async function analyzeAdminRecipe(id) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/admin/recipe-requests/${id}/analyze`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Не вдалося виконати AI-аналіз");
  return res.json();
}

export async function approveAdminRecipe(id) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/admin/recipe-requests/${id}/approve`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Не вдалося схвалити рецепт");
  return res.json();
}

export async function rejectAdminRecipe(id) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/admin/recipe-requests/${id}/reject`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Не вдалося відхилити рецепт");
  return res.json();
}

export async function updateAdminRecipe(id, data) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/admin/recipes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Не вдалося оновити рецепт");
  return res.json();
}

export async function fetchNotifications() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Не вдалося завантажити сповіщення");
  return res.json();
}

export async function fetchUnreadNotificationsCount() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { count: 0 };
  return res.json();
}

export async function markNotificationRead(id) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Не вдалося прочитати сповіщення");
  return res.json();
}

export async function markAllNotificationsRead() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/notifications/read-all`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Не вдалося прочитати всі сповіщення");
  return res.json();
}

export async function deleteNotification(id) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/notifications/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Не вдалося видалити сповіщення");
  return res.json();
}

export async function deleteAllNotifications() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/notifications`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Не вдалося видалити всі сповіщення");
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
