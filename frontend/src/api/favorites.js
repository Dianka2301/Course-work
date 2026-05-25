export async function fetchFavorites() {
  const token = localStorage.getItem("token"); // 🔥 Отримуємо токен з локального сховища [4]

  const res = await fetch("http://localhost:4000/api/favorites", {
    headers: {
      // 🔥 Передаємо токен авторизації на бекенд [4]
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return []; // якщо помилка — повертаємо порожній масив [4]
  return res.json(); // масив ID
}

export async function toggleFavorite(recipeId) {
  const token = localStorage.getItem("token"); // 🔥 Отримуємо токен з локального сховища [4]

  const res = await fetch("http://localhost:4000/api/favorites", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // 🔥 Передаємо токен авторизації на бекенд [4]
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ recipeId }),
  });

  if (!res.ok) throw new Error("Не вдалося оновити обране");
  return res.json();
}
