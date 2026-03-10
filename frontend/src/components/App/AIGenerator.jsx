import React, { useState } from "react";
import { generateAIRecipe } from "../../api/ai.js";

export default function AIGenerator() {
  const [inputValue, setInputValue] = useState("");
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!inputValue.trim()) return;

    setLoading(true);
    setError("");
    setRecipe("");

    try {
      const data = await generateAIRecipe(inputValue);
      setRecipe(data.recipe);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>AI-генератор рецептів</h2>

      <p>Введіть продукти, які є у вас вдома:</p>

      <input
        type="text"
        placeholder="Наприклад: яйця, сир, помідори"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        style={{ width: "300px", padding: "8px", marginRight: "10px" }}
      />

      <button
        onClick={handleGenerate}
        style={{
          padding: "8px 15px",
          background: "#a27645",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        disabled={loading}
      >
        {loading ? "Генеруємо рецепт..." : "Згенерувати рецепт"}
      </button>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

      {recipe && (
        <pre
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f5f5f5",
            borderRadius: "5px",
            whiteSpace: "pre-wrap",
          }}
        >
          {recipe}
        </pre>
      )}
    </div>
  );
}
