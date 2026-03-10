import { useState } from "react";
import RecipeWorkspace from "./RecipeWorkspace.jsx";
import AIGenerator from "./AIGenerator.jsx";

export default function Dashboard({ user, recipes, onLogout }) {
  const [tab, setTab] = useState("recipes");
  const [showFavorites, setShowFavorites] = useState(false);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 25px",
          background: "#a27645",
          color: "white",
        }}
      >
        <h2>Flavoria</h2>
        <div>
          {user.email}
          <button
            onClick={onLogout}
            style={{
              marginLeft: "15px",
              padding: "6px 12px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Вийти
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          padding: "10px 20px",
          borderBottom: "1px solid #ddd",
          background: "#f7f7f7",
        }}
      >
        <button
          onClick={() => {
            setTab("recipes");
            setShowFavorites(false);
          }}
          style={{
            padding: "8px 16px",
            borderRadius: "20px",
            border: "1px solid #a27645",
            background: !showFavorites ? "#a27645" : "white",
            color: !showFavorites ? "white" : "#a27645",
            cursor: "pointer",
          }}
        >
          Каталог рецептів
        </button>
        <button
          onClick={() => {
            setTab("recipes");
            setShowFavorites(true);
          }}
          style={{
            padding: "8px 16px",
            borderRadius: "20px",
            border: "1px solid #a27645",
            background: showFavorites ? "#a27645" : "white",
            color: showFavorites ? "white" : "#a27645",
            cursor: "pointer",
          }}
        >
          Обране
        </button>
        <button
          onClick={() => setTab("ai")}
          style={{
            marginLeft: "auto",
            padding: "8px 16px",
            borderRadius: "20px",
            border: "1px solid #a27645",
            background: tab === "ai" ? "#a27645" : "white",
            color: tab === "ai" ? "white" : "#a27645",
            cursor: "pointer",
          }}
        >
          AI-генератор рецептів
        </button>
      </div>

      <div style={{ flex: 1 }}>
        {tab === "recipes" && (
          <RecipeWorkspace showFavorites={showFavorites} recipes={recipes} />
        )}
        {tab === "ai" && <AIGenerator />}
      </div>
    </div>
  );
}
