import React, { useEffect, useState } from "react";
import {
  fetchMyRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  publishRecipe,
} from "../../api/recipes";
import editIcon from "../../images/edit.png";
import deleteIcon from "../../images/delete.png";

const BASE_URL = "http://localhost:4000";

const recipeImageSrc = (image) => {
  if (!image) return `${BASE_URL}/images/placeholder.jpg`;
  if (image.startsWith("http") || image.startsWith("/")) return image;
  return `${BASE_URL}/images/${image}`;
};

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
    description: "",
    ingredients: "",
    steps: "",
    is_private: 1,
    image: "",
    category: "Сніданки",
    prep_time: "",
    portions: "",
    difficulty: "easy",
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
      description: "",
      ingredients: "",
      steps: "",
      is_private: 1,
      image: "",
      category: "Сніданки",
      prep_time: "",
      portions: "",
      difficulty: "easy",
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

  const handlePublish = async (id) => {
    try {
      await publishRecipe(id);
      showToast("Заявку на публікацію надіслано");
      fetchMyRecipes(page, limit).then((data) => setRecipes(data.data || []));
    } catch (err) {
      console.error(err);
      showToast("Не вдалося надіслати заявку");
    }
  };

  /* ------------------ EDIT ------------------ */
  const handleEdit = (r) => {
    setForm({
      title: r.title || "",
      description: r.description || "",
      ingredients: r.ingredients || "",
      steps: r.steps || "",
      is_private: r.is_private ?? 1,
      image: r.image || "",
      category: r.category || "Сніданки",
      prep_time: r.prep_time || "",
      portions: r.portions || "",
      difficulty: r.difficulty || "easy",
    });
    setEditingId(r.id);
    setPreview(recipeImageSrc(r.image));
    setShowForm(true);
  };

  return (
    <div className="my-recipes">
      {toast && <div className="toast">{toast}</div>}

      <div className="my-recipes-header">
        <h2>Мої рецепти</h2>

        <button
          className="add-btn"
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm({
              title: "",
              description: "",
              ingredients: "",
              steps: "",
              is_private: 1,
              image: "",
              category: "Сніданки",
              prep_time: "",
              portions: "",
              difficulty: "easy",
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
              <h3>Опис</h3>
              <textarea
                placeholder="Коротко опишіть рецепт..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="field">
              <h3>Категорія</h3>

              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option>Сніданки</option>
                <option>Салати</option>
                <option>Основні страви</option>
                <option>Супи</option>
                <option>Десерти</option>
                <option>Швидкі страви</option>
                <option>Вегетаріанські</option>
                <option>Національні кухні</option>
              </select>
            </div>

            <div className="recipe-form-row">
              <div className="field">
                <h3>Час</h3>
                <input
                  placeholder="Наприклад: 30 хв"
                  value={form.prep_time}
                  onChange={(e) =>
                    setForm({ ...form, prep_time: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <h3>Порції</h3>
                <input
                  type="number"
                  min="1"
                  placeholder="2"
                  value={form.portions}
                  onChange={(e) =>
                    setForm({ ...form, portions: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <h3>Складність</h3>
                <select
                  value={form.difficulty}
                  onChange={(e) =>
                    setForm({ ...form, difficulty: e.target.value })
                  }
                >
                  <option value="easy">easy</option>
                  <option value="medium">medium</option>
                  <option value="hard">hard</option>
                </select>
              </div>
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

            {preview && (
              <img src={preview} className="preview-img" alt="preview" />
            )}
          </div>

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
        <div className="empty-state">
          <h3>Ваш записник поки порожній</h3>
          <p>Додайте перший рецепт, а потім надішліть його на публікацію.</p>
        </div>
      ) : (
        <div className="recipes-grid">
          {recipes.map((r) => (
            <div key={r.id} className="recipe-card catalog-card my-recipe-card">
              {/* IMAGE WRAP (аналогічно до каталогу) */}
              <div className="recipe-card-image-wrap">
                {r.prep_time && (
                  <span className="time-chip">{r.prep_time}</span>
                )}
                <img
                  src={recipeImageSrc(r.image)}
                  className="recipe-img"
                  alt={r.title}
                />

                {/* Кнопки дій у правому кутку картинки */}
                <div className="card-actions">
                  <button
                    onClick={() => handleEdit(r)}
                    className="icon-btn edit"
                  >
                    <img src={editIcon} alt="edit" />
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="icon-btn delete"
                  >
                    <img src={deleteIcon} alt="delete" />
                  </button>
                </div>
              </div>

              {/* CARD CONTENT */}
              <div className="card-content">
                <div className="recipe-card-badges">
                  <span className="cat-badge">{r.category}</span>
                  {r.difficulty && (
                    <span className="difficulty-badge">{r.difficulty}</span>
                  )}
                  <span
                    className={`status-badge status-${r.status || "private"}`}
                  >
                    {r.status || "private"}
                  </span>
                </div>

                <h3>{r.title}</h3>

                {/* INGREDIENT CHIPS */}
                <div className="ingredients-wrapper">
                  {r.ingredients
                    ?.split("\n")
                    .filter((item) => item.trim() !== "")
                    .slice(0, 4)
                    .map((item, index) => (
                      <span key={index} className="ingredient-tag">
                        {item.trim()}
                      </span>
                    ))}
                </div>

                {r.status !== "pending" && r.status !== "approved" && (
                  <button
                    className="publish-btn"
                    onClick={() => handlePublish(r.id)}
                    style={{ marginTop: "12px", width: "100%" }}
                  >
                    Опублікувати
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
