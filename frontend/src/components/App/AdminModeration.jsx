import { useEffect, useState } from "react";
import {
  fetchAdminRecipeRequests,
  fetchAdminRecipeRequest,
  analyzeAdminRecipe,
  approveAdminRecipe,
  rejectAdminRecipe,
} from "../../api/recipes";

const BASE_URL = "http://localhost:4000";

function imageSrc(image) {
  if (!image) return `${BASE_URL}/images/default-avatar.jpg`;
  if (image.startsWith("http")) return image;
  return `${BASE_URL}/images/${image}`;
}

export default function AdminModeration() {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    loadRequests();
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminRecipeRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
      showToast("Не вдалося завантажити заявки");
    } finally {
      setLoading(false);
    }
  };

  const openRequest = async (id) => {
    try {
      const data = await fetchAdminRecipeRequest(id);
      setSelected(data);
      setAnalysis(
        data.ai_score
          ? {
              score: data.ai_score,
              review: data.ai_review,
              confidence: data.ai_confidence,
              flags: data.ai_flags ? JSON.parse(data.ai_flags) : [],
            }
          : null,
      );
    } catch (err) {
      console.error(err);
      showToast("Не вдалося відкрити заявку");
    }
  };

  const handleAnalyze = async () => {
    if (!selected) return;

    try {
      setLoading(true);
      const data = await analyzeAdminRecipe(selected.id);
      setAnalysis(data);
      showToast("AI-аналіз готовий");
      loadRequests();
    } catch (err) {
      console.error(err);
      showToast("AI-аналіз не вдався");
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (action) => {
    if (!selected) return;

    try {
      if (action === "approve") {
        await approveAdminRecipe(selected.id);
        showToast("Рецепт схвалено");
      } else {
        await rejectAdminRecipe(selected.id);
        showToast("Рецепт відхилено");
      }

      setSelected(null);
      setAnalysis(null);
      loadRequests();
    } catch (err) {
      console.error(err);
      showToast("Дію не виконано");
    }
  };

  return (
    <div className="admin-page">
      {toast && <div className="toast">{toast}</div>}

      <div className="admin-header">
        <h2>Модерація рецептів</h2>
        <button onClick={loadRequests}>Оновити</button>
      </div>

      {loading && <p>Завантаження...</p>}

      <div className="admin-grid">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Назва</th>
                <th>Автор</th>
                <th>Дата заявки</th>
                <th>Статус</th>
                <th>AI</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((item) => (
                <tr key={item.id}>
                  <td>{item.user_id}</td>
                  <td>{item.title}</td>
                  <td>{item.authorName}</td>
                  <td>
                    {new Date(item.updated_at || item.created_at).toLocaleDateString(
                      "uk-UA",
                    )}
                  </td>
                  <td>{item.status}</td>
                  <td>{item.ai_score ? `${item.ai_score}/5` : "-"}</td>
                  <td>
                    <button onClick={() => openRequest(item.id)}>
                      Переглянути
                    </button>
                    <button onClick={() => approveAdminRecipe(item.id).then(loadRequests)}>
                      Схвалити
                    </button>
                    <button onClick={() => rejectAdminRecipe(item.id).then(loadRequests)}>
                      Відхилити
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="admin-detail">
            <img src={imageSrc(selected.image)} alt={selected.title} />
            <h3>{selected.title}</h3>
            <p>{selected.description}</p>

            <div className="recipe-meta-grid">
              <span>{selected.category}</span>
              <span>{selected.prep_time || "Час не вказано"}</span>
              <span>
                {selected.portions ? `${selected.portions} порц.` : "Порції не вказано"}
              </span>
              <span>{selected.difficulty || "easy"}</span>
            </div>

            <h4>Інгредієнти</h4>
            <p style={{ whiteSpace: "pre-line" }}>{selected.ingredients}</p>

            <h4>Кроки</h4>
            <p style={{ whiteSpace: "pre-line" }}>{selected.steps}</p>

            <div className="admin-actions">
              <button onClick={handleAnalyze} disabled={loading}>
                AI-аналіз
              </button>
              <button onClick={() => handleDecision("approve")}>Схвалити</button>
              <button onClick={() => handleDecision("reject")}>Відхилити</button>
            </div>

            {analysis && (
              <div className="ai-review-box">
                <h4>AI-аналіз</h4>
                <div>Оцінка: {analysis.score}/5</div>
                <div>Впевненість: {analysis.confidence}</div>
                <p>{analysis.review}</p>
                {analysis.flags?.length > 0 && (
                  <ul>
                    {analysis.flags.map((flag, index) => (
                      <li key={index}>{flag}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
