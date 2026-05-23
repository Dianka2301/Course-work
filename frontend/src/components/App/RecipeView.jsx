import { useState, useEffect } from "react";
import {
  fetchComments,
  addComment,
  fetchRecipeDetails,
  fetchSimilarRecipes,
  publishRecipe,
} from "../../api/recipes";
import { fetchFavorites, toggleFavorite } from "../../api/favorites";

const BASE_URL = "http://localhost:4000";

function imageSrc(image) {
  if (!image) return `${BASE_URL}/images/default-avatar.jpg`;
  if (image.startsWith("http")) return image;
  return `${BASE_URL}/images/${image}`;
}

function avatarSrc(avatar) {
  if (!avatar) return `${BASE_URL}/images/default-avatar.jpg`;
  if (avatar.startsWith("http")) return avatar;
  return `${BASE_URL}/uploads/${avatar}`;
}

function parseFlags(flags) {
  try {
    return JSON.parse(flags || "[]");
  } catch {
    return [];
  }
}

// Функція перевірки чи є автор системним адміністратором
const isSystemAdmin = (name) => {
  if (!name) return true;
  const lower = name.toLowerCase().trim();
  return lower === "diana admin" || lower === "admin";
};

export default function RecipeView({
  recipe,
  user,
  onBack,
  onOpenRecipe,
  onOpenAuthorProfile,
  onAdminUpdate,
}) {
  const [details, setDetails] = useState(recipe);
  const [comments, setComments] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [activeReply, setActiveReply] = useState(null);
  const [avgRating, setAvgRating] = useState(recipe.rating || 0);
  const [publishing, setPublishing] = useState(false);
  const [smartSortComments, setSmartSortComments] = useState(false);
  const [showAiReview, setShowAiReview] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Стан для редагування адміном
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
    prep_time: "",
    portions: "",
    difficulty: "easy",
    ingredients: "",
    steps: "",
    image: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

useEffect(() => {
  loadRecipe();
  loadComments();
  loadFavoriteState();
  window.scrollTo({ top: 0, behavior: "instant" });
}, [recipe.id]);

const loadRecipe = async () => {
  try {
    const data = await fetchRecipeDetails(recipe.id);
    setDetails(data);
    setAvgRating(data.rating || 0);

    // Передаємо свіжі дані безпосередньо у функцію схожих рецептів
    loadSimilar(data);
  } catch (err) {
    console.error(err);
  }
};

  const loadComments = async () => {
    try {
      const data = await fetchComments(recipe.id);
      setComments(data);

      const rated = data.filter((c) => c.rating);
      if (rated.length > 0) {
        const avg =
          rated.reduce((sum, c) => sum + (c.rating || 0), 0) / rated.length;
        setAvgRating(avg.toFixed(1));
      } else {
        setAvgRating(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

const loadSimilar = async (freshDetails) => {
  try {
    const data = await fetchSimilarRecipes(recipe.id);

    if (!data || data.length === 0) {
      setSimilar([]);
      return;
    }

    const getIngredientWords = (ingredientsStr) => {
      if (!ingredientsStr) return [];
      return ingredientsStr
        .toLowerCase()
        .replace(/[0-9]|мл|гр|кг|ст|л|[\s,.;:!?()•-]/g, " ")
        .split(" ")
        .filter((word) => word.length > 3);
    };

    // Використовуємо свіжі дані, які ми щойно отримали з бази
    const currentIngredients =
      freshDetails?.ingredients || details?.ingredients || recipe.ingredients;
    const currentWords = getIngredientWords(currentIngredients);

    const filteredSimilar = data.filter((item) => {
      if (item.id === recipe.id) return false;

      const itemWords = getIngredientWords(item.ingredients);

      const matchesCount = currentWords.filter((word) =>
        itemWords.some(
          (itemWord) => itemWord.includes(word) || word.includes(itemWord),
        ),
      ).length;

      return matchesCount >= 3;
    });

    setSimilar(filteredSimilar);
  } catch (err) {
    console.error("Помилка фільтрації схожих рецептів за інгредієнтами:", err);
  }
};

  const loadFavoriteState = async () => {
    try {
      const data = await fetchFavorites();
      setIsFavorite(data.some((item) => (item.recipe_id || item.id) === recipe.id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const data = await toggleFavorite(recipe.id);
      setIsFavorite(data.liked);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async () => {
    if (!text.trim() || rating === 0) return;

    try {
      await addComment(recipe.id, { text, rating });
      setText("");
      setRating(0);
      loadComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReply = async (commentId) => {
    const reply = replyText[commentId]?.trim();
    if (!reply) return;

    try {
      await addComment(recipe.id, {
        text: reply,
        parentId: commentId,
      });
      setReplyText((prev) => ({ ...prev, [commentId]: "" }));
      setActiveReply(null);
      loadComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      await publishRecipe(details.id);
      setDetails((prev) => ({ ...prev, status: "pending", is_public: 0 }));
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const steps = Array.isArray(details.steps)
    ? details.steps
    : String(details.steps || "")
        .split("\n")
        .filter(Boolean);

  const commentRelevance = (comment) => {
    const text = `${comment.text || ""}`.toLowerCase();
    const recipeWords = `${details.ingredients || ""} ${details.steps || ""}`
      .toLowerCase()
      .split(/[\s,.;:!?()]+/)
      .filter((word) => word.length > 3);
    const uniqueRecipeWords = [...new Set(recipeWords)];
const kitchenWords = [
  //  Загальні кулінарні поняття 
  "інгредієнт",
  "рецепт",
  "пропорц",
  "склад",
  "смак",
  "замін",
  "альтернатив",
  "продукт",

  //  Температура, режими та обладнання 
  "температур",
  "градус",
  "духов",
  "пекти",
  "випік",
  "піч",
  "плит",
  "пательн",
  "сковор",
  "каструл",
  "деко",
  "форм",
  "блендер",
  "міксер",
  "холодильн",
  "мікрохвил",
  "пергамент",
  "фольг",
  "сито",
  "ваг",
  "мікрохвил",

  //  Процеси приготування (дієслова та дії) 
  "варити",
  "відвар",
  "смаж",
  "обсмаж",
  "запік",
  "запеч",
  "туш",
  "тушкува",
  "наріз",
  "різа",
  "шинку",
  "натир",
  "натер",
  "терк",
  "збива",
  "збити",
  "заміс",
  "заміш",
  "міси",
  "просі",
  "змаст",
  "змащ",
  "додат",
  "додас",
  "зміш",
  "переміш",
  "нагрі",
  "розігр",
  "кип",
  "закип",
  "охолод",
  "соли",
  "посоли",
  "процід",
  "настоя",
  "марину",
  "бланшу",

  //  Базові інгредієнти та основи 
  "сіль",
  "солі",
  "цукор",
  "цукр",
  "борош",
  "соус",
  "олій",
  "масл",
  "вод",
  "молок",
  "яйц",
  "яєц",
  "вершк",
  "спеці",
  "приправ",
  "перец",
  "перц",
  "часник",
  "цибул",
  "м'яс",
  "риб",
  "овоч",
  "фрукт",
  "зелен",
  "сир",
  "тіст",
  "крем",
  "шоколад",
  "пудр",
  "дріждж",
  "желатин",
  "оцет",
  "крохмал",
  "ваніл",
  "сод",

  //  Міри, час та порції 
  "хв",
  "хвил",
  "год",
  "минут",
  "порц",
  "грам",
  " літр",
  " мл",
  " склян",
  "стакан",
  "ложк",
  "чайн",
  "столов",
  " дрібк",
];

    return (
      kitchenWords.filter((word) => text.includes(word)).length * 3 +
      uniqueRecipeWords.filter((word) => text.includes(word)).length * 2 +
      (comment.rating || 0)
    );
  };

  const visibleComments = smartSortComments
    ? [...comments].sort((a, b) => commentRelevance(b) - commentRelevance(a))
    : comments;

  // Режим редагування (копіювання даних у форму)
  const handleStartEditing = () => {
    setEditForm({
      title: details.title || "",
      description: details.description || "",
      category: details.category || "Сніданки",
      prep_time: details.prep_time || "",
      portions: details.portions || "",
      difficulty: details.difficulty || "easy",
      ingredients: details.ingredients || "",
      steps: details.steps || "",
      image: details.image || "",
    });
    setImagePreview(imageSrc(details.image));
    setIsEditing(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveEdit = async () => {
    try {
      let uploadedImageUrl = editForm.image;

      if (imageFile) {
        const fd = new FormData();
        fd.append("image", imageFile);
        const res = await fetch("http://localhost:4000/api/upload", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        uploadedImageUrl = data.url;
      }

      const updatedData = {
        ...editForm,
        image: uploadedImageUrl,
      };

      if (onAdminUpdate) {
        await onAdminUpdate(details.id, updatedData);
      }

      setDetails((prev) => ({ ...prev, ...updatedData }));
      setIsEditing(false);
      setImageFile(null);
    } catch (err) {
      console.error("Failed to save edited recipe:", err);
    }
  };

  
  //  РЕЖИМ РЕДАГУВАННЯ ЯК НА ФОТО 1 
  if (isEditing) {
    return (
      <div className="admin-edit-container-new">
        <div className="recipe-form-card-new">
          <div className="edit-card-header">
            <h3>Редагування рецепту</h3>
          </div>

          <div className="recipe-form-layout-new">
            {/* Ліва колонка: прямокутне фото та кнопка */}
            <div className="form-left-col-new">
              <div className="image-preview-box-new">
                <img src={imagePreview} alt="preview" />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                id="admin-image-upload-new"
                hidden
              />
              <label
                htmlFor="admin-image-upload-new"
                className="admin-upload-btn-new"
              >
                Завантажити фото
              </label>
            </div>

            {/* Права колонка: поля введення */}
            <div className="form-right-col-new">
              <div className="form-group-new">
                <label>Назва рецепту</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  placeholder="Введіть назву"
                />
              </div>

              <div className="form-group-new">
                <label>Опис</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  placeholder="Коротко опишіть рецепт..."
                  rows={4}
                />
              </div>

              {/* Зменшений вибір категорії */}
              <div className="form-group-new">
                <label>Категорія</label>
                <select
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm({ ...editForm, category: e.target.value })
                  }
                  className="admin-category-select-new"
                >
                  <option>Сніданки</option>
                  <option>Основні страви</option>
                  <option>Супи</option>
                  <option>Салати</option>
                  <option>Паста</option>
                  <option>Закуски</option>
                  <option>Десерти</option>
                  <option>Випічка</option>
                  <option>Дієтичні страви</option>
                  <option>Напої та смузі</option>
                </select>
              </div>

              {/* Рядок: Час, Порції, Складність */}
              <div className="form-sub-row-new">
                <div className="form-group-new flex-1">
                  <label>Час</label>
                  <input
                    type="text"
                    value={editForm.prep_time}
                    onChange={(e) =>
                      setEditForm({ ...editForm, prep_time: e.target.value })
                    }
                    placeholder="15 хв"
                  />
                </div>
                <div className="form-group-new flex-1">
                  <label>Порції</label>
                  <input
                    type="number"
                    value={editForm.portions}
                    onChange={(e) =>
                      setEditForm({ ...editForm, portions: e.target.value })
                    }
                    placeholder="4"
                  />
                </div>
                <div className="form-group-new flex-1">
                  <label>Складність</label>
                  <select
                    value={editForm.difficulty}
                    onChange={(e) =>
                      setEditForm({ ...editForm, difficulty: e.target.value })
                    }
                  >
                    <option value="easy">easy</option>
                    <option value="medium">medium</option>
                    <option value="hard">hard</option>
                  </select>
                </div>
              </div>

              <div className="form-group-new">
                <label>Інгредієнти</label>
                <textarea
                  value={editForm.ingredients}
                  onChange={(e) =>
                    setEditForm({ ...editForm, ingredients: e.target.value })
                  }
                  placeholder="Інгредієнти..."
                  rows={6}
                />
              </div>

              <div className="form-group-new">
                <label>Приготування</label>
                <textarea
                  value={editForm.steps}
                  onChange={(e) =>
                    setEditForm({ ...editForm, steps: e.target.value })
                  }
                  placeholder="Приготування..."
                  rows={6}
                />
              </div>
            </div>
          </div>

          {/* Кнопки дії як на фото 1 */}
          <div className="form-actions-new">
            <button className="btn-save-new" onClick={handleSaveEdit}>
              Зберегти
            </button>
            <button
              className="btn-cancel-new"
              onClick={() => setIsEditing(false)}
            >
              Скасувати
            </button>
          </div>
        </div>
      </div>
    );
  }

  //  РЕЖИМ ПЕРЕГЛЯДУ (З ЦЕНТРУВАННЯМ ТА ЗМЕНШЕНИМ ФОТО) 
  return (
    <div className="recipe-view">
      <button className="back-btn" onClick={onBack}>
        ← Назад
      </button>

      {user?.role === "admin" && (
        <button
          className="publish-btn"
          style={{ marginLeft: "10px" }}
          onClick={handleStartEditing}
        >
          Редагувати рецепт
        </button>
      )}

      <div className="recipe-layout">
        {/* Центрація фото, назви, зірочок */}
        <div
          className="recipe-left"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <img
            src={imageSrc(details.image)}
            className="recipe-view-img"
            alt={details.title}
            style={{
              maxWidth: "160px",
              height: "auto",
              margin: "0 auto",
              display: "block",
              borderRadius: "12px",
            }} // Зменшено головне фото
          />

          {user?.role !== "admin" && (
            <button
              className="fav-btn bookmark-btn heart-btn recipe-view-fav-btn"
              onClick={handleToggleFavorite}
            >
              {isFavorite ? "❤️" : "🤍"}
            </button>
          )}

          {/* Назва по центру */}
          <h2
            className="recipe-title"
            style={{
              width: "100%",
              marginTop: "15px",
              marginBottom: "5px",
            }}
          >
            {details.title}
          </h2>

          {details.authorName && !isSystemAdmin(details.authorName) && (
            <div
              className="recipe-author"
              style={{
                textAlign: "center",
                width: "100%",
                marginBottom: "10px",
              }}
            >
              Автор:{" "}
              <b
                onClick={() => onOpenAuthorProfile?.(details.user_id)}
                style={{ cursor: "pointer", textDecoration: "underline" }}
              >
                {details.authorName}
              </b>
            </div>
          )}

          {details.user_id === user?.id &&
            details.status !== "pending" &&
            details.status !== "approved" && (
              <button
                className="publish-btn small-action"
                onClick={handlePublish}
                disabled={publishing}
              >
                {publishing ? "Надсилання..." : "Опублікувати"}
              </button>
            )}

          {details.user_id === user?.id && details.status === "pending" && (
            <div className="recipe-status-badge">Очікує схвалення адміна</div>
          )}

          {/* Рейтинг по центру із зірочками */}

          {/* Властивості по центру */}
          <div
            className="recipe-meta-grid"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "15px",
              width: "100%",
            }}
          >
            <span>
              <img src="/images/time.png" alt="" />
              {details.prep_time || "Час не вказано"}
            </span>
            <span>
              <img src="/images/portion.png" alt="" />
              {details.portions
                ? `${details.portions} порц.`
                : "Порції не вказано"}
            </span>
            <span>
              <img src="/images/cookware.png" alt="" />
              {details.difficulty || "easy"}
            </span>
          </div>
          {Number(avgRating) > 0 && (
            <div
              className="rating-box"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                marginTop: "5px",
                marginBottom: "15px",
              }}
            >
              <div
                className="stars"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "2px",
                }}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="star">
                    {star <= Math.round(avgRating) ? "★" : "☆"}
                  </span>
                ))}
              </div>
              <div
                className="avg-rating"
                style={{ textAlign: "center", marginTop: "4px" }}
              >
                <h4>
                  Рейтинг: <b>{avgRating}/5</b>
                </h4>
              </div>
            </div>
          )}
        </div>

        <div className="recipe-right">
          {details.description && (
            <div className="section">
              <h4>Опис</h4>
              <p>{details.description}</p>
            </div>
          )}

          <div className="section">
            <h4>Інгредієнти</h4>
            {details.ingredients
              ?.split("\n")
              .filter((i) => i.trim() !== "")
              .map((i, idx) => (
                <div key={idx} className="ingredient-item">
                  • {i.trim()}
                </div>
              ))}
          </div>

          <div className="section">
            <h4>Кроки</h4>
            <ol className="recipe-steps-list">
              {steps.map((step, idx) => (
                <li key={idx}>{step.replace(/^\d+\.\s*/, "")}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {details.ai_review && (
        <div className="public-ai-review">
          <button onClick={() => setShowAiReview((prev) => !prev)}>
            {showAiReview ? "Згорнути ШІ-аналіз" : "Розгорнути ШІ-аналіз"}
          </button>
          {showAiReview && (
            <div className="public-ai-review-body">
              {details.ai_score && (
                <strong>ШІ оцінка: {details.ai_score}/5</strong>
              )}
              <p>{details.ai_review}</p>
              {details.ai_flags && (
                <div className="ai-flags">
                  {parseFlags(details.ai_flags).map((flag, index) => (
                    <span key={index}>{flag}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {similar.length > 0 && (
        <div className="similar-recipes">
          <h4>Схожі рецепти</h4>
          <div className="similar-grid">
            {similar.map((item) => (
              <button
                key={item.id}
                className="similar-card"
                onClick={() => onOpenRecipe?.(item)}
              >
                <img src={imageSrc(item.image)} alt={item.title} />
                <span>{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="comments">
        <div className="comments-head">
          <h4>Коментарі</h4>
          <button
            data-tooltip="Фільтр коментарів — це функція, яка надає можливість відсортувати відгуки користувачів за допомогою кулінарних маркерів (інгредієнтів, температури, часу чи порцій) і підтягнути на самий верх найбільш конструктивні та корисні коментарі, що безпосередньо стосуються процесу приготування."
            className={
              smartSortComments
                ? "ai-comment-filter active"
                : "ai-comment-filter"
            }
            onClick={() => setSmartSortComments((prev) => !prev)}
          >
            Фільтр коментарів
          </button>
        </div>

        <div className="comment-list">
          {visibleComments.map((c) => (
            <div key={c.id} className="comment">
              <div className="comment-top">
                <img
                  src={avatarSrc(c.avatar)}
                  alt="avatar"
                  className="comment-avatar"
                />
                <div className="comment-info">
                  <div className="comment-header">
                    <b>{c.userName}</b>
                    <span className="comment-date">
                      {formatDate(c.created_at)}
                    </span>
                  </div>
                  <div className="comment-text">{c.text}</div>
                </div>
              </div>

              {c.rating && (
                <div className="comment-stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s}>{s <= c.rating ? "★" : "☆"}</span>
                  ))}
                </div>
              )}

              <button
                className="reply-toggle"
                onClick={() =>
                  setActiveReply(activeReply === c.id ? null : c.id)
                }
              >
                Відповісти
              </button>

              {activeReply === c.id && (
                <div className="reply-box">
                  <input
                    value={replyText[c.id] || ""}
                    onChange={(e) =>
                      setReplyText((prev) => ({
                        ...prev,
                        [c.id]: e.target.value,
                      }))
                    }
                    placeholder="Написати відповідь..."
                  />
                  <button
                    onClick={() => handleAddReply(c.id)}
                    className="send-btn-icon-only"
                  >
                    <img src="/images/send.png" alt="send" />
                  </button>
                </div>
              )}

              {c.replies?.length > 0 && (
                <div className="reply-list">
                  {c.replies.map((reply) => (
                    <div key={reply.id} className="reply">
                      <div className="comment-top">
                        <img
                          src={avatarSrc(reply.avatar)}
                          alt="avatar"
                          className="comment-avatar"
                        />
                        <div className="comment-info">
                          <div className="comment-header">
                            <b>{reply.userName}</b>
                            <span className="comment-date">
                              {formatDate(reply.created_at)}
                            </span>
                          </div>
                          <div className="comment-text">{reply.text}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="comment-box">
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(null)}
                className="star"
              >
                {star <= (hover || rating) ? "★" : "☆"}
              </span>
            ))}
          </div>

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Написати коментар..."
          />

          <button onClick={handleAddComment} className="send-btn-icon-only">
            <img src="/images/send.png" alt="send" />
          </button>
        </div>
      </div>
    </div>
  );
}
