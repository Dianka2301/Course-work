export default function Toolbar({
  user,
  onToggleSidebar,
  setPage,
  onLogout,
  onBack,
}) {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <button className="burger" onClick={onToggleSidebar}>
          ☰
        </button>

        <span className="logo">Food Recipe App</span>

        <div className="nav-links">
          <button onClick={() => setPage("catalog")}>Каталог</button>
          <button onClick={() => setPage("favorites")}>Обране</button>
          <button onClick={() => setPage("ai")}>AI</button>
          <button onClick={() => setPage("profile")}>Профіль</button>
          <button onClick={() => setPage("myRecipes")}>Мої рецепти</button>
        </div>
      </div>

      <div className="toolbar-right">
        <button className="logout-btn" onClick={onLogout}>
          Вийти
        </button>
      </div>
    </div>
  );
}
