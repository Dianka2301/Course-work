const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, ".env") });

async function generateRecipesFromAI(ingredients) {
  const apiKey = process.env.GEMINI_API_KEY;

  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Ти професійний шеф-кухар. Запропонуй 3 рецепти українською мовою з інгредієнтів: ${ingredients.join(", ")}. 
            Обов'язково розрахуй КБЖУ, короткий час приготування, кількість порцій і складність.
            Складність має бути тільки одним зі значень: easy, medium, hard.
            Відповідь надай ТІЛЬКИ у форматі JSON масиву: 
            [{"title": "...", "calories": "...", "macros": {"p": "г", "f": "г", "c": "г"}, "description": "...", "prep_time": "...", "portions": 2, "difficulty": "easy", "steps": ["...", "..."]}]`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    if (!data.candidates || !data.candidates[0].content) {
      throw new Error("ШІ повернув порожню відповідь");
    }

    let text = data.candidates[0].content.parts[0].text;
    const cleanJson = text.replace(/```json|```/g, "").trim();

    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Помилка генерації:", error.message);
    throw error;
  }
}

async function analyzeRecipeWithAI(recipe) {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Ти кулінарний експерт і модератор рецептів. Проаналізуй рецепт українською мовою.
Назва: ${recipe.title}
Опис: ${recipe.description || ""}
Категорія: ${recipe.category || ""}
Час: ${recipe.prep_time || ""}
Порції: ${recipe.portions || ""}
Складність: ${recipe.difficulty || ""}
Інгредієнти:
${recipe.ingredients || ""}
Кроки:
${recipe.steps || ""}

Оціни рецепт від 1 до 5 за якістю набору інгредієнтів, логікою кроків, реалістичністю часу, безпечністю та зрозумілістю.
Вкажи проблеми: непоєднувані інгредієнти, забагато/замало чогось, відсутні важливі кроки, небезпечні або нелогічні інструкції.
Відповідь надай ТІЛЬКИ JSON-об'єктом:
{"score": 4.2, "review": "...", "confidence": 0.86, "flags": ["...", "..."], "recommendation": "approve"}`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    if (!data.candidates || !data.candidates[0].content) {
      throw new Error("ШІ повернув порожню відповідь");
    }

    const text = data.candidates[0].content.parts[0].text;
    const cleanJson = text.replace(/```json|```/g, "").trim();

    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Помилка AI-аналізу:", error.message);
    throw error;
  }
}

module.exports = { generateRecipesFromAI, analyzeRecipeWithAI };
