import React, { useEffect, useState } from "react";

export default function RecipeHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // 🔹 Поки що мок-дані (бо бек ще не підключений)
    const mockData = [
      {
        id: 1,
        title: "Паста з куркою",
        date: "2026-04-18",
      },
      {
        id: 2,
        title: "Салат Цезар",
        date: "2026-04-17",
      },
      {
        id: 3,
        title: "Шоколадний торт",
        date: "2026-04-16",
      },
    ];

    setHistory(mockData);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>📜 Історія переглядів</h2>

      {history.length === 0 ? (
        <p>Історія порожня</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {history.map((item) => (
            <div
              key={item.id}
              style={{
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                background: "white",
              }}
            >
              <strong>{item.title}</strong>
              <div style={{ fontSize: "12px", color: "#777" }}>{item.date}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
