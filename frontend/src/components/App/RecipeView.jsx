import { useState, useEffect } from "react";
import { fetchComments, addComment } from "../../api/recipes";

export default function RecipeView({ recipe, onBack }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [avgRating, setAvgRating] = useState(0);

  // 🔥 завантаження коментарів
  useEffect(() => {
    loadComments();
  }, [recipe]);

  const loadComments = async () => {
    try {
      const data = await fetchComments(recipe.id);
      setComments(data);

      // ⭐ середній рейтинг
      if (data.length > 0) {
        const avg =
          data.reduce((sum, c) => sum + (c.rating || 0), 0) / data.length;
        setAvgRating(avg.toFixed(1));
      } else {
        setAvgRating(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 💬 додати коментар
  const handleAddComment = async () => {
    if (!text.trim() || rating === 0) return;

    try {
      await addComment(recipe.id, {
        text,
        rating,
      });

      setText("");
      setRating(0);

      loadComments(); // 🔥 перезавантаження
    } catch (err) {
      console.error(err);
    }
  };

  // формат дати
  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
  };

  return (
    <div className="recipe-view">
      <button className="back-btn" onClick={onBack}>
        ← Назад
      </button>

      <div className="recipe-layout">
        {/* LEFT */}
        <div className="recipe-left">
          <img
            src={`http://localhost:4000/images/${recipe.image}`}
            className="recipe-view-img"
          />

          <h2 className="recipe-title">{recipe.title}</h2>

          {/* ⭐ AVG RATING */}
          <div className="rating-box">
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="star">
                  {star <= avgRating ? "★" : "☆"}
                </span>
              ))}
            </div>

            <div className="avg-rating">
              <h4>Рейтинг: <b>{avgRating}/5</b></h4>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="recipe-right">
          <div className="section">
            <h4>Інгредієнти</h4>
            {recipe.ingredients?.split(",").map((i, idx) => (
              <div key={idx} className="ingredient-item">
                • {i.trim()}
              </div>
            ))}
          </div>

          <div className="section">
            <h4>Приготування</h4>
            <p style={{ whiteSpace: "pre-line" }}>{recipe.steps}</p>
          </div>
        </div>
      </div>

      {/* 💬 COMMENTS */}
      <div className="comments">
        <h4>Коментарі</h4>

        {/* список */}
        <div className="comment-list">
          {comments.map((c) => (
            <div key={c.id} className="comment">
              <div className="comment-top">
              <img
                src={
                  c.avatar
                    ? `http://localhost:4000/avatars/${c.avatar}`
                    : "/images/default-avatar.png"
                }
                alt="avatar"
                className="comment-avatar"
                />
              <div className="comment-info">
              <div className="comment-header">
                <b>
                  {c.first_name} {c.last_name}
                </b>
                <span className="comment-date">{formatDate(c.created_at)}</span>
                  </div>
                  </div>
              </div>

              <div className="comment-stars">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s}>{s <= c.rating ? "★" : "☆"}</span>
                ))}
              </div>

              <div className="comment-text">{c.text}</div>
            </div>
          ))}
        </div>

        {/* форма */}
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
