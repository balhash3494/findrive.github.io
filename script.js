/* ===========================
   HEADER SCROLL
   =========================== */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ===========================
   BURGER MENU
   =========================== */
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
burger.addEventListener('click', () => nav.classList.toggle('open'));
nav.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => nav.classList.remove('open'));
});

/* ===========================
   BACK TO TOP
   =========================== */
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });
backToTop.addEventListener('click', () => window.scrollTo({ top: 0 }));

/* ===========================
   SCROLL ANIMATIONS
   =========================== */
const animElements = document.querySelectorAll('[data-anim]');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => entry.target.classList.add('animated'), parseInt(delay));
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
animElements.forEach(el => observer.observe(el));

/* ===========================
   COUNTER ANIMATION
   =========================== */
function animateCounter(el, target) {
  const duration = 1800;
  const startTime = performance.now();
  function update(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(target * ease) + '+';
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target, parseInt(entry.target.dataset.count));
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => statObserver.observe(el));

/* ===========================
   CALCULATOR
   =========================== */
const formatMoney = n => Math.round(n).toLocaleString('ru-RU') + ' ₽';
const formatMoneyShort = n => {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + ' млн ₽';
  return Math.round(n / 1000) + ' тыс. ₽';
};

function updateRange(rangeEl, fillEl, min, max) {
  const pct = ((parseFloat(rangeEl.value) - min) / (max - min)) * 100;
  fillEl.style.width = pct + '%';
}

function calcPayment() {
  const price = parseFloat(document.getElementById('price').value);
  const advPct = parseFloat(document.getElementById('advance').value);
  const term = parseFloat(document.getElementById('term').value);
  const rate = parseFloat(document.getElementById('rate').value);
  const adv = price * advPct / 100;
  const body = price - adv;
  const mr = rate / 100 / 12;
  const monthly = mr === 0 ? body / term
    : body * (mr * Math.pow(1 + mr, term)) / (Math.pow(1 + mr, term) - 1);
  const total = adv + monthly * term;
  const overpay = total - price;
  document.getElementById('monthlyPayment').textContent = formatMoney(monthly) + '/мес.';
  document.getElementById('advanceAmount').textContent = formatMoney(adv);
  document.getElementById('bodyAmount').textContent = formatMoney(body);
  document.getElementById('overpayAmount').textContent = formatMoney(overpay);
  document.getElementById('totalAmount').textContent = formatMoney(total);
  const bodyPct = (body / total) * 100;
  document.getElementById('chartBar1').setAttribute('width', (bodyPct / 100 * 300).toFixed(1));
}

const sliders = [
  { id: 'price', fillId: 'priceFill', valId: 'priceVal', min: 500000, max: 50000000, fmt: v => formatMoneyShort(v) },
  { id: 'advance', fillId: 'advanceFill', valId: 'advanceVal', min: 0, max: 50, fmt: v => v + '%' },
  { id: 'term', fillId: 'termFill', valId: 'termVal', min: 12, max: 84, fmt: v => v + ' мес.' },
  { id: 'rate', fillId: 'rateFill', valId: 'rateVal', min: 3.5, max: 18, fmt: v => parseFloat(v).toFixed(1).replace('.0','') + '%' },
];
sliders.forEach(({ id, fillId, valId, min, max, fmt }) => {
  const el = document.getElementById(id);
  const fill = document.getElementById(fillId);
  const val = document.getElementById(valId);
  el.addEventListener('input', () => { val.textContent = fmt(el.value); updateRange(el, fill, min, max); calcPayment(); });
  updateRange(el, fill, min, max);
  val.textContent = fmt(el.value);
});

document.querySelectorAll('.calc__tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.calc__tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const presets = {
      auto:      { price: 5000000, advance: 20, term: 36, rate: 7 },
      equipment: { price: 3000000, advance: 0,  term: 48, rate: 6.5 },
      truck:     { price: 8000000, advance: 15, term: 60, rate: 7.5 },
    };
    const p = presets[tab.dataset.type];
    document.getElementById('price').value = p.price;
    document.getElementById('advance').value = p.advance;
    document.getElementById('term').value = p.term;
    document.getElementById('rate').value = p.rate;
    sliders.forEach(({ id, fillId, valId, min, max, fmt }) => {
      const el = document.getElementById(id);
      updateRange(el, document.getElementById(fillId), min, max);
      document.getElementById(valId).textContent = fmt(el.value);
    });
    calcPayment();
  });
});
calcPayment();

/* ===========================
   FAQ ACCORDION
   =========================== */
