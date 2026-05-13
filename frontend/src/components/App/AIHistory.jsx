import React, { useEffect, useState } from "react";
import { fetchAIHistory } from "../../api/recipes";
import "./AIHistory.css";

export default function AIHistory() {
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

                    <div className="ai-history-macros">
                      🔥 {recipe.calories}
                    </div>

                    <ul>
                      {recipe.steps?.slice(0, 3).map((step, i) => (
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
