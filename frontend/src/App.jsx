import { useState, useEffect } from "react";
import AuthPage from "./components/Auth/AuthPage.jsx";
import { verifyToken } from "./api/auth.js";
import { fetchRecipes } from "./api/recipes.js";
import AppLayout from "./components/App/AppLayout.jsx";
import { Routes, Route } from "react-router-dom";
import ForgotPassword from "./components/Auth/ForgotPassword.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    verifyToken(token)
      .then((data) => {
        if (!data?.user) throw new Error("Invalid token");
        setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const openForgot = () => setShowAuthModal(false);

    window.addEventListener("openForgotPassword", openForgot);

    return () => {
      window.removeEventListener("openForgotPassword", openForgot);
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    fetchRecipes("all", "new")
      .then(setRecipes)
      .catch((err) => console.error("Recipes load error:", err));
  }, [user]);

  if (loading) {
    return <div className="center">Завантаження...</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <>

            {!user && (
              <AuthPage
                onOpenAuth={() => setShowAuthModal(true)}
                onLogin={(u, t) => {
                  setUser(u);
                  localStorage.setItem("token", t);
                }}
              />
            )}

            {user && (
              <AppLayout
                user={user}
                setUser={setUser}
                recipes={recipes}
                onLogout={() => {
                  setUser(null);
                  setRecipes([]);
                  localStorage.removeItem("token");
                }}
              />
            )}

            {showAuthModal && (
              <div className="modal-overlay">
                <div className="modal">
                  <button
                    className="modal-close"
                    onClick={() => setShowAuthModal(false)}
                  >
                    ✖
                  </button>

                  <AuthPage
                    isModal
                    onLogin={(u, t) => {
                      setUser(u);
                      localStorage.setItem("token", t);
                      setShowAuthModal(false);

    
                      fetchRecipes("all", "new")
                        .then(setRecipes)
                        .catch(console.error);
                    }}
                  />
                </div>
              </div>
            )}

            <ForgotPassword />
          </>
        }
      />
    </Routes>
  );
}
