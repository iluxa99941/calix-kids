// 🎨 Цветовые палитры
const fullColors = [
  { color: "black" },
  { color: "red" },
  { color: "blue" },
  { color: "green" },
  { color: "orange" },
  { color: "#E5097F" },
  { color: "brown" }
];

const vinylColors = [
  { color: "blue" },
  { color: "#E5097F" }
];

// 📐 Автоподгон шрифта
function fitPreviewText(previewNameEl) {
  const container = previewNameEl.parentElement;
  let fontSize = 40;
  previewNameEl.style.fontSize = fontSize + "px";

  while (
    (previewNameEl.scrollWidth > container.clientWidth ||
     previewNameEl.scrollHeight > container.clientHeight) &&
    fontSize > 8
  ) {
    fontSize -= 1;
    previewNameEl.style.fontSize = fontSize + "px";
  }
}

// 🎨 Отрисовка палитры
function renderColors(paletteEl, colors, keepSelectedColor) {
  const prevSelected = keepSelectedColor
    ? paletteEl.querySelector(".color-option.selected")?.dataset.color
    : null;

  paletteEl.innerHTML = "";
  colors.forEach(c => {
    const div = document.createElement("div");
    div.className = "color-option";
    div.style.background = c.color;
    if (c.border) div.style.border = `1px solid ${c.border}`;
    div.dataset.color = c.color;
    if (prevSelected && prevSelected === c.color) {
      div.classList.add("selected");
    }
    paletteEl.appendChild(div);
  });

  if (!paletteEl.querySelector(".color-option.selected")) {
    const first = paletteEl.querySelector(".color-option");
    if (first) {
      first.classList.add("selected");
      const form = paletteEl.closest(".order-form");
      form.querySelector(".preview-name").style.color = first.dataset.color;
    }
  }
}

// 📊 Расчёт стоимости
function calculatePrice() {
  let total = 0;
  let totalSheets = 0;

  document.querySelectorAll(".order-form").forEach(form => {
    const type = form.querySelector(".type-btn.selected")?.dataset.type || "";
    if (!type) return;

    if (type.toLowerCase().includes("канц") || type.toLowerCase().includes("канцеля")) {
      // Для канцелярии — 1 лист = 400 сом
      total += 400;
      totalSheets += 1;
    } else if (type.toLowerCase().includes("термо")) {
      // Для термо — смотрим выбранное кол-во
      const qty = form.querySelector(".qty-btn.selected")?.dataset.qty || "40";
      if (qty === "40") {
        total += 400; // 1 лист
        totalSheets += 1;
      } else if (qty === "20") {
        total += 300; // 0.5 листа
        totalSheets += 0.5;
      } else {
        // на всякий случай: если неизвестное значение — считать как 1 лист
        total += 400;
        totalSheets += 1;
      }
    }
  });

  // Скидка: если больше 10 листов — 10%
  let discount = 0;
  if (totalSheets > 10) {
    discount = Math.round(total * 0.10);
  }
  const finalTotal = total - discount;

  return { total, discount, finalTotal, totalSheets };
}

// Обновить отображение итоговой цены
function updateTotalPrice() {
  const el = document.getElementById("totalPrice");
  if (!el) return;
  const { total, discount, finalTotal, totalSheets } = calculatePrice();
  if (discount > 0) {
    el.textContent = `${finalTotal} сом (скидка ${discount} сом)`;
  } else {
    el.textContent = `${finalTotal} сом`;
  }
}

// 🧼 Инициализация формы
function initForm(form) {
  renderColors(form.querySelector(".color-palette"), fullColors);
  form.querySelectorAll(".gallery img").forEach(img => img.classList.remove("selected"));

  // Не показываем картинку по умолчанию — старт без картинки
  const previewImg = form.querySelector(".preview-img");
  previewImg.src = "";
  previewImg.style.display = "none";

  const previewName = form.querySelector(".preview-name");
  previewName.textContent = "Имя";
  previewName.style.color = "black";
  previewName.style.fontSize = "40px";
  form.querySelectorAll(".type-btn").forEach(btn => btn.classList.remove("selected"));
  form.querySelector(".gallery").style.display = "grid";

  // По умолчанию термо, но без картинки — добавляем класс no-image
  const preview = form.querySelector(".preview");
  preview.className = "preview termo no-image";

  const clone = form.querySelector(".vinyl-clone");
  if (clone) clone.remove();
  const btnNoImage = form.querySelector(".btn-no-image");
  if (btnNoImage) btnNoImage.style.display = "inline-block";

  // Сброс выбора количества
  const qtyContainer = form.querySelector(".qty-container");
  if (qtyContainer) {
    qtyContainer.style.display = "none";
    qtyContainer.querySelectorAll(".qty-btn").forEach(b => b.classList.remove("selected"));
  }

  // обновить цену после инициализации
  updateTotalPrice();
}

