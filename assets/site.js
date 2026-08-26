/* 99's Tailoring & Alterations — site behaviour.
   Reviews, contact form, mobile menu, Calendly. Nothing else. */

/* ================================================================
   SITE CONFIG — the only things you should ever need to edit
   ================================================================ */

// Google reviews.
//
// The rating, the review count and the ten reviews are written into
// index.html, so search engines can read them. Edit them there.
//
// Filling in BOTH values below makes the page fetch its rating, count and
// reviews live from Google instead. Read the README first: the free tier is
// 1,000 calls a month and one page view is one call.
const GOOGLE = {
  apiKey: "",
  placeId: "",
  placeUrl: "https://www.google.com/maps/search/?api=1&query=99%27s%20Tailoring%20%26%20Alterations%2C%201582%20S%20Parker%20Rd%20Ste%20304%2C%20Denver%2C%20CO%2080231"
};

/* ================================================================
   Google reviews rendering
   ================================================================ */
function starRow(rating, size) {
  const px = size || 16;
  let html = '';
  for (let i = 1; i <= 5; i++) {
    const filled = rating >= i - 0.5;   // half a star rounds up, as everywhere else
    html += '<svg aria-hidden="true" class="ic ic-star' + (filled ? ' ic-fill' : '') +
            '" style="width:' + px + 'px;height:' + px + 'px' +
            (filled ? '' : ';opacity:.35') + '"><use href="#i-star"></use></svg>';
  }
  return '<span role="img" aria-label="' + rating + ' out of 5 stars" class="flex gap-0.5">' + html + '</span>';
}

function renderReviews(data) {
  const hasRating = typeof data.rating === 'number';
  const starsEl = document.getElementById('g-stars');
  const ratingEl = document.getElementById('g-rating');
  if (hasRating) {
    starsEl.innerHTML = starRow(data.rating, 18);
    starsEl.setAttribute('aria-label', data.rating + ' out of 5 stars');
    ratingEl.textContent = data.rating.toFixed(1);
  }
  if (typeof data.total === 'number' && data.total > 0) {
    document.getElementById('g-count').textContent =
      data.total + (data.totalIsMinimum ? '+' : '') +
      ' Google review' + (data.total === 1 && !data.totalIsMinimum ? '' : 's');
  }
  if (data.reviews && data.reviews.length) {
    const grid = document.getElementById('review-grid');
    grid.innerHTML = data.reviews.map(function (r) {
      return '' +
        '<article class="review-card bg-white p-6 rounded-lg border border-slate-200 shadow-sm">' +
          '<div class="flex items-center justify-between mb-3">' +
            starRow(r.rating || 5, 16) +
            '<svg viewBox="0 0 48 48" class="flex-none" style="width:17px;height:17px" aria-hidden="true"><use href="#i-google"></use></svg>' +
          '</div>' +
          '<p class="text-sm text-slate-600 leading-relaxed mb-4">&ldquo;' + escapeHtml(r.text) + '&rdquo;</p>' +
          '<cite class="text-xs font-medium text-slate-400 uppercase tracking-wide not-italic">' + escapeHtml(r.author) + '</cite>' +
        '</article>';
    }).join('');
    collapseReviews();
  }
}

/* Three reviews show on the page; the rest open in a scrollable overlay
   that blurs the site behind it. All ten stay in the HTML either way, so
   crawlers see them and a visitor without JS simply gets the lot. */
