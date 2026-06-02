/* ===== Общий скрипт: корзина, шапка, модалки, тосты, формы ===== */

const CART_KEY = "droplab_cart";

/* ---------- Корзина (localStorage) ---------- */
const Cart = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  },
  save(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    Cart.updateBadge();
    document.dispatchEvent(new CustomEvent("cart:change"));
  },
  add(id, qty = 1) {
    const items = Cart.get();
    const existing = items.find((i) => i.id === id && !i.custom);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({ id, qty });
    }
    Cart.save(items);
  },
  /* Кастомный товар из конструктора хранит снимок данных в item.custom */
  addCustom(custom, qty = 1) {
    const items = Cart.get();
    items.push({ id: "custom-" + Date.now(), qty, custom });
    Cart.save(items);
  },
  /* Товар из каталога с выбранным размером. Одинаковый товар+размер
     объединяется в одну строку корзины (ключ = id__размер). */
  addVariant(product, size, qty = 1) {
    const items = Cart.get();
    const key = product.id + (size ? "__" + size : "");
    const existing = items.find((i) => i.id === key);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        id: key,
        qty,
        custom: {
          name: product.name,
          price: product.price,
          oldPrice: product.oldPrice,
          image: product.image,
          tags: product.tags,
          size: size || null,
          meta: size ? "Размер: " + size : (product.tags || []).join(", "),
        },
      });
    }
    Cart.save(items);
  },
  /* Возвращает данные товара: из каталога или из снимка кастома */
  resolve(item) {
    return item.custom ? item.custom : getProduct(item.id);
  },
  setQty(id, qty) {
    let items = Cart.get();
    if (qty <= 0) {
      items = items.filter((i) => i.id !== id);
    } else {
      const item = items.find((i) => i.id === id);
      if (item) item.qty = qty;
    }
    Cart.save(items);
  },
  remove(id) {
    Cart.save(Cart.get().filter((i) => i.id !== id));
  },
  clear() {
    Cart.save([]);
  },
  count() {
    return Cart.get().reduce((sum, i) => sum + i.qty, 0);
  },
  total() {
    return Cart.get().reduce((sum, i) => {
      const p = Cart.resolve(i);
      return sum + (p && p.price ? p.price * i.qty : 0);
    }, 0);
  },
  updateBadge() {
    const badge = document.querySelector("[data-cart-badge]");
    if (!badge) return;
    const count = Cart.count();
    badge.textContent = count;
    badge.classList.toggle("is-visible", count > 0);
  },
};

/* ---------- Тосты ---------- */
function toast(message) {
  let wrap = document.querySelector(".toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `<span>✓</span><span>${message}</span>`;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

/* ---------- Мобильное меню ---------- */
function initMobileNav() {
  const burger = document.querySelector("[data-burger]");
  const nav = document.querySelector("[data-nav]");
  if (!burger || !nav) return;

  let backdrop = document.querySelector(".nav-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "nav-backdrop";
    document.body.appendChild(backdrop);
  }

  const close = () => {
    nav.classList.remove("is-open");
    burger.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    document.body.style.overflow = "";
  };
  const toggle = () => {
    const open = nav.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    backdrop.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };

  burger.addEventListener("click", toggle);
  backdrop.addEventListener("click", close);
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
}

/* ---------- Модальные окна ---------- */
function openModal(modal) {
  if (!modal) return;
  modal.classList.add("is-open");
  document.body.style.overflow = "hidden";
  const first = modal.querySelector("input, textarea, button");
  if (first) setTimeout(() => first.focus(), 50);
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove("is-open");
  document.body.style.overflow = "";
}

function initModals() {
  // Открытие по data-modal-open="id"
  document.querySelectorAll("[data-modal-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = document.getElementById(btn.dataset.modalOpen);
      openModal(modal);
    });
  });

  // Закрытие: оверлей, крестик, data-modal-close
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (
        e.target.classList.contains("modal__overlay") ||
        e.target.closest("[data-modal-close]")
      ) {
        closeModal(modal);
      }
    });
  });

  // Esc
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal.is-open").forEach(closeModal);
    }
  });
}

/* ---------- Валидация форм ---------- */
function validateField(field) {
  const input = field.querySelector("input, textarea");
  const error = field.querySelector(".field__error");
  if (!input) return true;

  let valid = true;
  let message = "";
  const value = input.value.trim();

  if (input.required && !value) {
    valid = false;
    message = "Заполните это поле";
  } else if (input.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    valid = false;
    message = "Введите корректный email";
  } else if (input.type === "tel" && value) {
    // Телефон: начинается с +7, 7 или 8 и содержит ровно 11 цифр
    const digits = value.replace(/\D/g, "");
    const startsOk = /^(\+7|7|8)/.test(value.replace(/[\s()-]/g, ""));
    if (!startsOk || digits.length !== 11) {
      valid = false;
      message = "Телефон должен начинаться с +7, 7 или 8 и содержать ровно 11 цифр";
    }
  }

  input.classList.toggle("is-invalid", !valid);
  if (error) {
    error.textContent = message;
    error.classList.toggle("is-visible", !valid);
  }
  return valid;
}

/* Подключает валидацию и обработку «отправки» формы.
   onSuccess(form) вызывается после успешной имитации отправки. */
function initForm(form, onSuccess) {
  if (!form) return;
  const fields = form.querySelectorAll(".field");

  fields.forEach((field) => {
    const input = field.querySelector("input, textarea");
    if (input) {
      input.addEventListener("blur", () => validateField(field));
      input.addEventListener("input", () => {
        if (input.classList.contains("is-invalid")) validateField(field);
      });
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let allValid = true;
    fields.forEach((field) => {
      if (!validateField(field)) allValid = false;
    });
    if (!allValid) return;

    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.dataset.label = btn.textContent;
      btn.textContent = "Отправляем…";
    }

    // Имитация отправки (фронтенд без бэкенда)
    setTimeout(() => {
      if (btn) {
        btn.disabled = false;
        btn.textContent = btn.dataset.label;
      }
      if (onSuccess) onSuccess(form);
    }, 800);
  });
}

/* ---------- Год в футере + активная ссылка ---------- */
function initChrome() {
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav__link").forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href.split("#")[0] === path) {
      link.classList.add("is-active");
    }
  });
}

/* ---------- Анимация появления ---------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length || !("IntersectionObserver" in window)) {
    items.forEach((i) => i.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  items.forEach((i) => io.observe(i));
}

/* ---------- Заявка из модалки на главной ---------- */
function initRequestModal() {
  const form = document.querySelector("[data-request-form]");
  if (!form) return;
  const modal = form.closest(".modal");
  const body = modal ? modal.querySelector("[data-modal-body]") : null;
  initForm(form, () => {
    if (body) {
      body.innerHTML = `
        <div class="form-success">
          <div class="form-success__icon">✓</div>
          <h3 class="modal__title">Заявка отправлена!</h3>
          <p class="modal__sub">Мы свяжемся с вами в ближайшее время.</p>
          <button class="btn btn--primary btn--block" data-modal-close>Готово</button>
        </div>`;
    }
  });
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  Cart.updateBadge();
  initMobileNav();
  initModals();
  initChrome();
  initReveal();
  initRequestModal();
});
