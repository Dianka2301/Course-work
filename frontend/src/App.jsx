import { useState, useEffect } from "react";
import AuthPage from "./components/Auth/AuthPage.jsx";
import { verifyToken } from "./api/auth.js";
import { fetchRecipes } from "./api/recipes.js";
import AppLayout from "./components/App/AppLayout.jsx";

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
    <>
      {/* 🔥 AUTH PAGE (if not logged in) */}
      {!user && <AuthPage onOpenAuth={() => setShowAuthModal(true)} />}

      {/* 🔥 MAIN APP */}
      {user && (
        <AppLayout
          user={user}
          setUser={setUser} // ✅ LIVE UPDATE ENABLED
          recipes={recipes}
          onLogout={() => {
            setUser(null);
            setRecipes([]);
            localStorage.removeItem("token");
          }}
        />
      )}

      {/* 🔥 MODAL LOGIN/REGISTER */}
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
                // 🔥 FIXED LIVE UPDATE (NO BUGS)
                setUser(u);

                localStorage.setItem("token", t);
                setShowAuthModal(false);

                fetchRecipes().then(setRecipes);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
