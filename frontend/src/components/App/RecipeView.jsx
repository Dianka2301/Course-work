import { useState } from "react";

export default function RecipeView({ recipe, onBack }) {
  const [rating, setRating] = useState(recipe.rating || 0);
  const [hover, setHover] = useState(null);

  const [comments, setComments] = useState(recipe.comments || []);
  const [text, setText] = useState("");

  const handleAddComment = () => {
    if (!text.trim()) return;

    const newComment = {
      id: Date.now(),
      text,
    };

    setComments([...comments, newComment]);
    setText("");
  };

  const avgRating = rating; // поки локально (пізніше винесемо в backend)

  return (
    <div className="recipe-view">
      <button className="back-btn" onClick={onBack}>
        ← Назад
      </button>

      <h2>{recipe.title}</h2>

      <img
        src={`http://localhost:4000/images/${recipe.image}`}
        className="recipe-view-img"
      />

      {/* ⭐ RATING */}
      <div className="rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className="star"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
            style={{
              color: star <= (hover || rating) ? "#ffc107" : "#ccc",
              cursor: "pointer",
              fontSize: "22px",
            }}
          >
            ★
          </span>
        ))}
      </div>

      <p>Середня оцінка: {avgRating}/5</p>

      {/* INGREDIENTS */}
      <h4>Інгредієнти</h4>
      <p>{recipe.ingredients}</p>

      {/* STEPS */}
      <h4>Приготування</h4>
      <p style={{ whiteSpace: "pre-line" }}>{recipe.steps}</p>

      {/* 💬 COMMENTS */}
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
