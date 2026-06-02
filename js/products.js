/* ===== Данные товаров DROP LAB =====
   Используется на страницах каталога, новинок и корзины.
   Цены в рублях. image — фото товара (папка img/). У каждой вещи минимум 2 размера. */

const PRODUCTS = [
  {
    id: "bag-face",
    name: "Сумка «FACE»",
    price: 2990,
    oldPrice: null,
    tags: ["кежуал"],
    flags: ["new"],
    color: "розовый",
    sizes: ["мини", "стандарт"],
    image: "img/bag-face.jpg",
    badge: "Новинка",
  },
  {
    id: "bag-streetracer",
    name: "Сумка «Streetracer»",
    price: 2990,
    oldPrice: null,
    tags: ["кежуал"],
    flags: [],
    color: "черный",
    sizes: ["мини", "стандарт"],
    image: "img/bag-streetracer.jpg",
  },
  {
    id: "jeans-droplab",
    name: "Джинсы «Droplab»",
    price: 5990,
    oldPrice: null,
    tags: ["премиум"],
    flags: ["new"],
    color: "черный",
    sizes: ["S", "M", "L", "XL"],
    image: "img/jeans-droplab.jpg",
    badge: "Новинка",
  },
  {
    id: "hoodie-classic",
    name: "Худи «Классика»",
    price: 6490,
    oldPrice: 7990,
    tags: ["премиум", "хлопок"],
    flags: ["sale"],
    color: "черный",
    sizes: ["S", "M", "L", "XL"],
    image: "img/hoodie-classic.jpg",
    badge: "Скидка",
    badgeType: "sale",
  },
  {
    id: "tee-brick",
    name: "Футболка «BRICK»",
    price: 2490,
    oldPrice: null,
    tags: ["кежуал", "хлопок"],
    flags: ["new"],
    color: "черный",
    sizes: ["S", "M", "L", "XL"],
    image: "img/tee-brick.jpg",
    badge: "Новинка",
  },
  {
    id: "tee-nefor",
    name: "Футболка «Нефор»",
    price: 2490,
    oldPrice: null,
    tags: ["кежуал", "хлопок"],
    flags: ["collab"],
    color: "белый",
    sizes: ["S", "M", "L"],
    image: "img/tee-nefor.jpg",
    badge: "Коллаб",
  },
  {
    id: "panama-droplab",
    name: "Панама «Droplab»",
    price: 1990,
    oldPrice: null,
    tags: ["кежуал"],
    flags: [],
    color: "синий",
    sizes: ["S/M", "L/XL"],
    image: "img/panama-droplab.jpg",
  },
  {
    id: "windbreaker-mono",
    name: "Ветровка «Моно»",
    price: 8990,
    oldPrice: null,
    tags: ["премиум"],
    flags: ["new"],
    color: "черный",
    sizes: ["M", "L", "XL"],
    image: "img/windbreaker-mono.jpg",
    badge: "Новинка",
  },
  {
    id: "tube-vomitos",
    name: "Ватрушка «Вомитос»",
    price: 3490,
    oldPrice: null,
    tags: ["кежуал"],
    flags: [],
    color: "зеленый",
    sizes: ["90 см", "100 см", "120 см"],
    image: "img/tube-vomitos.jpg",
  },
  {
    id: "wallet-prostotak",
    name: "Кошелёк «Prostotak»",
    price: 1490,
    oldPrice: 1990,
    tags: ["кежуал"],
    flags: ["sale"],
    color: "зеленый",
    sizes: ["компакт", "стандарт"],
    image: "img/wallet-prostotak.jpg",
    badge: "Скидка",
    badgeType: "sale",
  },
];

/* Форматирование цены: 2990 -> "2 990 ₽" */
function formatPrice(value) {
  if (value == null) return "По заявке";
  return value.toLocaleString("ru-RU") + " ₽";
}

function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}

/* Медиа карточки: фото товара или градиент-плейсхолдер (если фото нет). */
function productMedia(p, extraClass = "card__media") {
  if (p.image) {
    return `<div class="${extraClass}"><img src="${p.image}" alt="${p.name}" loading="lazy" /></div>`;
  }
  const textColor = p.inkText ? "color:#171717;" : "";
  return `<div class="${extraClass}" style="background:${p.gradient || "#222"};${textColor}"><span>${p.name}</span></div>`;
}

/* Единый рендер карточки товара (используется на главной, в каталоге и новинках).
   Бейдж (Новинка/Коллаб/Скидка) выводится рядом с ценой, а не поверх фото. */
function renderProductCard(p) {
  const flag = p.badge
    ? `<span class="card__flag ${p.badgeType === "sale" ? "card__flag--sale" : ""}">${p.badge}</span>`
    : "";
  const price =
    p.price == null
      ? `<div class="card__price">По заявке</div>`
      : `<div class="card__price">${formatPrice(p.price)}${p.oldPrice ? `<s>${formatPrice(p.oldPrice)}</s>` : ""}</div>`;
  const tags = p.tags.map((t) => `<span class="card__tag">${t}</span>`).join("");
  const sizes = (p.sizes || [])
    .map((s) => `<span class="card__size">${s}</span>`)
    .join("");
  const href = `product.html?id=${p.id}`;
  return `
    <article class="card">
      <a href="${href}" class="card__media-link" aria-label="${p.name}">${productMedia(p)}</a>
      <div class="card__body">
        <h3 class="card__title"><a href="${href}">${p.name}</a></h3>
        <div class="card__tags">${tags}</div>
        ${sizes ? `<div class="card__sizes" aria-label="Доступные размеры">${sizes}</div>` : ""}
        <div class="card__price-row">${price}${flag}</div>
        <div class="card__footer">
          <button class="btn btn--primary btn--sm btn--block" data-add="${p.id}">В корзину</button>
        </div>
      </div>
    </article>`;
}
