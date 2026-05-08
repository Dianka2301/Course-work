import { useEffect, useState } from "react";
import { updateProfile } from "../../api/user.js";
import AvatarCropper from "./AvatarCropper.jsx";

export default function Profile({ user, setUser }) {
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [email, setEmail] = useState(user.email || "");

  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [cropImage, setCropImage] = useState(null);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem("token");

  /* ---------------- TOAST ---------------- */
  useEffect(() => {
    if (!toast) return;

    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---------------- FILE SELECT ---------------- */
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (!allowed.includes(file.type)) {
      setToast("❌ Дозволено тільки JPG, PNG, WEBP");
      return;
    }

    setCropImage(URL.createObjectURL(file));
    e.target.value = "";
  };

  /* ---------------- SAVE ---------------- */
  const handleSave = async () => {
    const formData = new FormData();

    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    try {
      const res = await updateProfile(formData, token);

      // 🔥 backend вже повертає FULL user
      setUser(res.user);

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      setToast("✅ Профіль оновлено");

      setPreview(null);
      setAvatarFile(null);
    } catch (err) {
      setToast("❌ Помилка оновлення профілю");
    }
  };

  /* ---------------- AVATAR (FIXED LOGIC) ---------------- */
  const avatarSrc = preview || user.avatar || "/images/default-avatar.png";

  return (
    <div className="profile-wrapper">
      {/* TOAST */}
      {toast && <div className="toast">{toast}</div>}

      {/* LEFT */}
      <div className="profile-card">
        <h3>Фото профілю</h3>

        <div className="avatar-box">
          <img
            src={avatarSrc}
            className="avatar-img"
            onError={(e) => {
              e.target.src = "/images/default-avatar.png";
            }}
          />

          <label className="upload-btn">
            Завантажити
            <input type="file" onChange={handleFile} hidden />
          </label>
        </div>
      </div>

      {/* RIGHT */}
      <div className="profile-form-card">
        <h3>Редагування профілю</h3>

        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <input value={lastName} onChange={(e) => setLastName(e.target.value)} />

        <input value={email} onChange={(e) => setEmail(e.target.value)} />

        <button className="save-btn" onClick={handleSave}>
          Зберегти
        </button>
      </div>

      {/* CROPPER */}
      {cropImage && (
        <AvatarCropper
          image={cropImage}
          onCancel={() => setCropImage(null)}
          onSave={(file) => {
            setAvatarFile(file);
            setPreview(URL.createObjectURL(file));
            setCropImage(null);
          }}
        />
      )}
    </div>
  );
}
