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
        <h1>Кулінарний простір для рецептів, ідей і спільноти</h1>

        <p className="intro-text">
          Food Recipe App допомагає знаходити страви під настрій, зберігати
          улюблене, створювати власні рецепти й ділитися ними після модерації.
          Це не просто каталог, а зручний робочий простір для щоденного
          готування.
        </p>

        <img src={fryingPan} alt="food" className="intro-image" />
      </div>

      {/* 🔹 SECTION 1 */}
      <div className="about-block">
        <div>
          <h2>Каталог, який легко сканувати</h2>

          <p>
            Категорії, пошук, сортування, час приготування, складність і автор
            допомагають швидко зрозуміти, чи підходить страва саме зараз.
          </p>
        </div>

        <img src={feature1} alt="feature" className="feature-image" />
      </div>

      {/* 🔹 SECTION 2 */}
      <div className="about-block reverse">
        <div>
          <h2>Власний записник рецептів</h2>

          <p>
            Додавайте фото, опис, інгредієнти, порції, час і кроки. Якщо
            рецепт готовий для інших користувачів, надішліть його на
            публікацію адміну.
          </p>
        </div>
        <img src={feature2} alt="feature" className="feature-image" />
      </div>

      {/* 🔹 SECTION 3 */}
      <div className="about-block">
        <div>
          <h2>AI-помічник для нових ідей</h2>

          <p>
            Введіть продукти, які є вдома, і генератор запропонує рецепти з
            КБЖУ, часом, порціями та складністю. Історія генерацій зберігає
            вдалі ідеї.
          </p>
        </div>

        <img src={feature3} alt="feature" className="feature-image" />
      </div>

      {/* 🔹 SECTION 4 */}
      <div className="about-block">
        <div>
          <h2>Коментарі, відповіді та сповіщення</h2>

          <p>
            Обговорюйте рецепти, відповідайте іншим користувачам і отримуйте
            сповіщення про статус публікації: очікує, схвалено або відхилено.
          </p>
        </div>

        <img src={feature} alt="recipes" className="feature-image" />
      </div>

      {/* 🔹 FINAL */}
      <div className="final-section">
        <h2>Що вже всередині</h2>

        <div className="cards-grid">
          {[
            {
              title: "Каталог і обране",
              text: "Зберігайте рецепти, повертайтесь до них і відкривайте схожі страви.",
            },
            {
              title: "Публікація з модерацією",
              text: "Рецепти користувачів проходять перевірку адміністратора та AI-аналіз.",
            },
            {
              title: "AI-генератор",
              text: "Отримуйте нові ідеї з ваших інгредієнтів і зберігайте історію генерацій.",
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
