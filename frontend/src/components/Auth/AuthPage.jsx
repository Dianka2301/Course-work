import { useState } from "react";
import AuthForm from "./AuthForm.jsx";
import "./Auth.css";
import About from "./About.jsx";
import Features from "./Features.jsx"; // 🔥 ДОДАЛИ
import dashboardImg from "../../images/dashboard.png";

export default function AuthPage({ onLogin, onOpenAuth, isModal }) {
  const [tab, setTab] = useState("about");
  const [mode, setMode] = useState("login");

  // 🔥 MODAL
  if (isModal) {
    return (
      <div className="modal-inner">
        <div className="auth-title">Food Recipe App</div>

        {/* 🔥 TABS */}
        <div className="auth-tabs">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Увійти
          </button>

          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Реєстрація
          </button>
        </div>

        <div className="auth-switch-wrapper">
          <div key={mode} className="auth-switch">
            <AuthForm mode={mode} onLogin={onLogin} />
          </div>
        </div>
      </div>
    );
  }

  // 🔥 NORMAL PAGE
  return (
    <div className="auth-container">
      <div className="auth-header">
        {/* 🔥 ЗАТЕМНЕННЯ */}
        <div className="hero-overlay"></div>

        <div className="header-top-row">
          <div className="logo-app">Food Recipe App</div>

          <div className="nav-tabs">
            <button
              className={tab === "about" ? "active" : ""}
              onClick={() => setTab("about")}
            >
              Про нас
            </button>

            <button
              className={tab === "features" ? "active" : ""}
              onClick={() => setTab("features")}
            >
              Функції застосунку
            </button>

            <button className="login-btn" onClick={onOpenAuth}>
              Вхід / Реєстрація
            </button>
          </div>
        </div>

        {/* 🔥 HERO TEXT */}
        <div className="hero-text">
          <h1>Щастя народжується в страві</h1>

          <p>
            Food Recipe App — це місце, де кулінарія стає досвідом, а не просто
            процесом.
          </p>
        </div>
      </div>

      <div className="auth-content">
        {tab === "about" && <About />}

        {/* 🔥 ТУТ НОВИЙ КОМПОНЕНТ */}
        {tab === "features" && <Features />}
      </div>
    </div>
  );
}
