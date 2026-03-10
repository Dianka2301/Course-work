import { useState, useEffect } from "react";
import AuthPage from "./components/Auth/AuthPage.jsx";
import Dashboard from "./components/App/Dashboard.jsx";
import { verifyToken } from "./api/auth.js";
import { fetchRecipes } from "./api/recipes.js";

export default function App() {
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      verifyToken(token).then((data) => {
        if (data?.user) setUser(data.user);
        else localStorage.removeItem("token");
      });
    }

    fetchRecipes()
      .then((data) => setRecipes(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="center">Завантаження...</div>;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "0 20px" }}>
      {!user ? (
        <AuthPage
          onLogin={(u, t) => {
            setUser(u);
            localStorage.setItem("token", t);
          }}
        />
      ) : (
        <Dashboard
          user={user}
          recipes={recipes}
          onLogout={() => {
            setUser(null);
            localStorage.removeItem("token");
          }}
        />
      )}
    </div>
  );
}
