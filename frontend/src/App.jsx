import { useState, useEffect } from "react";
import AuthPage from "./components/Auth/AuthPage.jsx";
import { verifyToken } from "./api/auth.js";
import { fetchRecipes } from "./api/recipes.js";
import AppLayout from "./components/App/AppLayout.jsx";
import { Routes, Route } from "react-router-dom";
import ForgotPassword from "./components/Auth/ForgotPassword.jsx";
import ResetPassword from "./components/Auth/ResetPassword.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 🔥 INIT USER FROM TOKEN
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    verifyToken(token)
      .then((data) => {
        if (!data?.user) {
          localStorage.removeItem("token");
          throw new Error("Invalid token");
        }

        setUser(data.user);
        return fetchRecipes();
      })
      .then((recipesData) => {
        if (recipesData) setRecipes(recipesData);
      })
      .catch((err) => {
        console.log("Auth error:", err);
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="center">Завантаження...</div>;
  }

  return (
    <Routes>
      {/* 🔥 MAIN APP (login + dashboard) */}
      <Route
        path="/"
        element={
          <>
            {!user && <AuthPage onOpenAuth={() => setShowAuthModal(true)} />}

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

            {/* modal login */}
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
                      localStorage.setItem("user", JSON.stringify(u));
                      setShowAuthModal(false);
                      fetchRecipes().then(setRecipes);
                    }}
                  />
                </div>
              </div>
            )}
          </>
        }
      />

      {/* 🔥 FORGOT PASSWORD */}
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* 🔥 RESET PASSWORD */}
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
}
