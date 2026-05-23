import { useEffect, useState } from "react";
import { updateProfile } from "../../api/user.js";
import AvatarCropper from "./AvatarCropper.jsx";

export default function Profile({ user, setUser }) {
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [email, setEmail] = useState(user.email || "");
  const [bio, setBio] = useState(user.bio || ""); // Стан для біографії

  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [cropImage, setCropImage] = useState(null);
  const [toast, setToast] = useState(null);

  const getToken = () => localStorage.getItem("token");

  /* ---------------- TOAST ---------------- */
  useEffect(() => {
    if (!toast) return;

    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Слідкуємо за зміною користувача ззовні
  useEffect(() => {
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setEmail(user.email || "");
    setBio(user.bio || "");
  }, [user]);

  /* ---------------- СВІЖИЙ ЗАПИТ З БЕКЕНДУ ПРИ МОНТУВАННІ ---------------- */
  useEffect(() => {
    const fetchFreshProfile = async () => {
      try {
        const token = getToken();
        if (!token) return;

        // Робимо запит до вашого GET роутера profile.cjs
        const res = await fetch("http://localhost:4000/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const freshData = await res.json();
          // Оновлюємо стани свіжими даними з БД
          setUser(freshData);
          setBio(freshData.bio || "");
          localStorage.setItem("user", JSON.stringify(freshData));
        }
      } catch (err) {
        console.error("Не вдалося завантажити свіжий профіль:", err);
      }
    };

    fetchFreshProfile();
  }, []);

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
    formData.append("bio", bio); // Додаємо біо в запит

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    try {
      const res = await updateProfile(formData, getToken());

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
            alt="avatar"
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

        <div className="form-field">
          <label>Ім'я</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Ваше ім'я"
          />
        </div>

        <div className="form-field">
          <label>Прізвище</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Ваше прізвище"
          />
        </div>

        <div className="form-field">
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ваш email"
          />
        </div>

        <div className="form-field">
          <label>Про себе (Біографія)</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Розкажіть трохи про себе..."
            className="bio-textarea"
            rows={4}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              resize: "vertical",
            }}
          />
        </div>

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
