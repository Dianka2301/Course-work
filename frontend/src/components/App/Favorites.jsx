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
    <div style={{ padding: "20px" }}>
      {/* 🔥 GRID */}
      <div className="recipes-grid">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="recipe-card"
            onClick={() => onOpenRecipe(recipe)}
          >
            {/* IMAGE */}
            <img
              src={`http://localhost:4000/images/${recipe.image}`}
              className="recipe-img"
            />

            {/* CONTENT */}
            <div className="card-content">
              <h3>{recipe.title}</h3>

              <p className="ingredients">
                {recipe.ingredients?.slice(0, 60)}...
              </p>

              <div className="meta">
                <span>⭐ {recipe.rating || 0}</span>
                <span>{recipe.category}</span>
              </div>
            </div>

            {/* ❤️ REMOVE */}
            <button
              className="fav-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleToggle(recipe.id);
              }}
            >
              ❤️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
