export async function fetchFavorites() {
  const res = await fetch("http://localhost:4000/api/favorites");
  if (!res.ok) return []; // якщо помилка — повертаємо порожній масив
  return res.json(); // масив ID
}

export async function toggleFavorite(recipeId) {
  const res = await fetch("http://localhost:4000/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipeId }),
  });
  if (!res.ok) throw new Error("Не вдалося оновити обране");
  return res.json();
}
