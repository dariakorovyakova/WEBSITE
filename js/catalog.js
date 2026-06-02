/* ===== Каталог: фильтры, поиск, рендер, добавление в корзину ===== */

(function () {
  const grid = document.querySelector("[data-grid]");
  if (!grid) return;

  const searchInput = document.querySelector("[data-search]");
  const tagButtons = document.querySelectorAll("[data-tag]");
  const flagInputs = document.querySelectorAll("[data-flag]");
  const colorInputs = document.querySelectorAll('input[name="color"]');
  const sizeInputs = document.querySelectorAll("[data-size]");
  const priceInput = document.querySelector("[data-price]");
  const priceLabel = document.querySelector("[data-price-label]");
  const countEl = document.querySelector("[data-count]");
  const resetBtn = document.querySelector("[data-reset]");

  const state = {
    query: "",
    tags: new Set(),
    flags: new Set(),
    color: "",
    sizes: new Set(),
    price: 15000,
  };

  /* «Свой дизайн» — спец-карточка в конце списка */
  const customCard = `
    <article class="card card--custom">
      <a href="constructor.html" class="card__media" style="text-decoration:none;">
        <span>?</span>
      </a>
      <div class="card__body">
        <h3 class="card__title">Свой дизайн</h3>
        <div class="card__tags"><span class="card__tag">кастом</span></div>
        <div class="card__price">По заявке</div>
        <div class="card__footer">
          <a href="constructor.html" class="btn btn--outline btn--sm btn--block">Создать</a>
        </div>
      </div>
    </article>`;

  /* ---------- Фильтрация ---------- */
  function filtered() {
    return PRODUCTS.filter((p) => {
      if (state.query && !p.name.toLowerCase().includes(state.query)) return false;
      if (state.tags.size && ![...state.tags].every((t) => p.tags.includes(t))) return false;
      if (state.flags.size && ![...state.flags].some((f) => p.flags.includes(f))) return false;
      if (state.color && p.color !== state.color) return false;
      if (state.sizes.size && !p.sizes.some((s) => state.sizes.has(s))) return false;
      if (p.price != null && p.price > state.price) return false;
      return true;
    });
  }

  function render() {
    const items = filtered();
    if (items.length === 0) {
      grid.innerHTML = `<div class="empty"><strong>Ничего не найдено</strong>Попробуйте сбросить фильтры или изменить запрос.</div>`;
    } else {
      grid.innerHTML = items.map(renderProductCard).join("") + customCard;
    }
    countEl.textContent = `Найдено товаров: ${items.length}`;
  }

  /* ---------- События ---------- */
  searchInput.addEventListener("input", (e) => {
    state.query = e.target.value.trim().toLowerCase();
    render();
  });

  tagButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tag = btn.dataset.tag;
      if (state.tags.has(tag)) {
        state.tags.delete(tag);
        btn.classList.remove("is-active");
      } else {
        state.tags.add(tag);
        btn.classList.add("is-active");
      }
      render();
    });
  });

  flagInputs.forEach((input) => {
    input.addEventListener("change", () => {
      input.checked ? state.flags.add(input.dataset.flag) : state.flags.delete(input.dataset.flag);
      render();
    });
  });

  colorInputs.forEach((input) => {
    input.addEventListener("change", () => {
      state.color = input.value;
      render();
    });
  });

  sizeInputs.forEach((input) => {
    input.addEventListener("change", () => {
      input.checked ? state.sizes.add(input.dataset.size) : state.sizes.delete(input.dataset.size);
      render();
    });
  });

  priceInput.addEventListener("input", () => {
    state.price = Number(priceInput.value);
    priceLabel.textContent = formatPrice(state.price);
    render();
  });

  resetBtn.addEventListener("click", () => {
    state.query = "";
    state.tags.clear();
    state.flags.clear();
    state.color = "";
    state.sizes.clear();
    state.price = 15000;

    searchInput.value = "";
    tagButtons.forEach((b) => b.classList.remove("is-active"));
    flagInputs.forEach((i) => (i.checked = false));
    sizeInputs.forEach((i) => (i.checked = false));
    document.querySelector('input[name="color"][value=""]').checked = true;
    priceInput.value = 15000;
    priceLabel.textContent = "15 000 ₽";
    render();
  });

  /* Добавление в корзину (делегирование) */
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    Cart.add(btn.dataset.add);
    toast(`«${getProduct(btn.dataset.add).name}» в корзине`);
  });

  /* ---------- Мобильная панель фильтров ---------- */
  const filtersEl = document.querySelector("[data-filters]");
  const toggleBtn = document.querySelector("[data-filters-toggle]");
  if (toggleBtn && filtersEl) {
    let backdrop;
    toggleBtn.addEventListener("click", () => {
      filtersEl.classList.add("is-open");
      document.body.style.overflow = "hidden";
      if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.className = "nav-backdrop";
        backdrop.addEventListener("click", closeFilters);
        document.body.appendChild(backdrop);
      }
      backdrop.classList.add("is-open");
    });
    function closeFilters() {
      filtersEl.classList.remove("is-open");
      if (backdrop) backdrop.classList.remove("is-open");
      document.body.style.overflow = "";
    }
    // закрытие по выбору на мобиле не нужно — пользователь может ставить несколько фильтров
  }

  /* ---------- Старт ---------- */
  // Поддержка прямой ссылки catalog.html?flag=new / ?tag=премиум
  const params = new URLSearchParams(location.search);
  if (params.get("flag")) {
    const flag = params.get("flag");
    const input = document.querySelector(`[data-flag="${flag}"]`);
    if (input) {
      input.checked = true;
      state.flags.add(flag);
    }
  }
  if (params.get("tag")) {
    const tag = params.get("tag");
    const btn = document.querySelector(`[data-tag="${tag}"]`);
    if (btn) {
      btn.classList.add("is-active");
      state.tags.add(tag);
    }
  }

  render();
})();
