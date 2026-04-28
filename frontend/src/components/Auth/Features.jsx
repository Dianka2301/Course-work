export default function Features() {
  const items = [
    { title: "AI рецепти", text: "Генерація страв під твої інгредієнти" },
    { title: "Пошук", text: "Знайди рецепт за продуктами" },
    { title: "Обране", text: "Зберігай улюблені страви" },
    { title: "Профіль", text: "Твоя кулінарна історія" },
  ];

  return (
    <div style={{ padding: "60px 20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "40px" }}>
        Можливості платформи
      </h2>

      <div className="features-grid">
        {items.map((f, i) => (
          <div key={i} className="feature-card">
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
