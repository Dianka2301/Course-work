import { useState, useEffect } from "react";
import Favorites from "./Favorites.jsx";
import AIGenerator from "./AIGenerator.jsx";
import RecipeWorkspace from "./RecipeWorkspace.jsx";
import RecipeHistory from "./RecipeHistory.jsx";
import Toolbar from "./Toolbar.jsx";
import RecipeView from "./RecipeView.jsx";
import Profile from "./Profile.jsx";
import AdminModeration from "./AdminModeration.jsx";
import { fetchRecipes } from "../../api/recipes";

export default function AppLayout({ user, setUser, recipes, onLogout }) {
  const [page, setPage] = useState("catalog");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [fromPage, setFromPage] = useState("catalog");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🔥 FILTER STATE (backend-driven)
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("new");

  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [serverRecipes, setServerRecipes] = useState(recipes || []);

  // 🔥 LOAD FROM SERVER (category + sort)
  useEffect(() => {
    loadRecipes();
  }, [category, sort]);

  const loadRecipes = async () => {
    try {
      setLoadingRecipes(true);

      const data = await fetchRecipes(category, sort);

      setServerRecipes(data);
    } catch (err) {
      console.error("Recipes load error:", err);
    } finally {
      setLoadingRecipes(false);
    }
  };

  // 🔥 NAVIGATION
  const changePage = (newPage) => {
    setPage(newPage);
    setSelectedRecipe(null);
    setSidebarOpen(false);
  };

  const openRecipe = (recipe, from) => {
    setSelectedRecipe(recipe);
    setFromPage(from);
    setSidebarOpen(false);
  };

  const goBack = () => {
    setSelectedRecipe(null);
    setPage(fromPage);
  };

  const renderPage = () => {
    if (selectedRecipe) {
      return (
        <RecipeView
          recipe={selectedRecipe}
          user={user}
          onBack={goBack}
          onOpenRecipe={(r) => openRecipe(r, fromPage)}
        />
      );
    }

    switch (page) {
      case "catalog":
        return (
          <RecipeWorkspace
            recipes={serverRecipes}
            onOpenRecipe={(r) => openRecipe(r, "catalog")}
            category={category}
            setCategory={setCategory}
            sort={sort}
            setSort={setSort}
            loading={loadingRecipes}
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

      case "admin":
        return <AdminModeration />;

      default:
        return (
          <RecipeWorkspace
            recipes={serverRecipes}
            onOpenRecipe={(r) => openRecipe(r, "catalog")}
            category={category}
            setCategory={setCategory}
            sort={sort}
            setSort={setSort}
            loading={loadingRecipes}
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
        {user?.role !== "admin" && (
          <button onClick={() => changePage("favorites")}>Обране</button>
        )}
        {user?.role !== "admin" && (
          <button onClick={() => changePage("ai")}>AI рецепти</button>
        )}
        <button onClick={() => changePage("profile")}>Профіль</button>
        {user?.role !== "admin" && (
          <button onClick={() => changePage("myRecipes")}>Мої рецепти</button>
        )}
        {user?.role === "admin" && (
          <button onClick={() => changePage("admin")}>Список рецептів на публікацію</button>
        )}

        <div className="sidebar-footer">
          <button className="logout-sidebar-btn" onClick={onLogout}>
            <span className="logout-icon">⎗</span> Вийти
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Toolbar
          user={user}
          setPage={changePage}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onLogout={onLogout}
          onBack={selectedRecipe ? goBack : null}
        />

        {renderPage()}
      </main>
    </div>
  );
}
