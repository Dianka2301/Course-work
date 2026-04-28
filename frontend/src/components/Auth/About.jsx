import fryingPan from "../../images/frying_pan.jpg";
import feature1 from "../../images/feature-1.jpg";
import feature2 from "../../images/feature-2.jpg";
import feature3 from "../../images/feature-3.jpg";
import feature from "../../images/feature.png";
import dashboardImg from "../../images/dashboard.jpg";

export default function About() {
  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      <div
        style={{
          position: "relative",
          height: "450px",
          borderRadius: "20px",
          overflow: "hidden",
          marginBottom: "80px",
        }}
      >
        {/* 🔥 ФОН (твоя картинка) */}
        <img
          src={dashboardImg}
          alt="hero background"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* 🔥 ТЕМНИЙ ОВЕРЛЕЙ */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
          }}
        />

        {/* 🔥 ТЕКСТ ПОВЕРХ */}
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            left: "40px",
            color: "white",
            maxWidth: "700px",
          }}
        >
          <h1 style={{ fontSize: "48px", marginBottom: "10px" }}>
            Щастя народжується в страві
          </h1>

          <p style={{ fontSize: "18px", opacity: 0.9 }}>
            Flavoria — це місце, де кулінарія стає досвідом, а не просто
            процесом.
          </p>
        </div>
      </div>
      {/* 🔥 HERO */}
      <div style={{ textAlign: "center", marginBottom: "80px" }}>
        <h1 style={{ marginBottom: "20px" }}>Що таке Flavoria?</h1>

        <p
          style={{
            fontSize: "18px",
            color: "#555",
            marginBottom: "30px",
            lineHeight: "1.6",
          }}
        >
          Flavoria — це кулінарний простір, де приготування їжі стає не рутиною,
          а досвідом, що надихає, заспокоює і приносить задоволення щодня.
        </p>

        <img
          src={fryingPan}
          alt="food"
          style={{
            width: "100%", // займає всю ширину контейнера
            maxWidth: "950px", // трохи більша і “вагоміша”
            borderRadius: "24px", // більш сучасне заокруглення
            objectFit: "cover",
            boxShadow: "0 10px 30px rgba(0,0,0,0.12)", // легка глибина
          }}
        />
      </div>

      {/* 🔹 МІСІЯ */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "40px",
          marginBottom: "80px",
        }}
      >
        <div>
          <h2 style={{ marginBottom: "15px" }}>Наша місія</h2>
          <p style={{ fontSize: "16px", color: "#555" }}>
            Формувати нову кулінарну культуру, яка допомагає людям отримувати
            задоволення від процесу приготування їжі та покращувати якість життя
            через унікальний гастрономічний досвід.
          </p>
        </div>

        <img
          src={feature1}
          style={{
            width: "450px",
            height: "auto",
            flexShrink: 0,
            borderRadius: "16px",
          }}
        />
      </div>

      {/* 🔹 ПРАВДА */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "40px",
          marginBottom: "80px",
        }}
      >
        <img
          src={feature2}
          style={{
            width: "450px",
            height: "auto",
            flexShrink: 0,
            borderRadius: "16px",
          }}
        />

        <div>
          <h2 style={{ marginBottom: "15px" }}>Наша правда</h2>
          <p style={{ fontSize: "16px", color: "#555" }}>
            Ми поєднуємо локальних шеф-кухарів, барменів та ентузіастів їжі в
            одному цифровому просторі, щоб надихати людей готувати з любов’ю та
            смаком.
          </p>
        </div>
      </div>

      {/* 🔹 ОБІЦЯНКА */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "40px",
          marginBottom: "80px",
        }}
      >
        <div>
          <h2 style={{ marginBottom: "15px" }}>Наша обіцянка</h2>
          <p style={{ fontSize: "16px", color: "#555" }}>
            Flavoria дає більше, ніж рецепти. Ми навчаємо кулінарної культури,
            ділимось лайфхаками та робимо процес приготування простішим.
          </p>
        </div>

        <img
          src={feature3}
          style={{
            width: "450px",
            height: "auto",
            flexShrink: 0,
            borderRadius: "16px",
          }}
        />
      </div>

      {/* 🔹 СВОБОДА ВИБОРУ */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "40px",
          marginBottom: "80px",
        }}
      >
        {/* 🔹 ТЕКСТ ЗЛІВА */}
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: "15px" }}>Ти сам обираєш, що готувати</h2>

          <p style={{ fontSize: "16px", color: "#555" }}>
            Понад тисяча рецептів, різні кухні світу, фільтри за складністю,
            калорійністю та способом приготування — все для твого вибору.
          </p>
        </div>

        {/* 🔹 КАРТИНКА СПРАВА */}
        <img
          src={feature}
          alt="recipes"
          style={{
            width: "450px",
            height: "auto",
            flexShrink: 0,
            borderRadius: "16px",
            objectFit: "cover",
          }}
        />
      </div>

      {/* 🔹 МАГІЯ */}
      <div style={{ textAlign: "center" }}>
        <h2 style={{ marginBottom: "30px" }}>Магія Flavoria</h2>

        <div style={{ display: "grid", gap: "15px" }}>
          {[
            {
              title: "Надихати",
              text: "Ми надихаємо тих, хто бачить у кулінарії сенс життя.",
            },
            {
              title: "Захоплювати",
              text: "Захоплюємо тих, хто каже «Готувати — не для мене».",
            },
            {
              title: "Спрощувати",
              text: "Спрощуємо життя тих, у кого кожен прийом їжі — маленький челендж.",
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "14px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <h3 style={{ color: "#a27645" }}>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
