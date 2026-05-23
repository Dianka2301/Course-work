import { useEffect, useState } from "react";
import { forgotPassword, resetPassword } from "../../api/auth";

export default function ForgotPassword() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const open = () => setIsOpen(true);
    window.addEventListener("openForgotPassword", open);
    return () => {
      window.removeEventListener("openForgotPassword", open);
    };
  }, []);

  const closeModal = () => {
    setIsOpen(false);
    setStep(1);
    setEmail("");
    setCode("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
    setShowPassword(false);
    setShowConfirm(false);
    setLoading(false);
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      if (res.error) {
        setError(res.error);
      } else {
        setStep(2);
        setSuccess("Код надіслано на email");
      }
    } catch {
      setError("Помилка сервера");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 4) {
      setError("Пароль має містити мінімум 4 символи");
      return;
    }

    if (password !== confirmPassword) {
      setError("Паролі не співпадають");
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword(email, code, password);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess("Пароль успішно змінено");
        setTimeout(() => {
          closeModal();
        }, 1200);
      }
    } catch {
      setError("Помилка сервера");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="forgot-overlay" onClick={closeModal}>
      <div className="forgot-modal" onClick={(e) => e.stopPropagation()}>
        <button className="forgot-close" onClick={closeModal}>
          ✕
        </button>

        {step === 1 && (
          <>
            <h2>Відновлення пароля</h2>
            <div className="forgot-step">Крок 1 із 2: введіть email</div>
            <p className="forgot-text">
              Введіть електронну пошту, прив’язану до акаунта.
            </p>

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            <form onSubmit={handleSendCode}>
              <div className="form-field-group">
                <label>Email</label>
                <input
                  type="email"
                  className="forgot-email-input"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                className="auth-btn"
                style={{ marginTop: "15px" }}
                disabled={loading}
              >
                {loading ? "Надсилання..." : "Надіслати код"}
              </button>
            </form>

            <button className="forgot-back" onClick={closeModal}>
              Назад до входу
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Новий пароль</h2>
            <div className="forgot-step">Крок 2 із 2</div>
            <p className="forgot-text">
              Код надіслано на: <strong>{email}</strong>
            </p>

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            <form onSubmit={handleResetPassword}>
              <div className="form-field-group">
                <label>Код</label>
                <input
                  type="text"
                  className="forgot-code-input" // 🔥 додано клас
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>

              <div className="form-field-group">
                <label>Новий пароль</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="forgot-password-input" // 🔥 додано клас
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword((p) => !p)}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <div className="form-field-group">
                <label>Повтор пароля</label>
                <div className="password-wrapper">
                  <input
                    type={showConfirm ? "text" : "password"}
                    className="forgot-confirm-input" // 🔥 додано клас
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirm((p) => !p)}
                  >
                    {showConfirm ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <button
                className="auth-btn"
                style={{ marginTop: "15px" }}
                disabled={loading}
              >
                {loading ? "Зміна..." : "Змінити пароль"}
              </button>
            </form>

            <button className="forgot-back" onClick={() => setStep(1)}>
              Назад
            </button>

            <button className="forgot-resend" onClick={handleSendCode}>
              Надіслати код повторно
            </button>
          </>
        )}
      </div>
    </div>
  );
}
