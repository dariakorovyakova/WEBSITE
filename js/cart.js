/* ===== Страница корзины ===== */

(function () {
  const root = document.querySelector("[data-cart-root]");
  if (!root) return;

  const DELIVERY = 390;
  const FREE_DELIVERY_FROM = 5000;

  function render() {
    const items = Cart.get();

    if (items.length === 0) {
      root.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty__icon">🛒</div>
          <h2>Корзина пуста</h2>
          <p>Самое время заглянуть в каталог и собрать свой дроп.</p>
          <a href="catalog.html" class="btn btn--primary">Перейти в магазин</a>
        </div>`;
      return;
    }

    const rows = items
      .map((item) => {
        const p = Cart.resolve(item);
        if (!p) return "";
        const textColor = p.inkText ? "color:#171717;" : "";
        const lineTotal = p.price ? p.price * item.qty : 0;
        const meta = item.custom ? (p.meta || "кастом") : (p.tags || []).join(", ");
        const media = p.image
          ? `<div class="cart-item__media"><img src="${p.image}" alt="${p.name}" loading="lazy" /></div>`
          : `<div class="cart-item__media" style="background:${p.gradient};${textColor}">${p.name}</div>`;
        return `
          <div class="cart-item" data-id="${item.id}">
            ${media}
            <div class="cart-item__info">
              <h3>${p.name}</h3>
              <div class="cart-item__meta">${meta}</div>
              <div class="cart-item__price">${formatPrice(p.price)}</div>
            </div>
            <div class="cart-item__right">
              <div class="qty">
                <button data-dec aria-label="Меньше">−</button>
                <span>${item.qty}</span>
                <button data-inc aria-label="Больше">+</button>
              </div>
              <button class="cart-item__remove" data-remove>Удалить</button>
              <div class="cart-item__price">${formatPrice(lineTotal)}</div>
            </div>
          </div>`;
      })
      .join("");

    const subtotal = Cart.total();
    const delivery = subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY;
    const total = subtotal + delivery;

    root.innerHTML = `
      <div class="cart-layout">
        <div class="cart-items">${rows}</div>
        <aside class="summary">
          <h3>Ваш заказ</h3>
          <div class="summary__row"><span>Товары (${Cart.count()})</span><span>${formatPrice(subtotal)}</span></div>
          <div class="summary__row"><span>Доставка</span><span>${delivery === 0 ? "Бесплатно" : formatPrice(delivery)}</span></div>
          <div class="summary__row summary__row--total"><span>Итого</span><span>${formatPrice(total)}</span></div>
          <button class="btn btn--primary btn--block" style="margin-top:18px;" data-modal-open="modal-checkout">Оформить заказ</button>
          <button class="btn btn--ghost btn--block btn--sm" style="margin-top:8px;" data-clear>Очистить корзину</button>
        </aside>
      </div>`;

    // Переподключаем открытие модалки оформления (кнопка создана динамически)
    root.querySelector("[data-modal-open]").addEventListener("click", () => {
      openModal(document.getElementById("modal-checkout"));
    });
  }

  /* Делегирование действий по корзине */
  root.addEventListener("click", (e) => {
    const itemEl = e.target.closest(".cart-item");
    if (e.target.closest("[data-clear]")) {
      Cart.clear();
      toast("Корзина очищена");
      return;
    }
    if (!itemEl) return;
    const id = itemEl.dataset.id;
    const current = Cart.get().find((i) => i.id === id);
    if (!current) return;

    if (e.target.closest("[data-inc]")) Cart.setQty(id, current.qty + 1);
    else if (e.target.closest("[data-dec]")) Cart.setQty(id, current.qty - 1);
    else if (e.target.closest("[data-remove]")) {
      Cart.remove(id);
      toast("Товар удалён");
    }
  });

  document.addEventListener("cart:change", render);

  /* Оформление заказа */
  const checkoutForm = document.querySelector("[data-checkout-form]");
  const checkoutBody = document.querySelector("[data-checkout-body]");
  initForm(checkoutForm, () => {
    checkoutBody.innerHTML = `
      <div class="form-success">
        <div class="form-success__icon">✓</div>
        <h3 class="modal__title">Заказ оформлен!</h3>
        <p class="modal__sub">Спасибо! Мы свяжемся с вами для подтверждения. Номер заказа: №${Math.floor(
          Math.random() * 900000 + 100000
        )}.</p>
        <button class="btn btn--primary btn--block" data-modal-close>Отлично</button>
      </div>`;
    Cart.clear();
  });

  render();
})();
