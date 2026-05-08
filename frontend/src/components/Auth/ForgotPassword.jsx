import { useState } from "react";
import { forgotPassword } from "../../api/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await forgotPassword(email);

      if (res.error) {
        setError(res.error);
      } else {
        setMessage("Якщо email існує — лист надіслано");
      }
    } catch (err) {
      setError("Помилка сервера");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Відновлення пароля</h2>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}

        <label>Email</label>
        <input
          type="email"
          placeholder="Введіть email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button className="auth-btn" disabled={loading}>
          {loading ? "Відправка..." : "Відновити пароль"}
        </button>

        <div style={{ marginTop: "10px" }}>
          <a href="/login">Назад до входу</a>
        </div>
      </form>
    </div>
  );
}