// ➕ Помощник: применить выбор типа к форме
function selectType(form, isVinyl, setDefaultImage = true) {
  form.querySelectorAll(".type-btn").forEach(b => b.classList.remove("selected"));
  const btn = isVinyl
    ? form.querySelector(".type-btn.btn-vinyl")
    : form.querySelector(".type-btn.btn-dtf");
  if (btn) btn.classList.add("selected");

  const palette = form.querySelector(".color-palette");
  const gallery = form.querySelector(".gallery");
  const preview = form.querySelector(".preview");
  const previewImg = form.querySelector(".preview-img");
  const wrapper = form.querySelector(".preview-wrapper");
  const btnNoImage = form.querySelector(".btn-no-image");
  const qtyContainer = form.querySelector(".qty-container");

  if (isVinyl) {
    renderColors(palette, vinylColors, true);
    if (gallery) gallery.style.display = "none";
    if (previewImg) {
      previewImg.src = "";
      previewImg.style.display = "none";
    }
    if (preview) preview.className = "preview vinyl";
    if (btnNoImage) btnNoImage.style.display = "none";
    if (qtyContainer) qtyContainer.style.display = "none";
  } else {
    renderColors(palette, fullColors, true);
    if (gallery) gallery.style.display = "grid";

    // Только ставим картинку по умолчанию если разрешено и нет выбранной картинки в галерее
    const anySelected = form.querySelector(".gallery img.selected");
    if (previewImg) {
      if (setDefaultImage && !anySelected) {
        previewImg.src = "img1.jpg";
        previewImg.style.display = "block";
      } else if (!anySelected && !setDefaultImage) {
        previewImg.src = "";
        previewImg.style.display = "none";
      } else if (anySelected) {
        previewImg.src = form.querySelector(".gallery img.selected").src;
        previewImg.style.display = "block";
      }
    }

    if (preview) preview.className = "preview термо";
    if (btnNoImage) btnNoImage.style.display = "inline-block";

    // Убираем клон
    const clone = wrapper?.querySelector(".vinyl-clone");
    if (clone) clone.remove();

    // Показываем выбор количества для термо и по умолчанию выбираем 40
    if (qtyContainer) {
      qtyContainer.style.display = "flex";
      // если ничего не выбрано — выбрать 40 по умолчанию
      const anyQty = qtyContainer.querySelector(".qty-btn.selected");
      if (!anyQty) {
        qtyContainer.querySelectorAll(".qty-btn").forEach(b => b.classList.remove("selected"));
        const btn40 = qtyContainer.querySelector('.qty-btn[data-qty="40"]');
        if (btn40) btn40.classList.add("selected");
      }
    }
  }

  // после смены типа обновляем итоговую цену
  updateTotalPrice();
}

// 📦 Показ формы
function showForm(selectedType) {
  const section = document.getElementById("formSection");
  section.style.display = "block";
  window.scrollTo({ top: section.offsetTop, behavior: "smooth" });

  // Если передан тип, выделяем соответствующую кнопку, НЕ ставя картинку по умолчанию
  if (selectedType) {
    const form = document.querySelector(".order-form");
    form.querySelectorAll(".type-btn").forEach(btn => btn.classList.remove("selected"));
    const targetBtn = Array.from(form.querySelectorAll(".type-btn"))
      .find(b => b.dataset.type === selectedType);
    if (targetBtn) {
      targetBtn.classList.add("selected");
      const isVinyl = targetBtn.classList.contains("btn-vinyl");
      selectType(form, isVinyl, false); // важное: false — чтобы не подставлять img1.jpg
    }
  }
  // показать актуальную цену
  updateTotalPrice();
}

