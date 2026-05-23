import React, { useEffect, useState } from "react";
import { fetchFavorites, toggleFavorite } from "../../api/favorites.js";

const BASE_URL = "http://localhost:4000";

const recipeImageSrc = (image) => {
  if (!image) return `${BASE_URL}/images/placeholder.jpg`;
  if (image.startsWith("http") || image.startsWith("/")) return image;
  return `${BASE_URL}/images/${image}`;
};

// Функція перевірки системного адміністратора
const isSystemAdmin = (name) => {
  if (!name) return true;
  const lower = name.toLowerCase().trim();
  return lower === "diana admin" || lower === "admin";
};

function FavoriteCard({ recipe, onOpenRecipe, onRemove, onOpenAuthorProfile }) {
  const rating = Number(recipe.rating || 0);

  return (
    <div
      className="recipe-card catalog-card"
      onClick={() => onOpenRecipe(recipe)}
    >
      <div className="recipe-card-image-wrap">
        {recipe.prep_time && (
          <span className="time-chip">{recipe.prep_time}</span>
        )}
        <img
          src={recipeImageSrc(recipe.image)}
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

        {recipe.authorName && !isSystemAdmin(recipe.authorName) && (
          <div
            className="recipe-card-author"
            onClick={(e) => {
              e.stopPropagation();
              onOpenAuthorProfile?.(recipe.user_id);
            }}
            style={{ cursor: "pointer", textDecoration: "underline" }}
          >
            {recipe.authorName}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Favorites({ onOpenRecipe, onOpenAuthorProfile }) {
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

  // Дизайн як у сповіщеннях, коли порожньо
  if (recipes.length === 0)
    return (
      <div
        className="empty-state"
        style={{ padding: "40px 20px", textAlign: "center" }}
      >
        <h3>У вас ще немає обраних рецептів</h3>
        <p>Додавайте улюблені рецепти за допомогою сердечка ❤️ у каталозі.</p>
      </div>
    );

  return (
    <div style={{ padding: "20px" }}>
      <div className="recipes-grid">
        {recipes.map((recipe) => (
          <FavoriteCard
            key={recipe.id}
            recipe={recipe}
            onOpenRecipe={onOpenRecipe}
            onRemove={handleToggle}
            onOpenAuthorProfile={onOpenAuthorProfile}
          />
        ))}
      </div>
    </div>
  );
}
