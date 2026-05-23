const fs = require("fs");
const path = require("path");
const request = require("supertest");
const jwt = require("jsonwebtoken");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_secret";
process.env.DATABASE_PATH = path.join(__dirname, "test-database.db");

if (fs.existsSync(process.env.DATABASE_PATH)) {
  fs.unlinkSync(process.env.DATABASE_PATH);
}

const app = require("../server.cjs");
const db = require("../db.cjs");

const tokenFor = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

const createUser = (overrides = {}) => {
  const user = {
    email: `user-${Date.now()}-${Math.random()}@test.local`,
    password: "password123",
    first_name: "Test",
    last_name: "User",
    bio: "",
    role: "user",
    ...overrides,
  };

  const result = db
    .prepare(
      "INSERT INTO users (email, password, first_name, last_name, bio, role) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .run(
      user.email,
      user.password,
      user.first_name,
      user.last_name,
      user.bio,
      user.role,
    );

  return { ...user, id: result.lastInsertRowid };
};

const createRecipe = (overrides = {}) => {
  const recipe = {
    title: "Тестовий рецепт",
    description: "Опис тестового рецепта",
    ingredients: "борошно\nмолоко\nяйце",
    steps: "Змішати\nПриготувати",
    portions: 2,
    prep_time: "20 хв",
    difficulty: "easy",
    image: "test.jpg",
    category: "Сніданки",
    is_public: 1,
    user_id: 1,
    status: "approved",
    ...overrides,
  };

  const result = db
    .prepare(
      `INSERT INTO recipes (
        title, description, ingredients, steps, portions, prep_time, difficulty,
        image, category, is_public, user_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      recipe.title,
      recipe.description,
      recipe.ingredients,
      recipe.steps,
      recipe.portions,
      recipe.prep_time,
      recipe.difficulty,
      recipe.image,
      recipe.category,
      recipe.is_public,
      recipe.user_id,
      recipe.status,
    );

  return { ...recipe, id: result.lastInsertRowid };
};

beforeEach(() => {
  db.prepare("DELETE FROM notifications").run();
  db.prepare("DELETE FROM ratings").run();
  db.prepare("DELETE FROM comments").run();
  db.prepare("DELETE FROM favorites").run();
  db.prepare("DELETE FROM recipes").run();
  db.prepare("DELETE FROM users WHERE email != ?").run("magocka.diana.lubin@gmail.com");
});

afterAll(() => {
  db.close();
  if (fs.existsSync(process.env.DATABASE_PATH)) {
    fs.unlinkSync(process.env.DATABASE_PATH);
  }
});

describe("Backend integration tests", () => {
  test("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  test("POST /api/auth/register creates a user and returns token", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "new-user@test.local",
      password: "password123",
      firstName: "New",
      lastName: "User",
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({
      email: "new-user@test.local",
      firstName: "New",
      lastName: "User",
      role: "user",
    });
  });

  test("GET /api/profile requires authorization and returns current profile", async () => {
    const unauthorized = await request(app).get("/api/profile");
    expect(unauthorized.status).toBe(401);

    const user = createUser({ bio: "Люблю готувати пасту" });
    const res = await request(app)
      .get("/api/profile")
      .set("Authorization", `Bearer ${tokenFor(user)}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      bio: "Люблю готувати пасту",
      role: "user",
    });
  });

  test("POST /api/my-recipes creates private recipe for authenticated user", async () => {
    const user = createUser();
    const res = await request(app)
      .post("/api/my-recipes")
      .set("Authorization", `Bearer ${tokenFor(user)}`)
      .send({
        title: "Мої сирники",
        description: "Домашній рецепт",
        ingredients: "сир\nяйце\nборошно",
        steps: "Змішати\nПосмажити",
        is_private: 1,
        category: "Сніданки",
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      title: "Мої сирники",
      status: "private",
      is_public: 0,
      is_private: 1,
    });
  });

  test("GET /api/recipes returns only public approved recipes", async () => {
    const user = createUser();
    createRecipe({ title: "Публічний рецепт", user_id: user.id });
    createRecipe({
      title: "Приватний рецепт",
      user_id: user.id,
      is_public: 0,
      status: "private",
    });
    createRecipe({
      title: "Очікує модерації",
      user_id: user.id,
      is_public: 0,
      status: "pending",
    });

    const res = await request(app).get("/api/recipes");

    expect(res.status).toBe(200);
    expect(res.body.map((recipe) => recipe.title)).toEqual(["Публічний рецепт"]);
  });

  test("GET /api/recipes/:id/similar returns recipes with at least two shared ingredients", async () => {
    const user = createUser();
    const source = createRecipe({
      title: "Джерело",
      user_id: user.id,
      ingredients: "борошно\nмолоко\nяйце\nцукор",
    });
    createRecipe({
      title: "Схожий рецепт",
      user_id: user.id,
      ingredients: "борошно\nмолоко\nмасло",
    });
    createRecipe({
      title: "Не схожий рецепт",
      user_id: user.id,
      ingredients: "рис\nморква\nцибуля",
    });

    const res = await request(app).get(`/api/recipes/${source.id}/similar`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      title: "Схожий рецепт",
      shared_count: 2,
    });
  });

  test("favorites endpoint toggles recipe in favorites", async () => {
    const user = createUser();
    const recipe = createRecipe({ user_id: user.id });

    const add = await request(app)
      .post("/api/favorites")
      .set("Authorization", `Bearer ${tokenFor(user)}`)
      .send({ recipeId: recipe.id });

    expect(add.status).toBe(200);
    expect(add.body).toEqual({ liked: true });

    const list = await request(app)
      .get("/api/favorites")
      .set("Authorization", `Bearer ${tokenFor(user)}`);

    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);
    expect(list.body[0].id).toBe(recipe.id);
  });

  test("comments endpoint creates and returns nested replies", async () => {
    const user = createUser();
    const recipe = createRecipe({ user_id: user.id });
    const token = tokenFor(user);

    await request(app)
      .post(`/api/recipes/${recipe.id}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "Дуже смачно", rating: 5 });

    const parent = db.prepare("SELECT id FROM comments WHERE recipe_id = ?").get(recipe.id);

    await request(app)
      .post(`/api/recipes/${recipe.id}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "Дякую за відгук", parentId: parent.id });

    const res = await request(app).get(`/api/recipes/${recipe.id}/comments`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].text).toBe("Дуже смачно");
    expect(res.body[0].replies).toHaveLength(1);
    expect(res.body[0].replies[0].text).toBe("Дякую за відгук");
  });

  test("POST /api/auth/login rejects wrong password and accepts valid credentials", async () => {
    const user = createUser({
      email: "login-user@test.local",
      password: "plain-password",
      first_name: "Login",
      last_name: "User",
    });

    const wrongPassword = await request(app).post("/api/auth/login").send({
      email: user.email,
      password: "wrong-password",
    });

    expect(wrongPassword.status).toBe(400);
    expect(wrongPassword.body.error).toEqual(expect.any(String));

    const validLogin = await request(app).post("/api/auth/login").send({
      email: user.email,
      password: "plain-password",
    });

    expect(validLogin.status).toBe(200);
    expect(validLogin.body.token).toEqual(expect.any(String));
    expect(validLogin.body.user).toMatchObject({
      id: user.id,
      email: user.email,
      firstName: "Login",
      lastName: "User",
      role: "user",
    });
  });

  test("PUT /api/profile updates profile fields and returns refreshed token", async () => {
    const user = createUser({
      email: "profile-update@test.local",
      first_name: "Old",
      last_name: "Name",
      bio: "Старий опис",
    });

    const res = await request(app)
      .put("/api/profile")
      .set("Authorization", `Bearer ${tokenFor(user)}`)
      .field("firstName", "Updated")
      .field("lastName", "Profile")
      .field("email", "profile-updated@test.local")
      .field("bio", "Новий опис профілю");

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({
      id: user.id,
      email: "profile-updated@test.local",
      firstName: "Updated",
      lastName: "Profile",
      bio: "Новий опис профілю",
    });

    const updatedInDb = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);
    expect(updatedInDb).toMatchObject({
      email: "profile-updated@test.local",
      first_name: "Updated",
      last_name: "Profile",
      bio: "Новий опис профілю",
    });
  });

  test("GET /api/my-recipes returns paginated recipes for authenticated user only", async () => {
    const owner = createUser({ email: "owner@test.local" });
    const otherUser = createUser({ email: "other@test.local" });

    createRecipe({ title: "Owner recipe 1", user_id: owner.id, is_public: 0, status: "private" });
    createRecipe({ title: "Owner recipe 2", user_id: owner.id, is_public: 0, status: "private" });
    createRecipe({ title: "Other recipe", user_id: otherUser.id, is_public: 0, status: "private" });

    const res = await request(app)
      .get("/api/my-recipes?page=1&limit=1")
      .set("Authorization", `Bearer ${tokenFor(owner)}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      total: 2,
      page: 1,
      limit: 1,
    });
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].user_id).toBe(owner.id);
  });

  test("POST /api/my-recipes/:id/publish moves own private recipe to pending and creates notification", async () => {
    const user = createUser();
    const recipe = createRecipe({
      user_id: user.id,
      is_public: 0,
      status: "private",
    });

    const res = await request(app)
      .post(`/api/my-recipes/${recipe.id}/publish`)
      .set("Authorization", `Bearer ${tokenFor(user)}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, status: "pending" });

    const updatedRecipe = db.prepare("SELECT status, is_public FROM recipes WHERE id = ?").get(recipe.id);
    expect(updatedRecipe).toEqual({ status: "pending", is_public: 0 });

    const notification = db
      .prepare("SELECT type, related_recipe_id FROM notifications WHERE user_id = ?")
      .get(user.id);
    expect(notification).toEqual({
      type: "recipe_pending",
      related_recipe_id: recipe.id,
    });
  });

  test("POST /api/recipes/:id/rating validates rating and updates existing user rating", async () => {
    const user = createUser();
    const recipe = createRecipe({ user_id: user.id });
    const token = tokenFor(user);

    const invalid = await request(app)
      .post(`/api/recipes/${recipe.id}/rating`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: 6 });

    expect(invalid.status).toBe(400);

    const first = await request(app)
      .post(`/api/recipes/${recipe.id}/rating`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: 4 });

    expect(first.status).toBe(200);
    expect(first.body).toMatchObject({
      success: true,
      rating: 4,
      rating_count: 1,
    });

    const second = await request(app)
      .post(`/api/recipes/${recipe.id}/rating`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: 2 });

    expect(second.status).toBe(200);
    expect(second.body).toMatchObject({
      success: true,
      rating: 2,
      rating_count: 1,
    });
  });

  test("admin can approve pending recipe and public catalog starts showing it", async () => {
    const user = createUser({ email: "pending-owner@test.local" });
    const admin = createUser({
      email: "admin@test.local",
      first_name: "Admin",
      last_name: "Tester",
      role: "admin",
    });
    const recipe = createRecipe({
      title: "Pending admin recipe",
      user_id: user.id,
      is_public: 0,
      status: "pending",
    });

    const forbidden = await request(app)
      .post(`/api/admin/recipe-requests/${recipe.id}/approve`)
      .set("Authorization", `Bearer ${tokenFor(user)}`);

    expect(forbidden.status).toBe(403);

    const approved = await request(app)
      .post(`/api/admin/recipe-requests/${recipe.id}/approve`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`);

    expect(approved.status).toBe(200);
    expect(approved.body).toEqual({ success: true, status: "approved" });

    const catalog = await request(app).get("/api/recipes");
    expect(catalog.body.map((item) => item.title)).toContain("Pending admin recipe");
  });
});
