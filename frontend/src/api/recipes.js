const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function fetchRecipes() {
  const res = await fetch(`${API_URL}/recipes`);
  if (!res.ok) throw new Error("Помилка при отриманні рецептів");
  return res.json();
}
