/* ===== Конструктор «Свой дизайн» ===== */

(function () {
  const form = document.querySelector("[data-constructor-form]");
  if (!form) return;

  const previewBox = document.querySelector("[data-preview]");
  const garment = document.querySelector("[data-garment]");
  const previewText = document.querySelector("[data-preview-text]");
  const priceEl = document.querySelector("[data-con-price]");
  const textInput = document.querySelector("[data-text-input]");

  const state = {
    model: "Футболка",
    price: 2490,
    baseColor: "#171717",
    textColor: "#ffffff",
    text: "DROP LAB",
  };

  /* Простые макеты вещей (силуэты) — меняются вместе с выбором модели.
     Возвращают набор <path>/<rect>, заливка берётся из CSS (currentColor). */
  const GARMENTS = {
    Футболка: `
      <path d="M70 28 L40 44 L28 78 L46 92 L58 80 L58 174 L142 174 L142 80 L154 92 L172 78 L160 44 L130 28
               C124 40 112 46 100 46 C88 46 76 40 70 28 Z" fill="currentColor"/>`,
    Худи: `
      <path d="M68 34 L38 50 L26 86 L44 100 L56 88 L56 178 L144 178 L144 88 L156 100 L174 86 L162 50 L132 34
               C132 50 118 60 100 60 C82 60 68 50 68 34 Z" fill="currentColor"/>
      <path d="M78 30 C84 50 116 50 122 30 C116 56 84 56 78 30 Z" fill="rgba(0,0,0,0.18)"/>
      <line x1="92" y1="58" x2="92" y2="118" stroke="rgba(0,0,0,0.18)" stroke-width="3"/>
      <line x1="108" y1="58" x2="108" y2="118" stroke="rgba(0,0,0,0.18)" stroke-width="3"/>`,
    Сумка: `
      <path d="M58 78 L142 78 L150 174 L50 174 Z" fill="currentColor"/>
      <path d="M74 78 C74 50 126 50 126 78" fill="none" stroke="currentColor" stroke-width="8"/>`,
  };

  function isLight(hex) {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 186;
  }

  function update() {
    garment.innerHTML = GARMENTS[state.model] || GARMENTS["Футболка"];
    garment.style.color = state.baseColor;
    // тонкая обводка, чтобы светлая вещь была видна на светлом фоне
    garment.style.stroke = isLight(state.baseColor) ? "rgba(0,0,0,0.15)" : "none";

    previewText.style.color = state.textColor;
    const label = state.text || "DROP LAB";
    previewText.textContent = label;
    // Умный перенос: чем длиннее надпись и чем длиннее слова — тем мельче шрифт,
    // чтобы текст всегда оставался в пределах макета вещи.
    const longestWord = label.split(/\s+/).reduce((m, w) => Math.max(m, w.length), 0);
    const metric = Math.max(label.length, longestWord * 1.6);
    let fontSize;
    if (metric <= 6) fontSize = 26;
    else if (metric <= 9) fontSize = 22;
    else if (metric <= 12) fontSize = 18;
    else if (metric <= 15) fontSize = 15;
    else fontSize = 13;
    previewText.style.fontSize = fontSize + "px";
    priceEl.textContent = formatPrice(state.price);

    previewBox.style.background = isLight(state.baseColor) ? "#ececec" : "#f5f5f5";
  }

  /* Выбор модели */
  document.querySelectorAll("[data-model] .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("[data-model] .chip").forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      state.model = chip.dataset.value;
      state.price = Number(chip.dataset.price);
      update();
    });
  });

  /* Выбор цвета вещи */
  document.querySelectorAll("[data-base-color] .swatch").forEach((sw) => {
    sw.addEventListener("click", () => {
      document.querySelectorAll("[data-base-color] .swatch").forEach((s) => s.classList.remove("is-active"));
      sw.classList.add("is-active");
      state.baseColor = sw.dataset.color;
      update();
    });
  });

  /* Выбор цвета надписи */
  document.querySelectorAll("[data-text-color] .swatch").forEach((sw) => {
    sw.addEventListener("click", () => {
      document.querySelectorAll("[data-text-color] .swatch").forEach((s) => s.classList.remove("is-active"));
      sw.classList.add("is-active");
      state.textColor = sw.dataset.color;
      update();
    });
  });

  /* Текст */
  textInput.addEventListener("input", () => {
    state.text = textInput.value;
    update();
  });

  /* В корзину */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const custom = {
      name: `${state.model} «${state.text || "DROP LAB"}»`,
      price: state.price,
      gradient: state.baseColor,
      meta: `кастом · надпись «${state.text || "DROP LAB"}»`,
      inkText: state.textColor === "#171717",
    };
    Cart.addCustom(custom);
    toast("Кастом добавлен в корзину");
  });

  update();
})();
