import { useState } from "react";
import AuthForm from "./AuthForm.jsx";
import "./Auth.css";
import About from "./About.jsx";
import Features from "./Features.jsx"; // 🔥 ДОДАЛИ

export default function AuthPage({ onLogin, onOpenAuth, isModal }) {
  const [tab, setTab] = useState("about");
  const [mode, setMode] = useState("login");

  // 🔥 MODAL
  if (isModal) {
    return (
      <div className="modal-inner">
        <div className="auth-title">Flavoria Recipe App</div>

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
        <div className="logo">Flavoria</div>

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

      <div className="auth-content">
        {tab === "about" && <About />}

        {/* 🔥 ТУТ НОВИЙ КОМПОНЕНТ */}
        {tab === "features" && <Features />}
      </div>
    </div>
  );
}