function collapseReviews() {
  const grid = document.getElementById('review-grid');
  const btn = document.getElementById('reviews-more');
  const dlg = document.getElementById('reviews-dialog');
  if (!grid || !btn) return;

  const cards = grid.querySelectorAll('.review-card');
  const extras = grid.querySelectorAll('[data-extra]');
  if (!extras.length) return;
  extras.forEach(el => { el.hidden = true; });
  btn.classList.remove('hidden');
  btn.textContent = 'Show more';

  /* No <dialog> support: fall back to revealing them in place. */
  if (!dlg || typeof dlg.showModal !== 'function') {
    btn.addEventListener('click', function () {
      extras.forEach(el => { el.hidden = false; });
      btn.remove();
    }, { once: true });
    return;
  }

  if (dlg.parentNode !== document.body) document.body.appendChild(dlg);

  const list = dlg.querySelector('#reviews-dialog-list');
  const label = dlg.querySelector('#reviews-dialog-count');
  const closeBtn = dlg.querySelector('#reviews-close');

  function fill() {
    list.textContent = '';
    cards.forEach(function (card) {
      const copy = card.cloneNode(true);
      copy.hidden = false;
      copy.removeAttribute('data-extra');
      list.appendChild(copy);
    });
    if (label) {
      const rating = (document.getElementById('g-rating') || {}).textContent;
      const count = (document.getElementById('g-count') || {}).textContent;
      label.textContent = (rating ? rating + ' out of 5' : '') +
                          (rating && count ? ' \u00b7 ' : '') + (count || '');
    }
  }

  function lock(on) {
    if (on) {
      const bar = window.innerWidth - document.documentElement.clientWidth;
      if (bar > 0) document.body.style.paddingRight = bar + 'px';
      document.body.classList.add('reviews-open');
    } else {
      document.body.classList.remove('reviews-open');
      document.body.style.paddingRight = '';
    }
  }

  btn.addEventListener('click', function () {
    fill();
    dlg.showModal();
    lock(true);
    list.scrollTop = 0;
  });
  closeBtn.addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('close', function () { lock(false); btn.focus(); });
  /* Clicking the dimmed area closes it; the dialog box itself does not. */
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

// The reviews and rating are already in the HTML. Only collapse the
// overflow here; renderReviews runs solely for live Google data.
collapseReviews();

// …then upgrade to live Google data if an API key + Place ID are set.
(function liveGoogleReviews() {
  if (!document.getElementById('review-grid')) return;
  if (!GOOGLE.apiKey || !GOOGLE.placeId) return;
  fetch('https://places.googleapis.com/v1/places/' + encodeURIComponent(GOOGLE.placeId) +
        '?fields=rating,userRatingCount,googleMapsUri,reviews&key=' + encodeURIComponent(GOOGLE.apiKey))
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function (p) {
      const live = {
        rating: typeof p.rating === 'number' ? p.rating : GOOGLE.rating,
        total: typeof p.userRatingCount === 'number' ? p.userRatingCount : GOOGLE.total,
        totalIsMinimum: typeof p.userRatingCount === 'number' ? false : GOOGLE.totalIsMinimum,
        reviews: (p.reviews || []).map(function (r) {
          return {
            author: (r.authorAttribution && r.authorAttribution.displayName) || 'Google user',
            rating: r.rating || 5,
            text: (r.originalText && r.originalText.text) || (r.text && r.text.text) || '',
            when: r.relativePublishTimeDescription || ''
          };
        }).filter(function (r) { return r.text; })
      };
      if (p.googleMapsUri) { GOOGLE.placeUrl = p.googleMapsUri; }
      if (!live.reviews.length) { live.reviews = GOOGLE.reviews; }
      renderReviews(live);
    })
    .catch(function () { /* keep the built-in reviews on any failure */ });
})();


/* ================================================================
   Contact form
   ================================================================ */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const btn = document.getElementById('submit-btn');
  const result = document.getElementById('form-result');
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    btn.textContent = 'Sending...';
    btn.disabled = true;
    try {
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: new FormData(form) });
      const json = await res.json();
      result.classList.remove('hidden');
      if (json.success) {
        result.textContent = 'Message sent! We will get back to you soon.';
        result.style.color = '#5E4326';
        form.reset();
      } else {
        result.textContent = 'Something went wrong. Please call us directly at (720) 499-2341.';
        result.style.color = '#A3231B';
      }
    } catch (err) {
      result.classList.remove('hidden');
      result.textContent = 'Something went wrong. Please call us directly at (720) 499-2341.';
      result.style.color = '#A3231B';
    }
    btn.textContent = 'Send Message';
    btn.disabled = false;
  });
})();

/* ================================================================
   Calendly
   ================================================================ */
function ensureCalendly(attempt) {
  const el = document.querySelector('.calendly-inline-widget');
  if (!el || el.querySelector('iframe')) return;
  if (window.Calendly && window.Calendly.initInlineWidget) {
    window.Calendly.initInlineWidget({ url: el.getAttribute('data-url'), parentElement: el });
  } else if ((attempt || 0) < 12) {
    setTimeout(function () { ensureCalendly((attempt || 0) + 1); }, 250);
  } else {
    const fb = document.getElementById('calendly-fallback');
    if (fb) { fb.classList.remove('hidden'); fb.classList.add('flex'); }
  }
}


/* ================================================================
   Mobile menu
   ================================================================ */
(function () {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  function setMenu(open) {
    menu.classList.toggle('hidden', !open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  btn.addEventListener('click', function () { setMenu(menu.classList.contains('hidden')); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.classList.contains('hidden')) { setMenu(false); btn.focus(); }
  });
  document.addEventListener('pointerdown', function (e) {
    if (menu.classList.contains('hidden')) return;
    if (!menu.contains(e.target) && !btn.contains(e.target)) setMenu(false);
  });
})();

if (document.querySelector('.calendly-inline-widget')) ensureCalendly();
