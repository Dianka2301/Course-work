// frontend/src/components/Auth/AuthPage.jsx

import { useState } from "react";
import AuthForm from "./AuthForm.jsx";
import "./Auth.css";

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Заголовок застосунку */}
        <div className="auth-title">Flavoria Recipe App</div>

        {/* Вкладки авторизації */}
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
            Зареєструватися
          </button>
        </div>

        {/* Форма */}
        <AuthForm mode={mode} onLogin={onLogin} />
      </div>
    </div>
  );
}
