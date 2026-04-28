import { useState } from "react";

export default function RecipeView({ recipe, onBack }) {
  const [rating, setRating] = useState(recipe.rating || 0);
  const [hover, setHover] = useState(null);

  const [comments, setComments] = useState(recipe.comments || []);
  const [text, setText] = useState("");

  // ⭐ SAVE RATING (готово під backend)
  const handleRating = async (value) => {
    setRating(value);

    // 🔥 пізніше підключиш API
    // await fetch(`/recipes/${recipe.id}/rating`, ...)
  };

  const handleAddComment = () => {
    if (!text.trim()) return;

    const newComment = {
      id: Date.now(),
      text,
    };

    setComments([...comments, newComment]);
    setText("");

    // 🔥 пізніше backend:
    // POST /recipes/:id/comments
  };

  return (
    <div className="recipe-view">
      <button className="back-btn" onClick={onBack}>
        ← Назад
      </button>

      <h2 className="recipe-title">{recipe.title}</h2>

      {/* 🔥 MAIN LAYOUT */}
      <div className="recipe-layout">
        {/* LEFT */}
        <div className="recipe-left">
          <img
            src={`http://localhost:4000/images/${recipe.image}`}
            className="recipe-view-img"
          />

          {/* ⭐ RATING */}
          <div className="rating-box">
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => handleRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(null)}
                  className="star"
                >
                  {star <= (hover || rating) ? "★" : "☆"}
                </span>
              ))}
            </div>

            <div className="avg-rating">
              Середня оцінка: <b>{rating}/5</b>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="recipe-right">
          {/* 🥕 INGREDIENTS FIX */}
          <div className="section">
            <h4>Інгредієнти</h4>

            <div className="ingredients-list">
              {recipe.ingredients?.split(",").map((item, i) => (
                <div key={i} className="ingredient-item">
                  • {item.trim()}
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h4>Приготування</h4>
            <p style={{ whiteSpace: "pre-line" }}>{recipe.steps}</p>
          </div>
        </div>
      </div>

      {/* 💬 COMMENTS (ПІД ВСІМ) */}
      <div className="comments">
        <h4>Коментарі</h4>

        <div className="comment-list">
          {comments.map((c) => (
            <div key={c.id} className="comment">
              {c.text}
            </div>
          ))}
        </div>

        <div className="comment-box">
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
