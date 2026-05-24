import React, { useEffect, useState } from "react";
import { fetchAIHistory } from "../../api/recipes";
import "./AIHistory.css";

function MacroPanel({ recipe }) {
  return (
    <div className="macro-panel">
      <div className="calorie-ring">
        <span>{recipe.calories || "-"}</span>
        <small>ккал</small>
      </div>
      <div className="macro-bars">
        <div>
          <b>{recipe.macros?.p || "-"}</b>
          <span>білки</span>
          <i className="protein"></i>
        </div>
        <div>
          <b>{recipe.macros?.f || "-"}</b>
          <span>жири</span>
          <i className="fat"></i>
        </div>
        <div>
          <b>{recipe.macros?.c || "-"}</b>
          <span>вуглеводи</span>
          <i className="carbs"></i>
        </div>
      </div>
    </div>
  );
}

export default function AIHistory({ onBack }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await fetchAIHistory();
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-history-container">
      {onBack && (
        <button className="back-btn" onClick={onBack}>
          ← Назад
        </button>
      )}
      <h2 className="ai-history-title">Історія AI рецептів</h2>

      {loading ? (
        <div className="ai-history-loader">Завантаження...</div>
      ) : history.length === 0 ? (
        <div className="ai-history-empty">Історія порожня</div>
      ) : (
        <div className="ai-history-list">
          {history.map((item) => (
            <div key={item.id} className="ai-history-card">
              <div className="ai-history-top">
                <div className="ai-history-date">
                  {new Date(item.created_at).toLocaleString()}
                </div>

                <div className="ai-history-tags">
                  {item.ingredients?.map((ingredient, i) => (
                    <span key={i} className="ai-history-tag">
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>

              <div className="ai-history-recipes">
                {item.recipes?.map((recipe, idx) => (
                  <div key={idx} className="ai-history-recipe-card">
                    <h4>{recipe.title}</h4>

                    <p>{recipe.description}</p>

                    <MacroPanel recipe={recipe} />

                    <ul>
                      {recipe.steps?.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
