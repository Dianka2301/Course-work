export default function Toolbar({
  user,
  onToggleSidebar,
  setPage,
  onLogout,
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
          {!isAdmin && (
            <button onClick={() => setPage("ai")}>ШІ-генератор</button>
          )}
          {!isAdmin && (
            <button onClick={() => setPage("myRecipes")}>Мої рецепти</button>
          )}
          {isAdmin && <button onClick={() => setPage("admin")}>Заявки</button>}
        </div>
      </div>

      <div className="toolbar-right">
        {/* Сповіщення (тільки для користувачів) */}
        {!isAdmin && (
          <button
            className="notifications-nav-btn"
            onClick={() => setPage("notifications")}
          >
            <img src="/images/notifications.svg" alt="bell" />
            {unreadCount > 0 && <span>{unreadCount}</span>}
          </button>
        )}

        {/* Вкладка Профіль/Кабінет (тільки для користувачів) */}
        {!isAdmin && (
          <button
            className="profile-btn-nav"
            onClick={() => setPage("profile")}
          >
            Профіль
          </button>
        )}

        <button className="logout-btn" onClick={onLogout}>
          ⎗ Вийти
        </button>
      </div>
    </div>
  );
}