document.querySelectorAll('.faq__question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq__item');
    const isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq__item.open').forEach(el => {
      el.classList.remove('open');
      el.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
      el.querySelector('.faq__icon').textContent = '+';
    });
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      btn.querySelector('.faq__icon').textContent = '×';
    }
  });
});

/* ===========================
   FORM — ТЕЛЕФОННАЯ МАСКА + ВАЛИДАЦИЯ
   =========================== */

/* --- Маска телефона: +7 (XXX) XXX-XX-XX --- */
const phoneInput = document.getElementById('fieldPhone');

if (phoneInput) {

  // Префикс, который нельзя удалить
  const PREFIX = '+7 (';

  // Позиции цифр внутри отформатированной строки:
  // +7 (AAA) BBB-CC-DD
  // 0123456789...
  // Цифры стоят на позициях: 4,5,6, 9,10,11, 13,14, 16,17
  const DIGIT_POSITIONS = [4, 5, 6, 9, 10, 11, 13, 14, 16, 17];

  // Форматируем строку из 0..10 цифр
  function formatPhone(digits) {
    let s = PREFIX;
    if (digits.length > 0) s += digits.slice(0, 3);
    if (digits.length >= 3) s += ') ';
    if (digits.length > 3)  s += digits.slice(3, 6);
    if (digits.length >= 6) s += '-';
    if (digits.length > 6)  s += digits.slice(6, 8);
    if (digits.length >= 8) s += '-';
    if (digits.length > 8)  s += digits.slice(8, 10);
    return s;
  }

  // Извлекаем «сырые» цифры (только 10 цифр абонента, без кода страны)
  function getRawDigits(val) {
    let d = val.replace(/\D/g, '');
    if (d.startsWith('7') || d.startsWith('8')) d = d.slice(1);
    return d.slice(0, 10);
  }

  // Переводим позицию курсора в отформатированной строке
  // в индекс «сырой» цифры (0..9)
  function cursorToDigitIndex(pos) {
    let count = 0;
    for (let i = 0; i < pos && i < DIGIT_POSITIONS.length; i++) {
      if (pos > DIGIT_POSITIONS[i]) count++;
    }
    return count;
  }

  // Переводим индекс «сырой» цифры обратно в позицию курсора
  function digitIndexToCursor(idx, formatted) {
    if (idx <= 0) return PREFIX.length;           // перед первой цифрой
    if (idx >= 10) return formatted.length;       // после последней
    return DIGIT_POSITIONS[idx];                  // позиция после idx-й цифры
  }

  // Применяем новое значение и ставим курсор
  function applyMask(digits, cursorDigitIdx) {
    const formatted = formatPhone(digits);
    phoneInput.value = formatted;

    // Курсор: после только что введённой/удалённой цифры
    const clampedIdx = Math.max(0, Math.min(cursorDigitIdx, digits.length));
    const cursorPos = clampedIdx === 0
      ? PREFIX.length
      : (DIGIT_POSITIONS[clampedIdx - 1] !== undefined ? DIGIT_POSITIONS[clampedIdx - 1] + 1 : formatted.length);

    phoneInput.setSelectionRange(cursorPos, cursorPos);

    // Обратная связь
    if (digits.length === 10) {
      setFieldState(phoneInput, 'valid');
      hideError('errPhone');
    } else {
      setFieldState(phoneInput, 'neutral');
    }
  }

  // Фокус — ставим PREFIX если пусто
  phoneInput.addEventListener('focus', () => {
    if (!phoneInput.value) {
      phoneInput.value = PREFIX;
      phoneInput.setSelectionRange(PREFIX.length, PREFIX.length);
    }
  });

  // Перехватываем keydown — обрабатываем Backspace / Delete вручную
  phoneInput.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') return; // Tab всегда пропускаем

    const val    = phoneInput.value;
    const selStart = phoneInput.selectionStart;
    const selEnd   = phoneInput.selectionEnd;
    const hasSelection = selStart !== selEnd;
    let digits = getRawDigits(val);

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (hasSelection) {
        // Удаляем все цифры в выделении
        const dStart = cursorToDigitIndex(selStart);
        const dEnd   = cursorToDigitIndex(selEnd);
        digits = digits.slice(0, dStart) + digits.slice(dEnd);
        applyMask(digits, dStart);
      } else {
        // Нет выделения — удаляем цифру слева от курсора
        // Ищем ближайшую цифру левее позиции курсора
        let digitIdx = -1;
        for (let i = DIGIT_POSITIONS.length - 1; i >= 0; i--) {
          if (DIGIT_POSITIONS[i] < selStart) { digitIdx = i; break; }
        }
        if (digitIdx >= 0 && digitIdx < digits.length) {
          digits = digits.slice(0, digitIdx) + digits.slice(digitIdx + 1);
          applyMask(digits, digitIdx);
        } else {
          // Курсор в PREFIX — не даём уйти левее
          phoneInput.setSelectionRange(PREFIX.length, PREFIX.length);
        }
      }
      return;
    }

    if (e.key === 'Delete') {
      e.preventDefault();
      if (hasSelection) {
        const dStart = cursorToDigitIndex(selStart);
        const dEnd   = cursorToDigitIndex(selEnd);
        digits = digits.slice(0, dStart) + digits.slice(dEnd);
        applyMask(digits, dStart);
      } else {
        // Удаляем цифру справа от курсора
        let digitIdx = -1;
        for (let i = 0; i < DIGIT_POSITIONS.length; i++) {
          if (DIGIT_POSITIONS[i] >= selStart) { digitIdx = i; break; }
        }
        if (digitIdx >= 0 && digitIdx < digits.length) {
          digits = digits.slice(0, digitIdx) + digits.slice(digitIdx + 1);
          applyMask(digits, digitIdx);
        }
      }
      return;
    }

    // Блокируем всё, кроме цифр и навигационных клавиш
    const navKeys = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'];
    if (navKeys.includes(e.key)) return;

    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      if (digits.length >= 10 && !hasSelection) return; // уже полный номер

      // Если есть выделение — сначала удаляем его
      let insertIdx = cursorToDigitIndex(selStart);
      if (hasSelection) {
        const dEnd = cursorToDigitIndex(selEnd);
        digits = digits.slice(0, insertIdx) + digits.slice(dEnd);
      }
      if (digits.length < 10) {
        digits = digits.slice(0, insertIdx) + e.key + digits.slice(insertIdx);
        insertIdx += 1;
      }
      applyMask(digits, insertIdx);
      return;
    }

    // Всё остальное — запрещаем
    e.preventDefault();
  });

  // Вставка из буфера обмена
  phoneInput.addEventListener('paste', (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData('text');
    let newDigits = pasted.replace(/\D/g, '');
    if (newDigits.startsWith('7') || newDigits.startsWith('8')) newDigits = newDigits.slice(1);
    newDigits = newDigits.slice(0, 10);

    const selStart = phoneInput.selectionStart;
    const selEnd   = phoneInput.selectionEnd;
    let existing = getRawDigits(phoneInput.value);
    const dStart = cursorToDigitIndex(selStart);
    const dEnd   = cursorToDigitIndex(selEnd);
    existing = existing.slice(0, dStart) + newDigits + existing.slice(dEnd);
    existing = existing.slice(0, 10);
    applyMask(existing, dStart + newDigits.length);
  });

  // Запрет перемещения курсора в зону PREFIX при клике/перемещении
  phoneInput.addEventListener('click', () => {
    const pos = phoneInput.selectionStart;
    if (pos < PREFIX.length) {
      phoneInput.setSelectionRange(PREFIX.length, PREFIX.length);
    }
  });
  phoneInput.addEventListener('keyup', (e) => {
    if (['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) {
      if (phoneInput.selectionStart < PREFIX.length) {
        phoneInput.setSelectionRange(PREFIX.length, PREFIX.length);
      }
    }
  });

  // При потере фокуса — проверяем полноту
  phoneInput.addEventListener('blur', () => {
    const digits = getRawDigits(phoneInput.value);
    if (phoneInput.value && phoneInput.value !== PREFIX && digits.length < 10) {
      setFieldState(phoneInput, 'error');
      showError('errPhone');
    } else if (digits.length === 10) {
      setFieldState(phoneInput, 'valid');
      hideError('errPhone');
    } else {
      phoneInput.value = '';
      setFieldState(phoneInput, 'neutral');
    }
  });
}

