import { useState } from "react";
import { login, register } from "../../api/auth.js";

export default function AuthForm({ mode, onLogin }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  function validate() {
    if (!email.endsWith("@gmail.com")) {
      return "Email має закінчуватися на @gmail.com";
    }

    if (!isLogin) {
      if (!firstName.trim()) return "Введіть ім’я";
      if (!lastName.trim()) return "Введіть прізвище";
      if (password.length < 4) {
        return "Пароль має містити мінімум 4 символи.";
      }
    }

    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const result = isLogin
        ? await login(email, password)
        : await register(email, password, firstName, lastName);

      onLogin(result.user, result.token);
    } catch (err) {
      setError(err.message || "Помилка авторизації.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && <div className="auth-error">{error}</div>}

      {!isLogin && (
        <div className="auth-form-row">
          <div className="form-field-group">
            <label>Ім’я</label>
            <input
              type="text"
              placeholder="Ім’я"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div className="form-field-group">
            <label>Прізвище</label>
            <input
              type="text"
              placeholder="Прізвище"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>
      )}

      <div className="form-field-group">
        <label>Email</label>
        <input
          type="email"
          className={error?.includes("Email") ? "input-error" : ""}
          placeholder="example@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="auth-hint">Лише адреси @gmail.com</div>
      </div>

      <div className="form-field-group">
        <label>Пароль</label>
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            className={error?.includes("Пароль") ? "input-error" : ""}
            placeholder="Введіть пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? "👁" : "👁"}
          </button>
        </div>
        {!isLogin && <div className="auth-hint">Мінімум 4 символи</div>}
      </div>

      {isLogin && (
        <div className="auth-links">
          <button
            type="button"
            className="forgot-link"
            onClick={() =>
              window.dispatchEvent(new Event("openForgotPassword"))
            }
          >
            Забули пароль?
          </button>
        </div>
      )}

      <button className="auth-btn" disabled={loading}>
        {loading ? "Зачекайте..." : isLogin ? "Увійти" : "Зареєструватися"}
      </button>
    </form>
  );
}
