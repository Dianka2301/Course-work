const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function generateAIRecipe(ingredients) {
  const res = await fetch(`${API_URL}/ai-recipe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingredients }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Помилка генерації рецепту");
  }

  return await res.json();
}
