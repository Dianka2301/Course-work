import React, { useState, useEffect } from "react";
import { fetchFavorites, toggleFavorite } from "../../api/favorites.js";
import searchIcon from "../../images/glass.png";

export default function RecipeWorkspace({ recipes = [], showFavorites, onOpenRecipe }) {
  const [favorites, setFavorites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Усі");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔍 SEARCH
  const [searchInput, setSearchInput] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const favs = await fetchFavorites();

        // ✅ FIX: підтримка різних форматів API
        setFavorites(favs.map((f) => f.recipe_id || f.id));

        const cats = Array.from(
          new Set(recipes.map((r) => r.category || "Інші рецепти")),
        );

        setCategories(["Усі", ...cats]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [recipes]);

  // ❤️ TOGGLE FAVORITE
  const handleToggleFavorite = async (recipeId) => {
    const { liked } = await toggleFavorite(recipeId);

    setFavorites((prev) =>
      liked ? [...prev, recipeId] : prev.filter((id) => id !== recipeId),
    );
  };

  // 🔥 FILTER LOGIC
  const filteredRecipes = recipes.filter((r) => {
    const matchesSearch = searchActive
      ? r.title.toLowerCase().includes(search) ||
        r.ingredients.toLowerCase().includes(search)
      : true;

    const matchesCategory =
      selectedCategory === "Усі" || r.category === selectedCategory;

    const matchesFavorites = showFavorites ? favorites.includes(r.id) : true;

    return matchesSearch && matchesCategory && matchesFavorites;
  });

  const handleSearch = () => {
    setSearch(searchInput.toLowerCase());
    setSearchActive(true);
  };

  const resetSearch = () => {
    setSearchInput("");
    setSearch("");
    setSearchActive(false);
  };

  if (loading) return <p>Завантаження...</p>;

  // 📖 DETAIL VIEW
  if (selectedRecipe) {
    return (
      <div style={{ padding: "20px" }}>
        <button className="back-btn" onClick={() => setSelectedRecipe(null)}>
          ← Назад
        </button>

        <h2>{selectedRecipe.title}</h2>

        <img
          src={`http://localhost:4000/images/${selectedRecipe.image}`}
          style={{ width: 300, borderRadius: 12 }}
        />

        <h4>Інгредієнти</h4>
        <p className="pill">{selectedRecipe.ingredients}</p>

        <h4>Приготування</h4>
        <p style={{ whiteSpace: "pre-line" }}>{selectedRecipe.steps}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      {/* 🔍 SEARCH BAR */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Пошук рецептів..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <button className="search-btn" onClick={handleSearch}>
          <img
            src={searchIcon}
            alt="search"
            style={{ width: 18, height: 18 }}
          />
        </button>

        {searchActive && (
          <button className="clear-btn" onClick={resetSearch}>
            ✖
          </button>
        )}
      </div>

      {/* 📂 CATEGORIES */}
      <div className="category-row">
        {!searchActive &&
          categories.map((cat) => (
            <button
              key={cat}
              className={`chip ${
                selectedCategory === cat ? "active-chip" : ""
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
      </div>

      {/* 🍽 CARDS */}
      <div className="recipes-grid">
        {filteredRecipes.map((recipe) => (
          <div
            key={recipe.id}
            className="recipe-card"
            onClick={() => onOpenRecipe(recipe)}
          >
            <img
              src={`http://localhost:4000/images/${recipe.image}`}
              className="recipe-img"
            />

            <div className="card-content">
              <h3>{recipe.title}</h3>

              <p className="ingredients">
                {recipe.ingredients.slice(0, 60)}...
              </p>

              <div className="meta">
                <span>⭐ {recipe.rating || 0}</span>
                <span>{recipe.category}</span>
              </div>
            </div>

            {/* ❤️ */}
            <button
              className="fav-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(recipe.id);
              }}
            >
              {favorites.includes(recipe.id) ? "❤️" : "🤍"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
