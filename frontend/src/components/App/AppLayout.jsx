import { useState } from "react";
import Favorites from "./Favorites.jsx";
import AIGenerator from "./AIGenerator.jsx";
import RecipeWorkspace from "./RecipeWorkspace.jsx";
import RecipeHistory from "./RecipeHistory.jsx";
import Toolbar from "./Toolbar.jsx";
import RecipeView from "./RecipeView.jsx";
import Profile from "./Profile.jsx";

export default function AppLayout({ user, setUser, recipes, onLogout }) {
  const [page, setPage] = useState("catalog");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [fromPage, setFromPage] = useState("catalog");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🔥 універсальна навігація
  const changePage = (newPage) => {
    setPage(newPage);
    setSelectedRecipe(null); // щоб не залишався відкритий рецепт
    setSidebarOpen(false); // закриваємо sidebar
  };

  const openRecipe = (recipe, from) => {
    setSelectedRecipe(recipe);
    setFromPage(from);
    setSidebarOpen(false); // 🔥 закриваємо sidebar
  };

  const goBack = () => {
    setSelectedRecipe(null);
    setPage(fromPage);
  };

  const renderPage = () => {
    if (selectedRecipe) {
      return <RecipeView recipe={selectedRecipe} onBack={goBack} />;
    }

    switch (page) {
      case "catalog":
        return (
          <RecipeWorkspace
            recipes={recipes}
            onOpenRecipe={(r) => openRecipe(r, "catalog")}
          />
        );

      case "favorites":
        return (
          <Favorites
            user={user}
            onOpenRecipe={(r) => openRecipe(r, "favorites")}
          />
        );

      case "ai":
        return <AIGenerator />;

      case "profile":
        return <Profile user={user} setUser={setUser} />;

      case "myRecipes":
        return <RecipeHistory />;

      default:
        return (
          <RecipeWorkspace
            recipes={recipes}
            onOpenRecipe={(r) => openRecipe(r, "catalog")}
          />
        );
    }
  };

  return (
    <div className="app-layout">
      {sidebarOpen && (
        <div className="overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <h2>Food Recipe App</h2>

        <button onClick={() => changePage("catalog")}>Каталог рецептів</button>

        <button onClick={() => changePage("favorites")}>Обране</button>

        <button onClick={() => changePage("ai")}>AI рецепти</button>

        <button onClick={() => changePage("profile")}>Профіль</button>

        <button onClick={() => changePage("myRecipes")}>Мої рецепти</button>

        <div className="sidebar-footer">


          <button className="logout-sidebar-btn" onClick={onLogout}>
            <span className="logout-icon">⎗</span> Вийти
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Toolbar
          user={user}
          setPage={changePage} // 🔥 теж через правильну функцію
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onLogout={onLogout}
          onBack={selectedRecipe ? goBack : null}
        />

        {renderPage()}
      </main>
    </div>
  );
}
