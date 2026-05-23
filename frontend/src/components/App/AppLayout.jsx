import { useState, useEffect } from "react";
import Favorites from "./Favorites.jsx";
import AIGenerator from "./AIGenerator.jsx";
import AIHistory from "./AIHistory.jsx";
import RecipeWorkspace from "./RecipeWorkspace.jsx";
import RecipeHistory from "./RecipeHistory.jsx";
import Toolbar from "./Toolbar.jsx";
import RecipeView from "./RecipeView.jsx";
import Profile from "./Profile.jsx";
import AdminModeration from "./AdminModeration.jsx";
import Notifications from "./Notifications.jsx";
import {
  fetchRecipes,
  fetchUnreadNotificationsCount,
  updateAdminRecipe,
} from "../../api/recipes";

const BASE_URL = "http://localhost:4000";

function imageSrc(image) {
  if (!image) return `${BASE_URL}/images/placeholder.jpg`;
  if (image.startsWith("http")) return image;
  return `${BASE_URL}/images/${image}`;
}

export default function AppLayout({ user, setUser, recipes, onLogout }) {
  const [page, setPage] = useState("catalog");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [fromPage, setFromPage] = useState("catalog");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Стан для перегляду профілю іншого автора
  const [authorProfile, setAuthorProfile] = useState(null);
  // Стан для збереження початкової сторінки до переходу на профіль автора
  const [authorProfileFromPage, setAuthorProfileFromPage] = useState("catalog");

  // Динамічний ключ для примусового скидання форми в "Мої рецепти" [2]
  const [myRecipesKey, setMyRecipesKey] = useState(0);

  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("new");

  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [serverRecipes, setServerRecipes] = useState(recipes || []);
  const [unreadCount, setUnreadCount] = useState(0);

  // Синхронізуємо локальний стан рецептів з пропом, якщо він змінюється зверху
  useEffect(() => {
    if (recipes) {
      setServerRecipes(recipes);
    }
  }, [recipes]);

  // 🔥 Додано `user` у залежності: завантажуємо рецепти заново при зміні біо профілю
  useEffect(() => {
    loadRecipes();
  }, [category, sort, user]);

  useEffect(() => {
    loadUnreadCount();
  }, [user?.id]);

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

  const loadUnreadCount = async () => {
    if (!user || user.role === "admin") return;
    try {
      const data = await fetchUnreadNotificationsCount();
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const changePage = (newPage) => {
    if (newPage === "myRecipes" && page === "myRecipes") {
      setMyRecipesKey((prev) => prev + 1); // збільшуємо ключ
    }
    setPage(newPage);
    setSelectedRecipe(null);
    setSidebarOpen(false);
    setAuthorProfile(null);
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

  // Відкрити публічний профіль автора
  const openAuthorProfile = (authorId) => {
    const authorRecipes = serverRecipes.filter((r) => r.user_id === authorId);
    if (authorRecipes.length === 0) return;

    setAuthorProfileFromPage(selectedRecipe ? fromPage : page);

    const firstRecipe = authorRecipes[0];
    setAuthorProfile({
      id: authorId,
      name: firstRecipe.authorName || "Автор",
      avatar: firstRecipe.avatar || null,
      bio: firstRecipe.bio || "Біографія відсутня.",
      recipes: authorRecipes,
    });
    setPage("author-profile");
    setSelectedRecipe(null);
  };

  // Збереження змін адміном прямо з каталогу
  const handleAdminUpdateRecipe = async (recipeId, updatedData) => {
    try {
      await updateAdminRecipe(recipeId, updatedData);
      await loadRecipes();
      if (selectedRecipe && selectedRecipe.id === recipeId) {
        setSelectedRecipe((prev) => ({ ...prev, ...updatedData }));
      }
    } catch (err) {
      console.error("Admin save from catalog failed:", err);
    }
  };

  const renderPage = () => {
    if (selectedRecipe) {
      return (
        <RecipeView
          recipe={selectedRecipe}
          user={user}
          onBack={goBack}
          onOpenRecipe={(r) => openRecipe(r, fromPage)}
          onOpenAuthorProfile={openAuthorProfile}
          onAdminUpdate={handleAdminUpdateRecipe}
        />
      );
    }

    switch (page) {
      case "catalog":
        return (
          <RecipeWorkspace
            recipes={serverRecipes}
            onOpenRecipe={(r) => openRecipe(r, "catalog")}
            onOpenAuthorProfile={openAuthorProfile}
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
            onOpenAuthorProfile={openAuthorProfile}
          />
        );

      case "ai":
        return <AIGenerator onOpenHistory={() => changePage("aiHistory")} />;

      case "aiHistory":
        return <AIHistory onBack={() => changePage("ai")} />;

      case "profile":
        return <Profile user={user} setUser={setUser} />;

      case "myRecipes":
        // 🔥 Передаємо loadRecipes як проп onRefresh
        return <RecipeHistory key={myRecipesKey} onRefresh={loadRecipes} />;

      case "notifications":
        return <Notifications onChanged={loadUnreadCount} />;

      case "admin":
        // 🔥 Передаємо loadRecipes як проп onRefresh
        return <AdminModeration onRefresh={loadRecipes} />;

      case "author-profile":
        if (!authorProfile) return <p>Завантаження профілю...</p>;
        return (
          <div className="author-profile-container">
            <button
              className="back-btn"
              onClick={() => setPage(authorProfileFromPage)}
            >
              ← Назад
            </button>
            <div className="author-profile-card-layout">
              <div className="author-left-rect-avatar">
                <img
                  src={
                    authorProfile.avatar
                      ? `${BASE_URL}/uploads/${authorProfile.avatar}`
                      : "/images/default-avatar.png"
                  }
                  onError={(e) => {
                    e.target.src = "/images/default-avatar.png";
                  }}
                  alt={authorProfile.name}
                />
              </div>
              <div className="author-right-info">
                <h2>{authorProfile.name}</h2>
                <div className="author-bio-section">
                  <p>{authorProfile.bio}</p>
                </div>
              </div>
            </div>

            <div className="author-recipes-section">
              <h3>Публікації автора ({authorProfile.recipes.length})</h3>
              <div className="recipes-grid">
                {authorProfile.recipes.map((r) => (
                  <div
                    key={r.id}
                    className="recipe-card catalog-card"
                    onClick={() => openRecipe(r, "author-profile")}
                  >
                    <div className="recipe-card-image-wrap">
                      {r.prep_time && (
                        <span className="time-chip">{r.prep_time}</span>
                      )}
                      <img src={imageSrc(r.image)} alt={r.title} />
                    </div>
                    <div className="card-content">
                      <h3>{r.title}</h3>
                      <div className="ingredients-wrapper">
                        {r.ingredients
                          ?.split("\n")
                          .filter((item) => item.trim() !== "")
                          .slice(0, 3)
                          .map((item, index) => (
                            <span key={index} className="ingredient-tag">
                              {item.trim()}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <RecipeWorkspace
            recipes={serverRecipes}
            onOpenRecipe={(r) => openRecipe(r, "catalog")}
            onOpenAuthorProfile={openAuthorProfile}
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
          <button onClick={() => changePage("ai")}>ШІ-генератор</button>
        )}

        {/* Профіль приховано в сайдбарі для адміна */}
        {user?.role !== "admin" && (
          <button onClick={() => changePage("profile")}>Профіль</button>
        )}

        {user?.role !== "admin" && (
          <button onClick={() => changePage("myRecipes")}>Мої рецепти</button>
        )}
        {user?.role === "admin" && (
          <button onClick={() => changePage("admin")}>
            Список рецептів на публікацію
          </button>
        )}
        {user?.role !== "admin" && (
          <button
            className="sidebar-notification-btn"
            onClick={() => changePage("notifications")}
          >
            Сповіщення
            {unreadCount > 0 && <span>{unreadCount}</span>}
          </button>
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
          unreadCount={unreadCount}
        />

        {renderPage()}
      </main>
    </div>
  );
}
