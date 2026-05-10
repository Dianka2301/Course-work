import "./Auth.css";

import fryingPan from "../../images/frying_pan.jpg";
import feature1 from "../../images/feature-1.jpg";
import feature2 from "../../images/feature-2.jpg";
import feature3 from "../../images/feature-3.jpg";
import feature from "../../images/feature.png";

export default function About() {
  return (
    <div className="about-container">
      {/* 🔥 INTRO */}
      <div className="intro-section">
        <h1>Про наш кулінарний простір</h1>

        <p className="intro-text">
          Ми створили платформу для тих, хто любить домашню кухню, нові
          поєднання смаків та прості рецепти, які реально хочеться готувати.
        </p>

        <img src={fryingPan} alt="food" className="intro-image" />
      </div>

      {/* 🔹 SECTION 1 */}
      <div className="about-block">
        <div>
          <h2>Рецепти для будь-якого дня</h2>

          <p>
            Від швидких сніданків до атмосферних вечерь — ми збираємо рецепти,
            які підходять як для буднів, так і для особливих моментів.
          </p>
        </div>

        <img src={feature1} alt="feature" className="feature-image" />
      </div>

      {/* 🔹 SECTION 2 */}
      <div className="about-block reverse">
        <div>
          <h2>Готування без складнощів</h2>

          <p>
            Покрокові інструкції, зрозумілі інгредієнти та зручна структура
            допоможуть готувати легко навіть новачкам.
          </p>
        </div>
        <img src={feature2} alt="feature" className="feature-image" />
      </div>

      {/* 🔹 SECTION 3 */}
      <div className="about-block">
        <div>
          <h2>Збережи свої улюблені страви</h2>

          <p>
            Створюй власну колекцію рецептів, повертайся до улюблених смаків та
            організовуй меню так, як зручно саме тобі.
          </p>
        </div>

        <img src={feature3} alt="feature" className="feature-image" />
      </div>

      {/* 🔹 SECTION 4 */}
      <div className="about-block">
        <div>
          <h2>Відкривай нові кухні світу</h2>

          <p>
            Італійська паста, азійські страви, домашня випічка чи легкі салати —
            знаходь нові ідеї та пробуй щось нове щотижня.
          </p>
        </div>

        <img src={feature} alt="recipes" className="feature-image" />
      </div>

      {/* 🔹 FINAL */}
      <div className="final-section">
        <h2>Чому користувачі обирають нас</h2>

        <div className="cards-grid">
          {[
            {
              title: "Зручно",
              text: "Усі рецепти структуровані та легко знаходяться через пошук і категорії.",
            },
            {
              title: "Сучасно",
              text: "Мінімалістичний дизайн і комфортний інтерфейс для щоденного використання.",
            },
            {
              title: "Натхненно",
              text: "Щодня нові ідеї для страв, які хочеться спробувати вдома.",
            },
          ].map((item, i) => (
            <div key={i} className="info-card">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
