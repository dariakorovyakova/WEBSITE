/* ===== Страница карточки товара ===== */

(function () {
  const root = document.querySelector("[data-product-root]");
  if (!root) return;

  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const p = id ? getProduct(id) : null;

  if (!p) {
    root.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty__icon">🔍</div>
        <h2>Товар не найден</h2>
        <p>Возможно, он распродан или ссылка устарела.</p>
        <a href="catalog.html" class="btn btn--primary">Перейти в каталог</a>
      </div>`;
    return;
  }

  document.title = `${p.name} — DROP LAB`;
  const crumb = document.querySelector("[data-product-crumb]");
  if (crumb) crumb.textContent = p.name;

  const sizes = p.sizes || [];
  const state = { size: sizes[0] || null, qty: 1 };

  const media = p.image
    ? `<div class="product__media"><img src="${p.image}" alt="${p.name}" /></div>`
    : `<div class="product__media" style="background:${p.gradient || "#222"}"><span>${p.name}</span></div>`;

  const flag = p.badge
    ? `<span class="card__flag ${p.badgeType === "sale" ? "card__flag--sale" : ""}">${p.badge}</span>`
    : "";

  const price =
    p.price == null
      ? `<div class="product__price">По заявке</div>`
      : `<div class="product__price">${formatPrice(p.price)}${
          p.oldPrice ? `<s>${formatPrice(p.oldPrice)}</s>` : ""
        }</div>`;

  const tags = (p.tags || []).map((t) => `<span class="card__tag">${t}</span>`).join("");

  const sizeChips = sizes
    .map(
      (s, i) =>
        `<button type="button" class="size-chip${i === 0 ? " is-active" : ""}" data-size="${s}">${s}</button>`
    )
    .join("");

  root.innerHTML = `
    <div class="product">
      ${media}
      <div class="product__info">
        <h1 class="product__title">${p.name}</h1>
        <div class="card__tags">${tags}</div>
        <div class="product__price-row">${price}${flag}</div>

        ${
          sizes.length
            ? `<div class="product__group">
                 <span class="product__label">Размер</span>
                 <div class="size-chips" data-sizes>${sizeChips}</div>
               </div>`
            : ""
        }

        <div class="product__group">
          <span class="product__label">Количество</span>
          <div class="qty qty--lg" data-qty>
            <button type="button" data-dec aria-label="Меньше">−</button>
            <span data-qty-value>1</span>
            <button type="button" data-inc aria-label="Больше">+</button>
          </div>
        </div>

        <button class="btn btn--primary btn--block" data-add-detail>Добавить в корзину</button>
        <a href="catalog.html" class="btn btn--ghost btn--block btn--sm" style="margin-top:8px;">← В каталог</a>
      </div>
    </div>`;

  /* Выбор размера */
  const sizesWrap = root.querySelector("[data-sizes]");
  if (sizesWrap) {
    sizesWrap.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-size]");
      if (!chip) return;
      sizesWrap.querySelectorAll(".size-chip").forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      state.size = chip.dataset.size;
    });
  }

  /* Количество */
  const qtyValue = root.querySelector("[data-qty-value]");
  root.querySelector("[data-qty]").addEventListener("click", (e) => {
    if (e.target.closest("[data-inc]")) state.qty++;
    else if (e.target.closest("[data-dec]")) state.qty = Math.max(1, state.qty - 1);
    else return;
    qtyValue.textContent = state.qty;
  });

  /* В корзину */
  root.querySelector("[data-add-detail]").addEventListener("click", () => {
    Cart.addVariant(p, state.size, state.qty);
    const sizeNote = state.size ? `, размер ${state.size}` : "";
    toast(`Добавлено в корзину (${state.qty} шт.${sizeNote})`);
  });
})();