/* --- Валидация Email в реальном времени --- */
const emailInput = document.getElementById('fieldEmail');

if (emailInput) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  emailInput.addEventListener('blur', () => {
    const val = emailInput.value.trim();
    if (val === '') {
      setFieldState(emailInput, 'neutral');
      hideError('errEmail');
      return;
    }
    if (!emailRegex.test(val)) {
      setFieldState(emailInput, 'error');
      showError('errEmail');
    } else {
      setFieldState(emailInput, 'valid');
      hideError('errEmail');
    }
  });

  emailInput.addEventListener('input', () => {
    const val = emailInput.value.trim();
    if (emailInput.classList.contains('field--error') && emailRegex.test(val)) {
      setFieldState(emailInput, 'valid');
      hideError('errEmail');
    }
  });
}

/* --- Имя — базовая проверка при blur --- */
const nameInput = document.getElementById('fieldName');
if (nameInput) {
  nameInput.addEventListener('blur', () => {
    if (!nameInput.value.trim()) {
      setFieldState(nameInput, 'error');
      showError('errName');
    } else {
      setFieldState(nameInput, 'valid');
      hideError('errName');
    }
  });
  nameInput.addEventListener('input', () => {
    if (nameInput.value.trim()) {
      setFieldState(nameInput, 'valid');
      hideError('errName');
    }
  });
}

