import React, { useState } from "react";
import { generateAIRecipes } from "../../api/recipes"; // Шлях до вашого api файлу
import "./AIGenerator.css";

export default function AIGenerator() {
  const [ingredients, setIngredients] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Додавання інгредієнта в список
  const addIngredient = () => {
    if (inputValue.trim() && !ingredients.includes(inputValue.trim())) {
      setIngredients([...ingredients, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) {
      setError("Додайте хоча б один інгредієнт");
      return;
    }

    setLoading(true);
    setError("");
    setRecipes([]);

    try {
      const data = await generateAIRecipes(ingredients);
      setRecipes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-container">
      <div className="ai-generator-card">
        <h2 className="ai-title">Recipe Generator</h2>

        <div className="input-section">
          <div className="section-header">
            <h3>Додати інгредієнти</h3>
            <p>Додайте продукти, які у вас є, і ШІ запропонує рецепти.</p>
          </div>

          <div className="input-group">
            <input
              type="text"
              placeholder="Напр: курка, сир..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addIngredient()}
            />
            <button className="adds-btn" onClick={addIngredient}>
              +
            </button>
          </div>

          <div className="actions">
            <button className="clear-btn" onClick={() => setIngredients([])}>
              Очистити
            </button>
            <button
              className="generate-btn"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? "Генерується..." : "Генерувати!"}
            </button>
          </div>
        </div>

        <div className="ingredients-display">
          <h3>Ваші інгредієнти</h3>
          <div className="tags-container">
            {ingredients.length > 0 ? (
              ingredients.map((item, index) => (
                <span key={index} className="tag">
                  {item}{" "}
                  <button onClick={() => removeIngredient(index)}>×</button>
                </span>
              ))
            ) : (
              <p className="no-data">Немає інгредієнтів</p>
            )}
          </div>
        </div>
      </div>

      <div className="results-section">
        <h2 className="results-title">Рецепти</h2>

        {error && <p className="error-msg">{error}</p>}

        <div className="recipes-grid">
          {recipes.map((res, idx) => (
            <div key={idx} className="recipe-card">
              <div className="recipe-header">
                <span className="recipe-number">{idx + 1}:</span>
                <h4> {res.title} </h4>
              </div>

              <p className="recipe-desc">{res.description}</p>

              <div className="macros-container">
                <div className="macro-item">
                  <strong>🔥 {res.calories}</strong>
                </div>
                <div className="macro-details">
                  <span>Б: {res.macros.p}</span>
                  <span>Ж: {res.macros.f}</span>
                  <span>В: {res.macros.c}</span>
                </div>
              </div>

              <div className="recipe-steps">
                <h5>Приготування:</h5>
                <ul>
                  {res.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          {!loading && recipes.length === 0 && !error && (
            <p className="placeholder-text">
              Тут з'являться ваші ідеї для вечері...
            </p>
          )}
          {loading && (
            <div className="loader">Зачекайте, шеф-кухар думає... 👨‍🍳</div>
          )}
        </div>
      </div>
    </div>
  );
}
