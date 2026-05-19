export default function Toolbar({
  user,
  onToggleSidebar,
  setPage,
  onLogout,
  onBack,
  unreadCount = 0,
}) {
  const isAdmin = user?.role === "admin";

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <button className="burger" onClick={onToggleSidebar}>
          ☰
        </button>

        <span className="logo">Food Recipe App</span>

        <div className="nav-links">
          <button onClick={() => setPage("catalog")}>Каталог</button>
          {!isAdmin && (
            <button onClick={() => setPage("favorites")}>Обране</button>
          )}
          {!isAdmin && <button onClick={() => setPage("ai")}>AI</button>}
          <button onClick={() => setPage("profile")}>Профіль</button>
          {!isAdmin && (
            <button onClick={() => setPage("myRecipes")}>Мої рецепти</button>
          )}
          {isAdmin && <button onClick={() => setPage("admin")}>Заявки</button>}
          {!isAdmin && (
            <button
              className="notifications-nav-btn"
              onClick={() => setPage("notifications")}
            >
              <img src="/images/notifications.svg" alt="" />
              Сповіщення
              {unreadCount > 0 && <span>{unreadCount}</span>}
            </button>
          )}
        </div>
      </div>

      <div className="toolbar-right">
        <button className="logout-btn" onClick={onLogout}>
          ⎗ Вийти
        </button>
      </div>
    </div>
  );
}
