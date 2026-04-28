import React, { useEffect, useState } from "react";
import { fetchFavorites, toggleFavorite } from "../../api/favorites.js";

export default function Favorites({ onOpenRecipe }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const favRecipes = await fetchFavorites();
        setRecipes(favRecipes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, []);

  // ❤️ REMOVE FROM FAVORITES
  const handleToggle = async (recipeId) => {
    try {
      const res = await toggleFavorite(recipeId);

      // якщо liked = false → прибираємо з UI
      if (!res.liked) {
        setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return <p style={{ padding: "20px" }}>Завантаження обраних рецептів...</p>;

  if (recipes.length === 0)
    return (
      <p style={{ padding: "20px", fontSize: "16px" }}>
        У вас ще немає обраних рецептів ❤️
      </p>
    );

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        padding: "20px",
      }}
    >
      {recipes.map((recipe) => (
        <div
          key={recipe.id}
          onClick={() => onOpenRecipe(recipe)}
          style={{
            width: "200px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            overflow: "hidden",
            textAlign: "center",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            cursor: "pointer",
            position: "relative",
          }}
        >
          {/* ❤️ REMOVE BUTTON */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggle(recipe.id);
            }}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "white",
              border: "none",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            ❤️
          </button>

          {recipe.image && (
            <img
              src={`http://localhost:4000/images/${recipe.image}`}
              alt={recipe.title}
              style={{ width: "100%", height: "120px", objectFit: "cover" }}
            />
          )}

          <div style={{ padding: "10px" }}>
            <h4 style={{ margin: "5px 0", color: "#a27645" }}>
              {recipe.title}
            </h4>
            <p style={{ fontSize: "12px", height: "40px", overflow: "hidden" }}>
              {recipe.steps.substring(0, 60)}...
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
