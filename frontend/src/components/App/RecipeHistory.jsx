import React, { useEffect, useState } from "react";
import {
  fetchMyRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from "../../api/recipes";

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
      .then(setRecipes)
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

    fetchMyRecipes(page, limit).then(setRecipes);

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
        <h2>📓 Мій записник рецептів</h2>

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
          ➕ Додати рецепт
        </button>
      </div>

      {showForm && (
        <div className="recipe-form">
          <input
            placeholder="Назва"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <textarea
            placeholder="Інгредієнти"
            value={form.ingredients}
            onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
          />

          <textarea
            placeholder="Приготування"
            value={form.steps}
            onChange={(e) => setForm({ ...form, steps: e.target.value })}
          />

          <input type="file" onChange={(e) => handleImage(e.target.files[0])} />

          {preview && (
            <img src={preview} style={{ width: 120, borderRadius: 8 }} />
          )}

          <label>
            <input
              type="checkbox"
              checked={!form.is_private}
              onChange={togglePrivate}
            />
            Public recipe
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
            <div key={r.id} className="recipe-card">
              {r.image && <img src={r.image} className="card-img" />}

              <h3>{r.title}</h3>

              <p>{r.ingredients?.slice(0, 60)}...</p>

              <div className="card-actions">
                <button onClick={() => handleEdit(r)}>✏️</button>
                <button onClick={() => handleDelete(r.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          ←
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage(page + 1)}>→</button>
      </div>
    </div>
  );
}
