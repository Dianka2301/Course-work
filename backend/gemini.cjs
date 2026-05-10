const { GoogleGenerativeAI } = require("@google/generative-ai");

// Ініціалізація ШІ з ключем з .env
/*const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);*/
const genAI = new GoogleGenerativeAI("AIzaSyC8iKhYAGrivBh_lVWCT5DBgiho5OKvy8I");
async function generateRecipesFromAI(ingredients) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Ти — професійний шеф-кухар. На основі цих інгредієнтів: ${ingredients.join(", ")}, 
    запропонуй 3 різні рецепти українською мовою. 
    Обов'язково розрахуй КБЖУ для кожного.
    Відповідь надай СУВОРО у форматі JSON (масив об'єктів). Не пиши ніякого тексту крім JSON.
    [
      {
        "title": "Назва",
        "calories": "число ккал",
        "macros": { "p": "білки г", "f": "жири г", "c": "вуглеводи г" },
        "description": "короткий опис",
        "steps": ["крок 1", "крок 2"]
      }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // 🔥 ОЧИЩЕННЯ JSON (шукаємо початок [ та кінець ])
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]") + 1;
    if (start === -1 || end === 0)
      throw new Error("ШІ повернув невірний формат");

    const cleanJson = text.substring(start, end);
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}

module.exports = { generateRecipesFromAI };
