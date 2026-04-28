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

  const openRecipe = (recipe, from) => {
    setSelectedRecipe(recipe);
    setFromPage(from);
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
        <h2>Flavoria</h2>

        <button onClick={() => setPage("catalog")}>Каталог рецептів</button>
        <button onClick={() => setPage("favorites")}>Обране</button>
        <button onClick={() => setPage("ai")}>AI рецепти</button>
        <button onClick={() => setPage("profile")}>Профіль</button>
        <button onClick={() => setPage("myRecipes")}>Мої рецепти</button>


        <button onClick={onLogout}>Вийти</button>
      </aside>

      <main className="main-content">
        <Toolbar
          user={user}
          setPage={setPage}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onLogout={onLogout}
          onBack={selectedRecipe ? goBack : null}
        />

        {renderPage()}
      </main>
    </div>
  );
}