/* --- Вспомогательные функции --- */
function setFieldState(input, state) {
  input.classList.remove('field--error', 'field--valid');
  if (state === 'error') input.classList.add('field--error');
  if (state === 'valid') input.classList.add('field--valid');
}
function showError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('visible');
}
function hideError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('visible');
}

/* ===========================
   FORM — ОТПРАВКА ЧЕРЕЗ FORMSPREE
   ===========================
   НАСТРОЙКА:
   1. Зайдите на https://formspree.io → Sign Up (бесплатно)
   2. Нажмите «+ New Form», укажите email Oleg2244@list.ru
   3. Скопируйте ID (например: xpznabcd)
   4. Замените YOUR_FORMSPREE_ID ниже на ваш реальный ID
   =========================== */
const FORMSPREE_ID = 'meewgrqb';

const submitBtn = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');
const contactForm = document.getElementById('contactForm');

if (submitBtn) {
  submitBtn.addEventListener('click', async () => {
    let valid = true;
    const emailRegexFinal = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    // Проверка имени
    const nameVal = nameInput ? nameInput.value.trim() : '';
    if (!nameVal) {
      setFieldState(nameInput, 'error');
      showError('errName');
      valid = false;
    }

    // Проверка телефона
    const phoneDigits = phoneInput ? phoneInput.value.replace(/\D/g, '').replace(/^[78]/, '') : '';
    if (phoneDigits.length < 10) {
      setFieldState(phoneInput, 'error');
      showError('errPhone');
      if (phoneInput && (!phoneInput.value || phoneInput.value === '+7 (')) phoneInput.value = '';
      valid = false;
    }

    // Проверка email (если заполнен)
    const emailVal = emailInput ? emailInput.value.trim() : '';
    if (emailVal && !emailRegexFinal.test(emailVal)) {
      setFieldState(emailInput, 'error');
      showError('errEmail');
      valid = false;
    }

    if (!valid) {
      // Плавно скроллим к первой ошибке
      const firstError = contactForm.querySelector('.field--error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    submitBtn.disabled = true;
    submitBtn.querySelector('.btn__text').style.display = 'none';
    submitBtn.querySelector('.btn__loader').style.display = 'inline';

    const data = {
      name: nameVal,
      phone: phoneInput.value,
      email: emailVal || '—',
      property_type: contactForm.querySelector('select[name="property_type"]').value || '—',
      price: contactForm.querySelector('input[name="price"]').value || '—',
      message: contactForm.querySelector('textarea[name="message"]').value || '—',
      _subject: 'Новая заявка с сайта IZHBER Group',
    };

    try {
      if (FORMSPREE_ID === 'YOUR_FORMSPREE_ID') {
        await new Promise(r => setTimeout(r, 1200));
      } else {
        const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
          body: new URLSearchParams(data).toString(),
        });
        if (!res.ok) throw new Error('Ошибка отправки');
      }

      contactForm.querySelectorAll('.form__row, .form__group, .form__check, button').forEach(el => {
        el.style.display = 'none';
      });
      formSuccess.style.display = 'block';

    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn__text').style.display = 'inline';
      submitBtn.querySelector('.btn__loader').style.display = 'none';
      alert('Не удалось отправить заявку. Позвоните нам: +7 (916) 024-22-11');
    }
  });
}

const priceInput = document.getElementById('fieldPrice');
if (priceInput) {
  const formatPriceInput = (value) => {
    const digits = value.replace(/\D/g, '');
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  priceInput.addEventListener('input', () => {
    priceInput.value = formatPriceInput(priceInput.value);
  });

  priceInput.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    priceInput.value = formatPriceInput(text);
  });
}

/* ===========================
   SECTION JUMPS
   =========================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      if (target.classList.contains('service-card')) {
        document.querySelectorAll('.service-card.is-highlighted').forEach(card => {
          card.classList.remove('is-highlighted');
        });
        target.classList.add('animated');
        target.classList.add('is-highlighted');
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - (window.innerHeight / 2) + (target.offsetHeight / 2)
        });
      } else {
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80 });
      }
    }
  });
});

/* ===========================
   ADV CARDS STAGGER
   =========================== */
document.querySelectorAll('.adv-card').forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
});
const advObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, parseInt(entry.target.dataset.delay || 0));
      advObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.adv-card').forEach(card => advObserver.observe(card));
