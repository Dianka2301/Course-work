import React, { useState, useEffect, useRef } from "react";
import { fetchFavorites, toggleFavorite } from "../../api/favorites.js";
import searchIcon from "../../images/glass.jpg";

const BASE_URL = "http://localhost:4000";

const recipeImageSrc = (image) => {
  if (!image) return `${BASE_URL}/images/placeholder.jpg`;
  if (image.startsWith("http") || image.startsWith("/")) return image;
  return `${BASE_URL}/images/${image}`;
};

// Функція для перевірки чи є автор системним адміністратором
const isSystemAdmin = (name) => {
  if (!name) return true;
  const lower = name.toLowerCase().trim();
  return lower === "diana admin" || lower === "admin";
};

function RecipeCard({
  recipe,
  isFavorite,
  onOpenRecipe,
  onToggleFavorite,
  onOpenAuthorProfile,
}) {
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
              e.stopPropagation(); // запобігаємо відкриттю самого рецепту при кліку на автора
              onOpenAuthorProfile?.(recipe.user_id);
            }}
            style={{ cursor: "pointer" }}
          >
            {recipe.authorName}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RecipeWorkspace({
  recipes = [],
  showFavorites,
  onOpenRecipe,
  onOpenAuthorProfile,
}) {
  const [favorites, setFavorites] = useState([]);

  // 🔥 Ініціалізуємо стан всередині вашим чітким статичним списком у правильному порядку
  const [allCategories] = useState([
    "Усі рецепти",
    "Сніданки",
    "Основні страви",
    "Супи",
    "Салати",
    "Паста",
    "Закуски",
    "Десерти",
    "Випічка",
    "Дієтичні страви",
    "Напої та смузі",
  ]);

  const [selectedCategory, setSelectedCategory] = useState("Усі рецепти");
  const [sortBy, setSortBy] = useState("default");
  const [loading, setLoading] = useState(true);

  // Стан пагінації (по 15 елементів на сторінку)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Автоматичний скрол вгору при зміні сторінки каталогу
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentPage]);

  const [searchInput, setSearchInput] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [search, setSearch] = useState("");
  const scrollRef = useRef(null);

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
    "Дієтичні страви": `${BASE_URL}/images/category/diet.jpg`,
    "Напої та смузі": `${BASE_URL}/images/category/drinks.jpg`,
  };

  useEffect(() => {
    async function loadData() {
      try {
        const favs = await fetchFavorites();
        setFavorites(favs.map((f) => f.recipe_id || f.id));
        // Динамічне зчитування категорій з рецептів повністю видалено
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [recipes]);

  // Скидання на 1 сторінку при зміні фільтрів чи пошуку
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, search, sortBy]);

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

  // Вага для складності при сортуванні
  const difficultyWeights = {
    easy: 1,
    medium: 2,
    hard: 3,
  };

  const filteredAndSortedRecipes = recipes
    .filter((r) => {
      const matchesSearch = searchActive
        ? r.title.toLowerCase().includes(search) ||
          r.ingredients.toLowerCase().includes(search)
        : true;

      const matchesCategory =
        selectedCategory === "Усі рецепти" || r.category === selectedCategory;

      const matchesFavorites = showFavorites ? favorites.includes(r.id) : true;

      return matchesSearch && matchesCategory && matchesFavorites;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "newest") return b.id - a.id;

      // Сортування за легкістю
      if (sortBy === "difficulty_easy") {
        const weightA = difficultyWeights[a.difficulty?.toLowerCase()] || 1;
        const weightB = difficultyWeights[b.difficulty?.toLowerCase()] || 1;
        return weightA - weightB;
      }

      // Сортування за складністю
      if (sortBy === "difficulty_hard") {
        const weightA = difficultyWeights[a.difficulty?.toLowerCase()] || 1;
        const weightB = difficultyWeights[b.difficulty?.toLowerCase()] || 1;
        return weightB - weightA;
      }

      return 0;
    });

  // Логіка пагінації рецептів
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecipes = filteredAndSortedRecipes.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  const totalPages = Math.ceil(filteredAndSortedRecipes.length / itemsPerPage);

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
              ✕
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
            {/* Додані опції сортування за складністю */}
            <option value="difficulty_easy">Складність: спочатку легкі</option>
            <option value="difficulty_hard">
              Складність: спочатку складні
            </option>
          </select>
        </div>
      </div>

      {/* Grid карт */}
      <div className="recipes-grid">
        {paginatedRecipes.length > 0 ? (
          paginatedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={favorites.includes(recipe.id)}
              onOpenRecipe={onOpenRecipe}
              onToggleFavorite={handleToggleFavorite}
              onOpenAuthorProfile={onOpenAuthorProfile}
            />
          ))
        ) : (
          <p style={{ textAlign: "center", width: "100%", marginTop: "50px" }}>
            Нічого не знайдено. Спробуйте змінити категорію або запит.
          </p>
        )}
      </div>

      {/* Пагінація */}
      {totalPages > 1 && (
        <div
          className="pagination-wrapper"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginTop: "30px",
          }}
        >
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="pagination-btn"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`pagination-btn ${currentPage === pageNum ? "active" : ""}`}
              >
                {pageNum}
              </button>
            ),
          )}
          <button
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            className="pagination-btn"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
