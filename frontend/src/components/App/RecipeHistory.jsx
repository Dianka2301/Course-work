import React, { useEffect, useState } from "react";
import {
  fetchMyRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from "../../api/recipes";
import editIcon from "../../images/edit.png";
import deleteIcon from "../../images/delete.png";
import plusIcon from "../../images/plus.png";

export default function RecipeHistory() {
  const [recipes, setRecipes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [page, setPage] = useState(1);
  const limit = 6;

  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [form, setForm] = useState({
    title: "",
    ingredients: "",
    steps: "",
    is_private: 1,
    image: "",
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  /* ------------------ LOAD ------------------ */
  useEffect(() => {
    setLoading(true);

    fetchMyRecipes(page, limit)
      .then((data) => setRecipes(data.data || []))
      .catch(() => showToast("Помилка завантаження"))
      .finally(() => setLoading(false));
  }, [page]);

  /* ------------------ IMAGE ------------------ */
  const handleImage = (file) => {
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!imageFile) return "";

    const fd = new FormData();
    fd.append("image", imageFile);

    const res = await fetch("http://localhost:4000/api/upload", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    return data.url;
  };

  /* ------------------ SAVE ------------------ */
  const handleSubmit = async () => {
    if (!form.title.trim()) return;

    const imageUrl = await uploadImage();

    const payload = {
      ...form,
      image: imageUrl || form.image,
    };

    showToast(editingId ? "Оновлення..." : "Створення...");

    if (editingId) {
      await updateRecipe(editingId, payload);
    } else {
      await createRecipe(payload);
    }

    fetchMyRecipes(page, limit).then((data) => setRecipes(data.data || []));

    setForm({
      title: "",
      ingredients: "",
      steps: "",
      is_private: 1,
      image: "",
    });

    setImageFile(null);
    setPreview("");
    setEditingId(null);
    setShowForm(false);

    showToast(editingId ? "Оновлено!" : "Створено!");
  };

  /* ------------------ DELETE ------------------ */
  const handleDelete = async (id) => {
    setRecipes(recipes.filter((r) => r.id !== id));
    await deleteRecipe(id);
    showToast("Видалено");
  };

  /* ------------------ EDIT ------------------ */
  const handleEdit = (r) => {
    setForm(r);
    setEditingId(r.id);
    setPreview(r.image || "");
    setShowForm(true);
  };

  const togglePrivate = () => {
    setForm((prev) => ({
      ...prev,
      is_private: prev.is_private ? 0 : 1,
    }));
  };

  return (
    <div className="my-recipes">
      {toast && <div className="toast">{toast}</div>}

      <div className="my-recipes-header">
        <h2> Мої рецепти</h2>

        <button
          className="add-btn"
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm({
              title: "",
              ingredients: "",
              steps: "",
              is_private: 1,
              image: "",
            });
            setPreview("");
            setImageFile(null);
          }}
        >
          <span className="plus-symbol">+</span>
          Додати рецепт
        </button>
      </div>

      {showForm && (
        <div className="recipe-form">
          <div className="form-fields">
            <div className="field">
              <h3>Назва рецепту</h3>
              <input
                placeholder="Введіть назву"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="field">
              <h3>Інгредієнти</h3>
              <textarea
                placeholder="Наприклад: яйця, молоко..."
                value={form.ingredients}
                onChange={(e) =>
                  setForm({ ...form, ingredients: e.target.value })
                }
              />
            </div>

            <div className="field">
              <h3>Приготування</h3>
              <textarea
                placeholder="Опишіть кроки приготування..."
                value={form.steps}
                onChange={(e) => setForm({ ...form, steps: e.target.value })}
              />
            </div>
          </div>

          <div className="upload-box">
            <input
              id="recipe-image"
              type="file"
              accept="image/*"
              onChange={(e) => handleImage(e.target.files[0])}
              hidden
            />

            <label htmlFor="recipe-image" className="upload-btn">
              Завантажити фото
            </label>

            {preview && <img src={preview} className="preview-img" />}
          </div>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.is_private === 1}
              onChange={togglePrivate}
            />
            Приватний рецепт (тільки мій записник)
          </label>

          <div className="form-actions">
            <button onClick={handleSubmit}>
              {editingId ? "Зберегти" : "Додати"}
            </button>
            <button onClick={() => setShowForm(false)}>Скасувати</button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : recipes.length === 0 ? (
        <p className="empty">Немає рецептів ✨</p>
      ) : (
        <div className="recipes-grid">
          {recipes.map((r) => (
            <div key={r.id} className="recipe-card new">
              {/* IMAGE */}
              <div className="image-wrap">
                <img
                  src={r.image || "/images/placeholder.jpg"}
                  className="recipe-img"
                />

                {/* ACTION BUTTONS */}
                <div className="card-actions">
                  <button onClick={() => handleEdit(r)} className="icon-btn">
                    <img src={editIcon} alt="edit" />
                  </button>

                  <button
                    onClick={() => handleDelete(r.id)}
                    className="icon-btn"
                  >
                    <img src={deleteIcon} alt="delete" />
                  </button>
                </div>
              </div>

              {/* TITLE */}
              <h3 className="recipe-title">{r.title}</h3>

              {/* INGREDIENT CHIPS */}
              <div className="chips">
                {r.ingredients
                  ?.split(",")
                  .slice(0, 5)
                  .map((ing, i) => (
                    <span key={i} className="chip">
                      {ing.trim()}
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