// 🎯 Обработчики событий
document.addEventListener("click", function (e) {
  // Выбор количества (qty-btn)
  if (e.target.classList && e.target.classList.contains("qty-btn")) {
    const btn = e.target;
    const form = btn.closest(".order-form");
    form.querySelectorAll(".qty-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    updateTotalPrice();
    return;
  }

  // Выбор картинки
  if (e.target.closest(".gallery img")) {
    const imgEl = e.target;
    const form = imgEl.closest(".order-form");
    form.querySelectorAll(".gallery img").forEach(i => i.classList.remove("selected"));
    imgEl.classList.add("selected");
    const previewImg = form.querySelector(".preview-img");
    if (previewImg) {
      previewImg.src = imgEl.src;
      previewImg.style.display = "block";
      previewImg.style.width = "70px";
      previewImg.style.height = "auto";
    }
    form.querySelector(".preview")?.classList.remove("no-image");
    return;
  }

  // Выбор цвета
  if (e.target.classList.contains("color-option")) {
    const form = e.target.closest(".order-form");
    const newColor = e.target.dataset.color;

    // Обновляем большой предпросмотр
    const bigNameEl = form.querySelector(".preview.термо .preview-name, .preview.vinyl .preview-name");
    if (bigNameEl) {
      bigNameEl.style.color = newColor;
      fitPreviewText(bigNameEl);
    }

    // Обновляем маленький предпросмотр, если есть
    const smallNameEl = form.querySelector(".vinyl-clone .preview-name");
    if (smallNameEl) {
      smallNameEl.style.color = newColor;
      fitPreviewText(smallNameEl);
    }

    // Подсветка выбранного цвета
    form.querySelectorAll(".color-option").forEach(c => c.classList.remove("selected"));
    e.target.classList.add("selected");
    return;
  }

  // Выбор типа наклейки (клик пользователя) — используем selectType с setDefaultImage = true
  // <-- изменённая часть: теперь используем closest, чтобы попадать при клике на вложенные элементы (br/span)
  const typeBtn = e.target.closest && e.target.closest(".type-btn");
  if (typeBtn) {
    const form = typeBtn.closest(".order-form");
    const isVinyl = typeBtn.classList.contains("btn-vinyl");
    selectType(form, isVinyl, true);
    // updateTotalPrice внутри selectType
    return;
  }

  // Нажатие на "Без картинки"
  if (e.target.classList.contains("btn-no-image")) {
    const form = e.target.closest(".order-form");
    const gallery = form.querySelector(".gallery");
    const previewImg = form.querySelector(".preview-img");

    gallery.querySelectorAll("img").forEach(i => i.classList.remove("selected"));
    if (previewImg) {
      previewImg.src = "";
      previewImg.style.display = "none";
    }
    return;
  }
});

// 🔤 Обновление имени
document.addEventListener("input", function (e) {
  if (e.target.classList.contains("childName")) {
    const form = e.target.closest(".order-form");
    const newName = e.target.value || "Имя";

    // Обновляем большой предпросмотр
    const bigNameEl = form.querySelector(".preview.термо .preview-name, .preview.vinyl .preview-name");
    if (bigNameEl) {
      bigNameEl.textContent = newName;
      fitPreviewText(bigNameEl);
    }


  }
});



// 📲 Отправка заказа
function sendOrder() {
  const phone = "996500060309"; // ← замените на ваш номер
  let message = "Здравствуйте! Хочу заказать наклейки:\n";
  let hasError = false;

  document.querySelectorAll(".order-form").forEach((form, index) => {
    const name = form.querySelector(".childName").value.trim() || "—";
    const imgNum = form.querySelector(".gallery img.selected")?.dataset.num || "нет";
    const color = form.querySelector(".color-option.selected")?.dataset.color || "не выбран";
    const type = form.querySelector(".type-btn.selected")?.dataset.type;

    if (!type) {
      alert("Пожалуйста, выберите вид наклейки для заказа.");
      hasError = true;
      return;
    }

    // количество для термо (если термо выбран)
    let qtyPart = "";
    if (type && type.toLowerCase().includes("термо")) {
      const qty = form.querySelector(".qty-btn.selected")?.dataset.qty || "40";
      qtyPart = `, Кол-во: ${qty} шт`;
    }

    message += `\n${index + 1}) Имя: ${name}, Картинка №${imgNum}, Цвет: ${color}${qtyPart}, Вид: ${type}`;
  });

  if (hasError) return;

  // Добавляем итоговую стоимость и скидку в сообщение
  const { total, discount, finalTotal, totalSheets } = calculatePrice();
  message += `\n\nИтоговая сумма: ${finalTotal} сом`;
  if (discount > 0) message += ` (включая скидку ${discount} сом за ${totalSheets} листов)`;

  window.location.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

// 🚀 Инициализация
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".order-form").forEach(initForm);
  // показать начальную цену
  updateTotalPrice();
});

function addForm() {
  const container = document.getElementById("formsContainer");
  const template = document.querySelector(".order-form");
  if (!container || !template) return;

  // Клонируем форму
  const clone = template.cloneNode(true);

  // Удаляем возможные id, чтобы не было дубликатов
  clone.querySelectorAll("[id]").forEach(el => el.removeAttribute("id"));

  // Очищаем текстовые поля и чекбоксы/радио
  clone.querySelectorAll("input").forEach(inp => {
    if (inp.type === "text" || inp.type === "search" || inp.type === "tel" || inp.type === "email") {
      inp.value = "";
    } else if (inp.type === "checkbox" || inp.type === "radio") {
      inp.checked = false;
    } else {
      inp.value = "";
    }
  });

  // Убираем любые выделения (selected) в клоне
  clone.querySelectorAll(".selected").forEach(el => el.classList.remove("selected"));

  // Сбрасываем превью (если есть)
  const previewImg = clone.querySelector(".preview-img");
  if (previewImg) {
    previewImg.src = "";
    previewImg.style.display = "none";
  }
  clone.querySelectorAll(".gallery img").forEach(img => img.classList.remove("selected"));

  // Добавляем в контейнер и инициализируем
  container.appendChild(clone);
  try {
    initForm(clone);
  } catch (err) {
    console.error("initForm error for cloned form:", err);
  }

  // обновляем итог после добавления формы
  updateTotalPrice();

  // Скролл к новой форме
  clone.scrollIntoView({ behavior: "smooth", block: "center" });
}
