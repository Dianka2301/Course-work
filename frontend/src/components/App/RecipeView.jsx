import { useState, useEffect } from "react";
import {
  fetchComments,
  addComment,
  fetchRecipeDetails,
  fetchSimilarRecipes,
  publishRecipe,
} from "../../api/recipes";

const BASE_URL = "http://localhost:4000";

function imageSrc(image) {
  if (!image) return `${BASE_URL}/images/default-avatar.jpg`;
  if (image.startsWith("http")) return image;
  return `${BASE_URL}/images/${image}`;
}

function avatarSrc(avatar) {
  if (!avatar) return `${BASE_URL}/images/default-avatar.jpg`;
  if (avatar.startsWith("http")) return avatar;
  return `${BASE_URL}/uploads/${avatar}`;
}

export default function RecipeView({ recipe, user, onBack, onOpenRecipe }) {
  const [details, setDetails] = useState(recipe);
  const [comments, setComments] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [activeReply, setActiveReply] = useState(null);
  const [avgRating, setAvgRating] = useState(recipe.rating || 0);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    loadRecipe();
    loadComments();
    loadSimilar();
  }, [recipe.id]);

  const loadRecipe = async () => {
    try {
      const data = await fetchRecipeDetails(recipe.id);
      setDetails(data);
      setAvgRating(data.rating || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const loadComments = async () => {
    try {
      const data = await fetchComments(recipe.id);
      setComments(data);

      const rated = data.filter((c) => c.rating);
      if (rated.length > 0) {
        const avg =
          rated.reduce((sum, c) => sum + (c.rating || 0), 0) / rated.length;
        setAvgRating(avg.toFixed(1));
      } else {
        setAvgRating(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadSimilar = async () => {
    try {
      const data = await fetchSimilarRecipes(recipe.id);
      setSimilar(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async () => {
    if (!text.trim() || rating === 0) return;

    try {
      await addComment(recipe.id, { text, rating });
      setText("");
      setRating(0);
      loadComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReply = async (commentId) => {
    const reply = replyText[commentId]?.trim();
    if (!reply) return;

    try {
      await addComment(recipe.id, {
        text: reply,
        parentId: commentId,
      });
      setReplyText((prev) => ({ ...prev, [commentId]: "" }));
      setActiveReply(null);
      loadComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      await publishRecipe(details.id);
      setDetails((prev) => ({ ...prev, status: "pending", is_public: 0 }));
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const steps = Array.isArray(details.steps)
    ? details.steps
    : String(details.steps || "")
        .split("\n")
        .filter(Boolean);

  return (
    <div className="recipe-view">
      <button className="back-btn" onClick={onBack}>
        Назад
      </button>

      <div className="recipe-layout">
        <div className="recipe-left">
          <img
            src={imageSrc(details.image)}
            className="recipe-view-img"
            alt={details.title}
          />

          <h2 className="recipe-title">{details.title}</h2>

          {details.authorName && (
            <div className="recipe-author">
              Автор: <b>{details.authorName}</b>
            </div>
          )}

          {details.user_id === user?.id &&
            details.status !== "pending" &&
            details.status !== "approved" && (
              <button
                className="publish-btn small-action"
                onClick={handlePublish}
                disabled={publishing}
              >
                {publishing ? "Надсилання..." : "Опублікувати"}
              </button>
            )}

          {details.user_id === user?.id && details.status === "pending" && (
            <div className="recipe-status-badge">Очікує схвалення адміна</div>
          )}

          <div className="recipe-meta-grid">
            <span>{details.prep_time || "Час не вказано"}</span>
            <span>{details.portions ? `${details.portions} порц.` : "Порції не вказано"}</span>
            <span>{details.difficulty || "easy"}</span>
          </div>

          <div className="rating-box">
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="star">
                  {star <= Math.round(avgRating) ? "★" : "☆"}
                </span>
              ))}
            </div>

            <div className="avg-rating">
              <h4>
                Рейтинг: <b>{avgRating}/5</b>
              </h4>
            </div>
          </div>
        </div>

        <div className="recipe-right">
          {details.description && (
            <div className="section">
              <h4>Опис</h4>
              <p>{details.description}</p>
            </div>
          )}

          <div className="section">
            <h4>Інгредієнти</h4>
            {details.ingredients
              ?.split("\n")
              .filter((i) => i.trim() !== "")
              .map((i, idx) => (
                <div key={idx} className="ingredient-item">
                  • {i.trim()}
                </div>
              ))}
          </div>

          <div className="section">
            <h4>Кроки</h4>
            <ol className="recipe-steps-list">
              {steps.map((step, idx) => (
                <li key={idx}>{step.replace(/^\d+\.\s*/, "")}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <div className="similar-recipes">
          <h4>Схожі рецепти</h4>
          <div className="similar-grid">
            {similar.map((item) => (
              <button
                key={item.id}
                className="similar-card"
                onClick={() => onOpenRecipe?.(item)}
              >
                <img src={imageSrc(item.image)} alt={item.title} />
                <span>{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="comments">
        <h4>Коментарі</h4>

        <div className="comment-list">
          {comments.map((c) => (
            <div key={c.id} className="comment">
              <div className="comment-top">
                <img
                  src={avatarSrc(c.avatar)}
                  alt="avatar"
                  className="comment-avatar"
                />
                <div className="comment-info">
                  <div className="comment-header">
                    <b>{c.userName}</b>
                    <span className="comment-date">
                      {formatDate(c.created_at)}
                    </span>
                  </div>
                  <div className="comment-text">{c.text}</div>
                </div>
              </div>

              {c.rating && (
                <div className="comment-stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s}>{s <= c.rating ? "★" : "☆"}</span>
                  ))}
                </div>
              )}

              <button
                className="reply-toggle"
                onClick={() => setActiveReply(activeReply === c.id ? null : c.id)}
              >
                Відповісти
              </button>

              {activeReply === c.id && (
                <div className="reply-box">
                  <input
                    value={replyText[c.id] || ""}
                    onChange={(e) =>
                      setReplyText((prev) => ({
                        ...prev,
                        [c.id]: e.target.value,
                      }))
                    }
                    placeholder="Написати відповідь..."
                  />
                  <button onClick={() => handleAddReply(c.id)}>Reply</button>
                </div>
              )}

              {c.replies?.length > 0 && (
                <div className="reply-list">
                  {c.replies.map((reply) => (
                    <div key={reply.id} className="reply">
                      <img
                        src={avatarSrc(reply.avatar)}
                        alt="avatar"
                        className="comment-avatar"
                      />
                      <div>
                        <div className="comment-header">
                          <b>{reply.userName}</b>
                          <span className="comment-date">
                            {formatDate(reply.created_at)}
                          </span>
                        </div>
                        <div className="comment-text">{reply.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="comment-box">
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(null)}
                className="star"
              >
                {star <= (hover || rating) ? "★" : "☆"}
              </span>
            ))}
          </div>

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Написати коментар..."
          />

          <button onClick={handleAddComment}>Додати</button>
        </div>
      </div>
    </div>
  );
}
