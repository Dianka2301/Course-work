export async function fetchFavorites() {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:4000/api/favorites", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return []; 
  return res.json(); 
}

export async function toggleFavorite(recipeId) {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:4000/api/favorites", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ recipeId }),
  });

  if (!res.ok) throw new Error("Не вдалося оновити обране");
  return res.json();
}
