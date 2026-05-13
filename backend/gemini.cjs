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
            Обов'язково розрахуй КБЖУ. 
            Відповідь надай ТІЛЬКИ у форматі JSON масиву: 
            [{"title": "...", "calories": "...", "macros": {"p": "г", "f": "г", "c": "г"}, "description": "...", "steps": ["...", "..."]}]`,
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

module.exports = { generateRecipesFromAI };
