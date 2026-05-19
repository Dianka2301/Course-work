import React, { useState, useEffect, useRef } from "react";
import { fetchFavorites, toggleFavorite } from "../../api/favorites.js";
import searchIcon from "../../images/glass.jpg";

export default function RecipeWorkspace({
  recipes = [],
  showFavorites,
  onOpenRecipe,
  refreshRecipes,
}) {
  const [favorites, setFavorites] = useState([]);
  const [allCategories, setAllCategories] = useState(["Усі"]); // Фіксований список
  const [selectedCategory, setSelectedCategory] = useState("Усі");
  const [sortBy, setSortBy] = useState("default"); // Стан для сортування
  const [loading, setLoading] = useState(true);

  // 🔍 SEARCH
  const [searchInput, setSearchInput] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [search, setSearch] = useState("");
  const scrollRef = useRef(null);

  const BASE_URL = "http://localhost:4000";


const categoryIcons = {
  "Усі рецепти": `${BASE_URL}/images/category/all.jpg`,

  Сніданки: `${BASE_URL}/images/category/breakfast.jpg`,

  "Основні страви": `${BASE_URL}/images/category/main_courses.jpg`,

  Супи: `${BASE_URL}/images/category/soups.jpg`,

  Салати: `${BASE_URL}/images/category/salads.jpg`,

  Паста: `${BASE_URL}/images/category/pasta.jpg`,

  Закуски: `${BASE_URL}/images/category/snacks.jpg`,

  Десерти: `${BASE_URL}/images/category/desserts.jpg`,

  Випічка: `${BASE_URL}/images/category/bakery.jpg`,

  "Дієтичні страви":
    `${BASE_URL}/images/category/diet.jpg`,

  "Напої та смузі":
    `${BASE_URL}/images/category/drinks.jpg`,

};

function RecipeCard({ recipe, isFavorite, onOpenRecipe, onToggleFavorite }) {
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
            onToggleFavorite(recipe.id);
          }}
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>
      </div>

      <div className="card-content">
        <div className="recipe-card-badges">
          <span className="cat-badge">{recipe.category}</span>
          {recipe.difficulty && (
            <span className="difficulty-badge">{recipe.difficulty}</span>
          )}
          {rating > 0 && (
            <span className="rating-badge">★ {rating}</span>
          )}
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

  useEffect(() => {
    async function loadData() {
      try {
        const favs = await fetchFavorites();
        setFavorites(favs.map((f) => f.recipe_id || f.id));

        // Зберігаємо повний список категорій лише один раз при першому завантаженні recipes
        if (recipes.length > 0 && allCategories.length === 1) {
          const cats = Array.from(
            new Set(recipes.map((r) => r.category || "Інші рецепти")),
          );
          setAllCategories(["Усі", ...cats.filter((c) => c !== "Усі")]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [recipes]);

  const handleToggleFavorite = async (recipeId) => {
    const { liked } = await toggleFavorite(recipeId);
    setFavorites((prev) =>
      liked ? [...prev, recipeId] : prev.filter((id) => id !== recipeId),
    );
  };

  const handleSearch = () => {
    setSearch(searchInput.toLowerCase());
    setSearchActive(true);
  };

  const resetSearch = () => {
    setSearchInput("");
    setSearch("");
    setSearchActive(false);
  };

  const scroll = (dir) => {
    scrollRef.current.scrollBy({
      left: dir === "left" ? -200 : 200,
      behavior: "smooth",
    });
  };

  // 🔥 ЛОГІКА ФІЛЬТРАЦІЇ ТА СОРТУВАННЯ
  const filteredAndSortedRecipes = recipes
    .filter((r) => {
      const matchesSearch = searchActive
        ? r.title.toLowerCase().includes(search) ||
          r.ingredients.toLowerCase().includes(search)
        : true;

      const matchesCategory =
        selectedCategory === "Усі" || r.category === selectedCategory;

      const matchesFavorites = showFavorites ? favorites.includes(r.id) : true;

      return matchesSearch && matchesCategory && matchesFavorites;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "newest") return b.id - a.id; // Припускаємо, що більший ID = новіший
      return 0;
    });

  if (loading) return <p>Завантаження...</p>;

  return (
    <div className="catalog-page">
      <div
        className="filters-container"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        {/* 📂 CATEGORIES */}
        <div
          className="category-wrapper"
          style={{ flex: 1, position: "relative" }}
        >
          <button onClick={() => scroll("left")} className="scroll-btn left">
            ‹
          </button>
          <div
            className="category-row-new"
            ref={scrollRef}
            style={{ display: "flex", overflowX: "hidden", gap: "15px" }}
          >
            {allCategories.map((cat) => (
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
          <button onClick={() => scroll("right")} className="scroll-btn right">
            ›
          </button>
        </div>
      </div>

      <div className="catalog-filter-row">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Пошук рецептів за назвою або інгредієнтом..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="search-btn" onClick={handleSearch}>
            <img src={searchIcon} alt="search" style={{ width: 18 }} />
          </button>
          {searchActive && (
            <button className="clear-btn" onClick={resetSearch}>
              Очистити
            </button>
          )}
        </div>

        <div className="sort-box">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="default">Сортувати за...</option>
            <option value="rating">Найкращий рейтинг</option>
            <option value="newest">Найновіші</option>
          </select>
        </div>
      </div>

      {/* 🍽 CARDS GRID */}
      <div className="recipes-grid">
        {filteredAndSortedRecipes.length > 0 ? (
          filteredAndSortedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={favorites.includes(recipe.id)}
              onOpenRecipe={onOpenRecipe}
              onToggleFavorite={handleToggleFavorite}
            />
          ))
        ) : (
          <p style={{ textAlign: "center", width: "100%", marginTop: "50px" }}>
            Нічого не знайдено. Спробуйте змінити категорію або запит.
          </p>
        )}
      </div>
    </div>
  );
}
