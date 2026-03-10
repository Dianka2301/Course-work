// RecipeWorkspace.jsx
import React, { useEffect, useState } from "react";
import { fetchRecipes } from "../../api/recipes.js";
import { fetchFavorites, toggleFavorite } from "../../api/favorites.js";

export default function RecipeWorkspace({ showFavorites }) {
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchRecipes();
        setRecipes(data);

        // Отримуємо унікальні категорії
        const cats = Array.from(
          new Set(data.map((r) => r.category || "Інші рецепти")),
        );
        setCategories(cats);
        setSelectedCategory(cats[0] || "");

        const favs = await fetchFavorites();
        setFavorites(favs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredRecipes = recipes.filter((r) => {
    if (showFavorites) return favorites.includes(r.id);
    return r.category === selectedCategory;
  });

  const handleToggleFavorite = async (recipeId) => {
    try {
      const { liked } = await toggleFavorite(recipeId);
      setFavorites((prev) =>
        liked ? [...prev, recipeId] : prev.filter((id) => id !== recipeId),
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Завантаження рецептів...</p>;

  // --- Детальний перегляд рецепта ---
  if (selectedRecipe) {
    const isLiked = favorites.includes(selectedRecipe.id);

    return (
      <div style={{ padding: "20px" }}>
        <button
          onClick={() => setSelectedRecipe(null)}
          style={{
            marginBottom: "20px",
            padding: "8px 16px",
            backgroundColor: "#a27645",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          ← Повернутись
        </button>

        <h2>{selectedRecipe.title}</h2>

        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          {/* --- Ліва частина: картинка --- */}
          {selectedRecipe.image && (
            <div style={{ position: "relative" }}>
              <img
                src={`http://localhost:4000/images/${selectedRecipe.image}`}
                alt={selectedRecipe.title}
                style={{
                  width: "400px",
                  height: "300px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
              {/* ❤️/♡ кнопка під картинкою */}
              <button
                onClick={() => handleToggleFavorite(selectedRecipe.id)}
                style={{
                  position: "absolute",
                  bottom: "-15px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  border: "none",
                  background: "white",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  cursor: "pointer",
                  fontSize: "20px",
                  color: isLiked ? "red" : "gray",
                }}
              >
                {isLiked ? "❤️" : "♡"}
              </button>
            </div>
          )}

          {/* --- Права частина: текст --- */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div>
              <h3>Інгредієнти:</h3>
              <ul>
                {selectedRecipe.ingredients.split("\n").map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3>Приготування:</h3>
              <p style={{ whiteSpace: "pre-wrap" }}>{selectedRecipe.steps}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Головний перегляд: всі рецепти ---
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        gap: "10px",
      }}
    >
      {!showFavorites && (
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "10px",
            flexWrap: "wrap",
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: "1px solid #a27645",
                backgroundColor: cat === selectedCategory ? "#a27645" : "white",
                color: cat === selectedCategory ? "white" : "#a27645",
                cursor: "pointer",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          overflowY: "auto",
          flex: 1,
        }}
      >
        {filteredRecipes.map((recipe) => {
          const isLiked = favorites.includes(recipe.id);
          return (
            <div
              key={recipe.id}
              style={{
                width: "200px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                overflow: "hidden",
                textAlign: "center",
                position: "relative",
                cursor: "pointer",
              }}
              onClick={() => setSelectedRecipe(recipe)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite(recipe.id);
                }}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "10px",
                  border: "none",
                  background: "white",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  cursor: "pointer",
                  fontSize: "18px",
                  color: isLiked ? "red" : "gray",
                }}
              >
                {isLiked ? "❤️" : "♡"}
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
                <p
                  style={{
                    fontSize: "12px",
                    height: "40px",
                    overflow: "hidden",
                  }}
                >
                  {recipe.steps.substring(0, 60)}...
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
