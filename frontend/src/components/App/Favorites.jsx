import React, { useEffect, useState } from "react";
import { fetchFavorites, toggleFavorite } from "../../api/favorites.js";

const BASE_URL = "http://localhost:4000";

function FavoriteCard({ recipe, onOpenRecipe, onRemove }) {
  const rating = Number(recipe.rating || 0);

  return (
    <div className="recipe-card catalog-card" onClick={() => onOpenRecipe(recipe)}>
      <div className="recipe-card-image-wrap">
        {recipe.prep_time && <span className="time-chip">{recipe.prep_time}</span>}
        <img
          src={`${BASE_URL}/images/${recipe.image}`}
          className="recipe-img"
          alt={recipe.title}
        />
        <button
          className="fav-btn bookmark-btn heart-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(recipe.id);
          }}
        >
          ❤️
        </button>
      </div>

      <div className="card-content">
        <div className="recipe-card-badges">
          <span className="cat-badge">{recipe.category}</span>
          {recipe.difficulty && (
            <span className="difficulty-badge">{recipe.difficulty}</span>
          )}
          {rating > 0 && <span className="rating-badge">★ {rating}</span>}
        </div>

        <h3>{recipe.title}</h3>

        <div className="ingredients-wrapper">
          {recipe.ingredients
            ?.split("\n")
            .filter((item) => item.trim() !== "")
            .slice(0, 4)
            .map((item, index) => (
              <span key={index} className="ingredient-tag">
                {item.trim()}
              </span>
            ))}
        </div>

        {recipe.authorName && (
          <div className="recipe-card-author">{recipe.authorName}</div>
        )}
      </div>
    </div>
  );
}

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
          <FavoriteCard
            key={recipe.id}
            recipe={recipe}
            onOpenRecipe={onOpenRecipe}
            onRemove={handleToggle}
          />
        ))}
      </div>
    </div>
  );
}
