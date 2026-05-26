import { useState } from "react";
import AuthForm from "./AuthForm.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import "./Auth.css";

export default function AuthPage({ onLogin, onOpenAuth, isModal }) {
  const [authMode, setAuthMode] = useState("welcome"); // "welcome" | "login" | "register"


  if (isModal) {
    return (
      <div className="modal-inner">
        <div className="auth-title">Food Recipe App</div>
        <div className="auth-tabs">
          <button
            className={authMode === "login" ? "active" : ""}
            onClick={() => setAuthMode("login")}
          >
            Увійти
          </button>
          <button
            className={authMode === "register" ? "active" : ""}
            onClick={() => setAuthMode("register")}
          >
            Реєстрація
          </button>
        </div>
        <div className="auth-switch-wrapper">
          <AuthForm
            mode={authMode === "register" ? "register" : "login"}
            onLogin={onLogin}
          />
        </div>
      </div>
    );
  }


  return (
    <div className="landing-wrapper">

      <div className="landing-left">
        <div className="landing-left-content">
          <div className="logo-app">Food Recipe App</div>

          <div className="feature-card-item">
            <h3>ШІ-генерація та модерація</h3>
            <p>
              Створюйте унікальні страви за допомогою нашого ШІ-генератора за
              наявними продуктами. Всі рецепти проходять швидку ШІ-перевірку
              перед публікацією.
            </p>
          </div>

          <div className="feature-card-item">
            <h3>Модерація та адміністрування</h3>
            <p>
              Власна книга рецептів користувачів. Адміністратор приймає
              остаточне рішення щодо публікації рецепту у загальний каталог
              платформи.
            </p>
          </div>

          <div className="feature-card-item">
            <h3>Взаємодія, рейтинг та обране</h3>
            <p>
              Спілкуйтеся у коментарях, відповідайте на відгуки, ставте оцінки
              та фільтруйте кулінарні коментарі за допомогою ШІ. Додавайте
              улюблене у свій список.
            </p>
          </div>

          <div className="landing-footer-text">
            © 2026 Food Recipe App Team. Усі права захищені.
          </div>
        </div>
      </div>

   
      <div className="landing-right">
        <div className="landing-right-content">
          {authMode === "welcome" && (
            <div className="welcome-section">
              <h1 className="welcome-title-dark">
                Готуй <span className="orange-highlight">розумніше</span>,<br />
                а не складніше
              </h1>

              <p className="welcome-desc-dark">
                Перетворіть рутинне готування на задоволення. Довірте штучному
                інтелекту пошук ідеальних страв, а собі залиште найсмачніше —
                магію кулінарії!
              </p>

              <div className="welcome-buttons">
                <button
                  className="btn-orange-solid"
                  onClick={() => setAuthMode("login")}
                >
                  Увійти
                </button>
                <button
                  className="btn-white-link"
                  onClick={() => setAuthMode("register")}
                >
                  Реєстрація →
                </button>
              </div>
            </div>
          )}

          {authMode === "login" && (
            <div className="form-slide">
              <button
                className="back-to-welcome-btn"
                onClick={() => setAuthMode("welcome")}
              >
                ← Назад
              </button>
              <h2 className="form-slide-title">Вхід в акаунт</h2>
              <AuthForm mode="login" onLogin={onLogin} />
            </div>
          )}

          {authMode === "register" && (
            <div className="form-slide">
              <button
                className="back-to-welcome-btn"
                onClick={() => setAuthMode("welcome")}
              >
                ← Назад
              </button>
              <h2 className="form-slide-title">Реєстрація акаунта</h2>
              <AuthForm mode="register" onLogin={onLogin} />
            </div>
          )}
        </div>
      </div>

   
      <ForgotPassword />
    </div>
  );
}
