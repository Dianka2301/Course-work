import React, { useState, useEffect } from "react";
import { fetchFavorites, toggleFavorite } from "../../api/favorites.js";
import searchIcon from "../../images/glass.png";

export default function RecipeWorkspace({
  recipes = [],
  showFavorites,
  onOpenRecipe,
  refreshRecipes,
}) {
  const [favorites, setFavorites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Усі");
  const [loading, setLoading] = useState(true);

  // 🔍 SEARCH
  const [searchInput, setSearchInput] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [search, setSearch] = useState("");

  const BASE_URL = "http://localhost:4000";

  // 🖼 СЛОВНИК ІКОНОК
  // Пропиши тут назви категорій точно так, як вони приходять з бази
  const categoryIcons = {
    Усі: `${BASE_URL}/images/category/all.png`,
    "Базові рецепти": `${BASE_URL}/images/category/base.png`,
    Салати: `${BASE_URL}/images/category/salads.jpg`,
    Десерти: `${BASE_URL}/images/category/desserts.png`,
    Паста: `${BASE_URL}/images/category/pasta.png`,
    "М'ясо": `${BASE_URL}/images/category/meat.png`,
    Морепродукти: `${BASE_URL}/images/category/seafood.png`,
    "Інші рецепти": `${BASE_URL}/images/category/default.png`,
  };

  useEffect(() => {
    async function loadData() {
      try {
        const favs = await fetchFavorites();
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

  // ❤️ FAVORITES
  const handleToggleFavorite = async (recipeId) => {
    const { liked } = await toggleFavorite(recipeId);
    setFavorites((prev) =>
      liked ? [...prev, recipeId] : prev.filter((id) => id !== recipeId),
    );
  };

  // 🔥 SEARCH
  const handleSearch = () => {
    setSearch(searchInput.toLowerCase());
    setSearchActive(true);
  };

  const resetSearch = () => {
    setSearchInput("");
    setSearch("");
    setSearchActive(false);
  };

  // 🔥 FILTER
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

  if (loading) return <p>Завантаження...</p>;

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
          <img src={searchIcon} alt="search" style={{ width: 18 }} />
        </button>
        {searchActive && (
          <button className="clear-btn" onClick={resetSearch}>
            ✖
          </button>
        )}
      </div>

      {/* 📂 CATEGORIES (Круглий стиль як на Фото 1) */}
      <div className="category-row-new">
        {!searchActive &&
          categories.map((cat) => (
            <button
              key={cat}
              className={`cat-item ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              <div className="cat-circle">
                <img
                  src={
                    categoryIcons[cat] ||
                    `${BASE_URL}/images/category/default.jpg`
                  }
                  alt={cat}
                  onError={(e) => {
                    e.target.src = `${BASE_URL}/images/category/default.jpg`;
                  }}
                />
              </div>
              <span className="cat-name">{cat}</span>
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
              src={`${BASE_URL}/images/${recipe.image}`}
              className="recipe-img"
              alt={recipe.title}
            />
            <div className="card-content">
              <h3>{recipe.title}</h3>
              <div className="ingredients-wrapper">
                {recipe.ingredients
                  ?.split(",")
                  .slice(0, 6)
                  .map((item, index) => (
                    <span key={index} className="ingredient-tag">
                      {item.trim()}
                    </span>
                  ))}
              </div>
              <div className="meta">
                <span>⭐ {recipe.rating || 0}</span>
                <span>{recipe.category}</span>
              </div>
            </div>
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
