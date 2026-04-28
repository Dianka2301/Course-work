export default function Toolbar({ user, onToggleSidebar, setPage, onLogout }) {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <button className="burger" onClick={onToggleSidebar}>
          ☰
        </button>

        <span className="logo">Flavoria</span>

        <div className="nav-links">
          <button onClick={() => setPage("catalog")}>Каталог</button>
          <button onClick={() => setPage("favorites")}>Обране</button>
          <button onClick={() => setPage("ai")}>AI</button>
          <button onClick={() => setPage("profile")}>Профіль</button>
          <button onClick={() => setPage("myRecipes")}>Мої</button>
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
