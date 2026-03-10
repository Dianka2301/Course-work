import React, { useEffect, useState } from "react";
import { fetchFavorites } from "../../api/favorites.js";

export default function Favorites() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const favRecipes = await fetchFavorites(); // сервер повертає масив рецептів
        setRecipes(favRecipes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, []);

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
          style={{
            width: "200px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            overflow: "hidden",
            textAlign: "center",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
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
