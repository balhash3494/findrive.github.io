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
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

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
   FORM — ОТПРАВКА ЧЕРЕЗ FORMSPREE
   ===========================
   НАСТРОЙКА:
   1. Зайдите на https://formspree.io → Sign Up (бесплатно)
   2. Нажмите «+ New Form», укажите email Oleg2244@list.ru
   3. Скопируйте ID (например: xpznabcd)
   4. Замените YOUR_FORMSPREE_ID ниже на ваш реальный ID
   =========================== */
const FORMSPREE_ID = 'YOUR_FORMSPREE_ID'; // ← вставьте сюда ваш ID

const submitBtn = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');
const contactForm = document.getElementById('contactForm');

if (submitBtn) {
  submitBtn.addEventListener('click', async () => {
    // Валидация обязательных полей
    const required = contactForm.querySelectorAll('input[required]');
    let valid = true;
    required.forEach(inp => {
      if (!inp.value.trim()) {
        inp.style.borderColor = '#ef4444';
        valid = false;
        setTimeout(() => inp.style.borderColor = '', 2500);
      }
    });
    if (!valid) return;

    submitBtn.disabled = true;
    submitBtn.querySelector('.btn__text').style.display = 'none';
    submitBtn.querySelector('.btn__loader').style.display = 'inline';

    // Собираем данные формы
    const data = {
      name: contactForm.querySelector('input[name="name"]').value,
      phone: contactForm.querySelector('input[name="phone"]').value,
      email: contactForm.querySelector('input[name="email"]').value || '—',
      property_type: contactForm.querySelector('select[name="property_type"]').value || '—',
      price: contactForm.querySelector('input[name="price"]').value || '—',
      message: contactForm.querySelector('textarea[name="message"]').value || '—',
      _subject: 'Новая заявка с сайта ФинДрайв',
    };

    try {
      if (FORMSPREE_ID === 'YOUR_FORMSPREE_ID') {
        // Демо-режим: форма не настроена — просто показываем успех
        await new Promise(r => setTimeout(r, 1200));
      } else {
        const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Ошибка отправки');
      }

      // Успех
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

/* ===========================
   SMOOTH SCROLL
   =========================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
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
