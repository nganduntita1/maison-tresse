/* Maison Tresse — storefront behaviour + motion */
(() => {
  'use strict';

  const D = window.MT_DATA;
  const { HeroStrands, HairStudio, hex } = window.MTHair;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const img = D.img;
  const money = n => '$' + Math.round(n).toLocaleString('en-US');
  const icon = (name, cls = '') => `<svg class="i ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const byId = id => D.products.find(p => p.id === id);
  const priceFor = (p, len) => p.price + (len - p.length) * 10;
  const store = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } }
  };

  const gsap = window.gsap;
  const hasGSAP = !!(gsap && window.ScrollTrigger);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ================================================================
     Rendering
     ================================================================ */
  function renderBestsellers() {
    const end = $('.hs__end');
    const html = D.products.filter(p => p.best).map((p, i) => `
      <article class="feature" data-id="${p.id}">
        <div class="feature__media" data-open="${p.id}" data-cursor="View">
          <div class="feature__zoom"><img src="${img(p.img, 900)}" alt="${p.name} — ${p.style}, ${p.color}"></div>
          <span class="feature__num">${String(i + 1).padStart(2, '0')}</span>
          ${p.badge ? `<span class="pill">${p.badge}</span>` : ''}
        </div>
        <div class="feature__body">
          <div>
            <h3 class="feature__name">${p.name}</h3>
            <p class="feature__meta">${p.style} · ${p.length}" · ${p.lace}</p>
          </div>
          <div class="feature__buy">
            <span class="feature__price">${money(p.price)}</span>
            <button class="round-add" data-add="${p.id}" aria-label="Add ${p.name} to bag">${icon('plus')}</button>
          </div>
        </div>
      </article>`).join('');
    end.insertAdjacentHTML('beforebegin', html);
  }

  function renderGrid() {
    $('#grid').innerHTML = D.products.map((p, i) => `
      <article class="card" data-id="${p.id}" data-index="${i}" data-tags="${p.tags.join(' ')}" data-price="${p.price}" data-rating="${p.rating}">
        <div class="card__in">
          <div class="card__media" data-open="${p.id}" data-cursor="View">
            <img src="${img(p.img, 700)}" alt="${p.name} — ${p.style}, ${p.color}" loading="lazy">
            ${p.badge ? `<span class="pill pill--light">${p.badge}</span>` : ''}
            <button class="card__wish" data-wish="${p.id}" aria-label="Save ${p.name} to wishlist" aria-pressed="false">${icon('heart')}</button>
            <div class="card__quick">
              <button class="card__add" data-add="${p.id}"><span>Quick add</span><span>${money(p.price)}</span></button>
            </div>
          </div>
          <div class="card__body">
            <div class="card__row">
              <h3 class="card__name">${p.name}</h3>
              <span class="card__price">${p.compare ? `<s>${money(p.compare)}</s>` : ''}${money(p.price)}</span>
            </div>
            <p class="card__meta">${p.style} · ${p.length}" · ${p.color}</p>
            <div class="card__foot">
              <span class="swatches">${p.swatches.map(c => `<i style="--c:${c}"></i>`).join('')}</span>
              <span class="rating">${icon('star', 'i--fill')} ${p.rating.toFixed(1)} <em>(${p.reviews.toLocaleString('en-US')})</em></span>
            </div>
          </div>
        </div>
      </article>`).join('');
  }

  function renderLookbook() {
    const cols = [[], [], [], []];
    D.lookbook.forEach((it, i) => cols[i % 4].push(it));
    const speeds = [0.9, 1.15, 0.85, 1.12];
    $('#lookCols').innerHTML = cols.map((col, ci) => `
      <div class="look__col" data-speed="${speeds[ci]}">
        ${col.map(it => {
          const p = byId(it.product);
          return `<figure class="look__item" data-open="${it.product}" data-cursor="Shop">
            <img src="${img(it.img, 600)}" alt="${it.alt}" loading="lazy">
            <figcaption><span>Styled in ${p ? p.name : 'Maison Tresse'}</span>${icon('arrow-ur')}</figcaption>
          </figure>`;
        }).join('')}
      </div>`).join('');
  }

  function renderReviews() {
    const card = r => `
      <figure class="review">
        <div class="review__stars">${icon('star', 'i--fill').repeat(5)}</div>
        <blockquote>“${r.text}”</blockquote>
        <figcaption>
          <span class="avatar">${r.name[0]}</span>
          <span><b>${r.name}</b><small>${r.city} · ${r.product}</small></span>
          <span class="verified">${icon('check')}Verified</span>
        </figcaption>
      </figure>`;
    const half = Math.ceil(D.reviews.length / 2);
    [[$('#reviewsA'), D.reviews.slice(0, half)], [$('#reviewsB'), D.reviews.slice(half)]].forEach(([el, list]) => {
      const set = list.map(card).join('');
      el.innerHTML = `<div class="reviews__set">${set}</div><div class="reviews__set" aria-hidden="true">${set}</div>`;
    });
  }

  function renderAvatars() {
    $('#heroAvatars').innerHTML = D.avatars.map(id => `<img src="${img(id, 80, 80)}&crop=faces" alt="" loading="lazy">`).join('');
  }

  function renderStudioControls() {
    const S = D.studio, I = S.initial;
    const chips = (name, list, cur) => list.map(o => `<label class="chip"><input type="radio" name="${name}" value="${o.id}"${o.id === cur ? ' checked' : ''}><span>${o.label}</span></label>`).join('');
    $('#stTexture').innerHTML = chips('texture', S.textures, I.texture);
    $('#stDensity').innerHTML = chips('density', S.densities, I.density);
    $('#stLace').innerHTML = chips('lace', S.laces, I.lace);
    $('#stColor').innerHTML = S.colors.map(c => `<label class="swatch" title="${c.label}"><input type="radio" name="color" value="${c.id}" aria-label="${c.label}"${c.id === I.color ? ' checked' : ''}><span style="--r:${c.root};--a:${c.mid};--b:${c.tip}"></span></label>`).join('');
  }

  renderBestsellers();
  renderGrid();
  renderLookbook();
  renderReviews();
  renderAvatars();
  renderStudioControls();

  /* ================================================================
     Small UI helpers (work with or without GSAP)
     ================================================================ */
  function toast(html, thumb) {
    const wrap = $('#toasts');
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = (thumb ? `<img src="${thumb}" alt="">` : icon('sparkle', 'i--fill')) + `<span>${html}</span>`;
    wrap.appendChild(el);
    const all = $$('.toast', wrap);
    if (all.length > 3) all[0].remove();
    if (hasGSAP) {
      gsap.fromTo(el, { y: 30, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out' });
      gsap.to(el, { y: -12, opacity: 0, duration: 0.4, delay: 3.2, ease: 'power2.in', onComplete: () => el.remove() });
    } else setTimeout(() => el.remove(), 3600);
  }

  function fly(fromEl, src) {
    if (!hasGSAP || reduce || !fromEl) return bumpCart();
    const r = fromEl.getBoundingClientRect();
    const t = $('#cartBtn').getBoundingClientRect();
    const size = Math.min(Math.max(r.width, 80), 150);
    const ghost = document.createElement('img');
    ghost.src = src;
    ghost.className = 'fly';
    ghost.alt = '';
    document.body.appendChild(ghost);
    const sx = r.left + r.width / 2, sy = r.top + r.height / 2;
    gsap.set(ghost, { left: sx - size / 2, top: sy - size * 0.6, width: size, height: size * 1.2 });
    const dx = t.left + t.width / 2 - sx, dy = t.top + t.height / 2 - sy;
    gsap.timeline({ onComplete: () => { ghost.remove(); bumpCart(); } })
      .to(ghost, { x: dx, duration: 0.95, ease: 'power2.inOut' }, 0)
      .to(ghost, { y: dy, duration: 0.95, ease: 'back.in(1.4)' }, 0)
      .to(ghost, { scale: 0.14, rotate: 12, borderRadius: '50%', duration: 0.95, ease: 'power2.in' }, 0);
  }

  function bumpCart() {
    if (!hasGSAP) return;
    gsap.fromTo('#cartBtn', { scale: 1 }, { scale: 1.28, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' });
  }

  function burst(el) {
    if (!hasGSAP || reduce) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (let i = 0; i < 10; i++) {
      const d = document.createElement('span');
      d.className = 'burst';
      document.body.appendChild(d);
      const a = (i / 10) * Math.PI * 2;
      gsap.set(d, { left: cx, top: cy, background: i % 2 ? '#c9a27e' : '#b4473b' });
      gsap.to(d, { x: Math.cos(a) * 34, y: Math.sin(a) * 34, scale: 0, duration: 0.7, ease: 'expo.out', onComplete: () => d.remove() });
    }
  }

  /* ================================================================
     Layers (drawer / modal / search / menu)
     ================================================================ */
  let lenis = null;
  let activeLayer = null;
  let lastFocus = null;
  const lockScroll = () => (lenis ? lenis.stop() : (document.body.style.overflow = 'hidden'));
  const unlockScroll = () => (lenis ? lenis.start() : (document.body.style.overflow = ''));

  function openLayer(el, focusSel) {
    if (activeLayer && activeLayer !== el) closeLayer(activeLayer, true);
    lastFocus = document.activeElement;
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    activeLayer = el;
    lockScroll();
    const f = focusSel ? $(focusSel, el) : $('[data-close]:not(.overlay)', el);
    if (f) setTimeout(() => f.focus({ preventScroll: true }), 120);
  }

  function closeLayer(el = activeLayer, swapping = false) {
    if (!el) return;
    el.classList.remove('is-open');
    el.setAttribute('aria-hidden', 'true');
    if (el.id === 'menu') {
      document.body.classList.remove('menu-open');
      $('#burger').setAttribute('aria-expanded', 'false');
      $('#burger use').setAttribute('href', '#i-menu');
    }
    if (activeLayer === el) activeLayer = null;
    if (!swapping) {
      unlockScroll();
      if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    }
  }

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLayer(); });
  $$('.layer').forEach(layer => layer.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) closeLayer(layer);
  }));

  // Mobile menu
  $('#burger').addEventListener('click', () => {
    const menu = $('#menu');
    if (menu.classList.contains('is-open')) return closeLayer(menu);
    openLayer(menu, 'a');
    document.body.classList.add('menu-open');
    $('#burger').setAttribute('aria-expanded', 'true');
    $('#burger use').setAttribute('href', '#i-close');
    if (hasGSAP) gsap.fromTo('.menu__links a', { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.06, duration: 0.9, ease: 'expo.out', delay: 0.2 });
  });

  /* ================================================================
     Cart + wishlist
     ================================================================ */
  const cart = {
    items: store.get('mt-cart', []),
    save() { store.set('mt-cart', this.items); renderCart(); },
    add(item) {
      const found = this.items.find(i => i.key === item.key);
      if (found) found.qty += item.qty || 1;
      else this.items.push({ ...item, qty: item.qty || 1 });
      this.save();
    },
    change(key, delta) {
      const it = this.items.find(i => i.key === key);
      if (!it) return;
      it.qty += delta;
      if (it.qty <= 0) this.items = this.items.filter(i => i !== it);
      this.save();
    },
    remove(key) { this.items = this.items.filter(i => i.key !== key); this.save(); },
    get count() { return this.items.reduce((a, i) => a + i.qty, 0); },
    get total() { return this.items.reduce((a, i) => a + i.qty * i.price, 0); }
  };
  const wish = new Set(store.get('mt-wish', []));

  function renderCart() {
    $('#cartItems').innerHTML = cart.items.map(i => `
      <li class="line" data-key="${i.key}">
        <img src="${i.img}" alt="">
        <div>
          <b>${i.name}</b><small>${i.meta}</small>
          <div class="qty"><button data-qty="-1" aria-label="Decrease quantity">−</button><span>${i.qty}</span><button data-qty="1" aria-label="Increase quantity">+</button></div>
        </div>
        <div class="line__end"><span>${money(i.price * i.qty)}</span><button class="line__rm" data-rm>Remove</button></div>
      </li>`).join('');
    $('#cart').classList.toggle('is-empty', !cart.items.length);
    $$('[data-cart-count]').forEach(el => { el.textContent = cart.count; el.classList.toggle('has', cart.count > 0); });
    $('#cartSubtotal').textContent = money(cart.total);
    const left = Math.max(0, D.freeShip - cart.total);
    $('#shipMsg').innerHTML = left
      ? `You're <b>${money(left)}</b> away from free express shipping`
      : `You've unlocked <b>free express shipping</b> ✦`;
    $('#shipBar').style.transform = `scaleX(${Math.min(1, cart.total / D.freeShip)})`;
  }

  function syncWish() {
    $$('[data-wish]').forEach(b => {
      const on = wish.has(b.dataset.wish);
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on);
    });
    $$('[data-wish-count]').forEach(el => { el.textContent = wish.size; el.classList.toggle('has', wish.size > 0); });
  }

  function addProduct(id, { length, qty = 1 } = {}, sourceEl) {
    const p = byId(id);
    if (!p) return;
    const len = length || p.length;
    cart.add({
      key: `${id}-${len}`, id, name: p.name,
      meta: `${p.style} · ${len}" · ${p.color}`,
      price: priceFor(p, len), img: img(p.img, 200), qty
    });
    fly(sourceEl, img(p.img, 300));
    toast(`<b>${p.name}</b> added to your bag`, img(p.img, 120));
  }

  function toggleWish(id, btn) {
    const p = byId(id);
    if (wish.has(id)) wish.delete(id); else wish.add(id);
    store.set('mt-wish', [...wish]);
    syncWish();
    if (hasGSAP && btn) {
      gsap.fromTo(btn, { scale: 0.7 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1, .4)' });
      if (wish.has(id)) burst(btn);
    }
    toast(wish.has(id) ? `Saved <b>${p.name}</b> to your wishlist` : `Removed <b>${p.name}</b> from your wishlist`);
  }

  $('#cartItems').addEventListener('click', e => {
    const line = e.target.closest('.line');
    if (!line) return;
    const q = e.target.closest('[data-qty]');
    if (q) cart.change(line.dataset.key, +q.dataset.qty);
    if (e.target.closest('[data-rm]')) {
      if (hasGSAP) gsap.to(line, { x: 60, opacity: 0, duration: 0.35, ease: 'power2.in', onComplete: () => cart.remove(line.dataset.key) });
      else cart.remove(line.dataset.key);
    }
  });

  $('#cartBtn').addEventListener('click', () => {
    openLayer($('#cart'));
    if (hasGSAP && cart.items.length) gsap.fromTo('#cartItems .line', { x: 40, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.06, duration: 0.7, ease: 'expo.out', delay: 0.2 });
  });
  $('#checkout').addEventListener('click', () => toast('This is a demo store — checkout isn’t connected yet.'));

  /* ================================================================
     Quick view
     ================================================================ */
  const qv = { id: null, len: 0, qty: 1 };
  function updateQV() {
    const p = byId(qv.id);
    const price = priceFor(p, qv.len);
    $('#qvPrice').innerHTML = money(price * qv.qty) + (p.compare && qv.len === p.length ? `<s>${money(p.compare)}</s>` : '');
    $('#qvQty').textContent = qv.qty;
  }
  function openQV(id) {
    const p = byId(id);
    if (!p) return;
    Object.assign(qv, { id, len: p.length, qty: 1 });
    const im = $('#qvImg');
    im.src = img(p.img, 1100);
    im.alt = `${p.name} — ${p.style}, ${p.color}`;
    $('#qvStyle').textContent = `${p.style} · ${p.lace}`;
    $('#qvName').textContent = p.name;
    $('#qvRating').innerHTML = icon('star', 'i--fill').repeat(5) + `<span>${p.rating.toFixed(1)} · ${p.reviews.toLocaleString('en-US')} reviews</span>`;
    $('#qvDesc').textContent = p.desc;
    $('#qvLengths').innerHTML = p.lengths.map(l => `<label class="chip"><input type="radio" name="qvlen" value="${l}"${l === p.length ? ' checked' : ''}><span>${l}"</span></label>`).join('');
    $('#qvSpecs').innerHTML = [['Colour', p.color], ['Lace', p.lace], ['Density', p.density], ['Hair', '100% virgin human hair'], ['Cap', 'Medium · adjustable band']]
      .map(([k, v]) => `<li><span>${k}</span><b>${v}</b></li>`).join('');
    updateQV();
    openLayer($('#qv'));
    if (hasGSAP) {
      gsap.fromTo(im, { scale: 1.25 }, { scale: 1, duration: 1.6, ease: 'expo.out' });
      gsap.fromTo('.qv__info > *', { y: 26, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.04, duration: 0.8, ease: 'expo.out', delay: 0.15 });
    }
  }
  $('#qvLengths').addEventListener('change', e => { qv.len = +e.target.value; updateQV(); });
  $('#qvMinus').addEventListener('click', () => { qv.qty = Math.max(1, qv.qty - 1); updateQV(); });
  $('#qvPlus').addEventListener('click', () => { qv.qty = Math.min(9, qv.qty + 1); updateQV(); });
  $('#qvAdd').addEventListener('click', () => {
    const src = $('#qvImg');
    addProduct(qv.id, { length: qv.len, qty: qv.qty }, src);
    closeLayer($('#qv'));
  });

  /* ================================================================
     Search (also used to show the wishlist)
     ================================================================ */
  const searchInput = $('#searchInput');
  function renderResults(list, title) {
    $('#searchTitle').textContent = title;
    $('#searchResults').innerHTML = list.length
      ? list.map(p => `<button class="sr" data-open="${p.id}"><img src="${img(p.img, 400)}" alt=""><b>${p.name}</b><small>${p.style} · ${p.color} · ${money(p.price)}</small></button>`).join('')
      : `<p class="search__empty">Nothing here yet — try “curly”, “blonde” or “bob”.</p>`;
    if (hasGSAP) gsap.fromTo('#searchResults > *', { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.04, duration: 0.6, ease: 'expo.out' });
  }
  function runSearch() {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) return renderResults(D.products.filter(p => p.best), 'Popular right now');
    const words = q.split(/\s+/);
    const res = D.products.filter(p => {
      const hay = [p.name, p.style, p.color, p.lace, p.keywords || '', ...p.tags].join(' ').toLowerCase();
      return words.every(w => hay.includes(w));
    });
    renderResults(res, `${res.length} result${res.length === 1 ? '' : 's'} for “${searchInput.value.trim()}”`);
  }
  searchInput.addEventListener('input', runSearch);
  $$('.search__tags [data-q]').forEach(b => b.addEventListener('click', () => { searchInput.value = b.dataset.q; runSearch(); }));
  $('#searchBtn').addEventListener('click', () => { searchInput.value = ''; runSearch(); openLayer($('#search'), '#searchInput'); });
  $('#wishBtn').addEventListener('click', () => {
    searchInput.value = '';
    renderResults(D.products.filter(p => wish.has(p.id)), wish.size ? `Your wishlist · ${wish.size}` : 'Your wishlist is empty — tap the heart on any style');
    openLayer($('#search'));
  });

  /* ================================================================
     Global delegated clicks
     ================================================================ */
  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add]');
    if (add) {
      e.preventDefault();
      const host = add.closest('.card, .feature');
      addProduct(add.dataset.add, {}, host ? $('img', host) : add);
      return;
    }
    const w = e.target.closest('[data-wish]');
    if (w) { e.preventDefault(); toggleWish(w.dataset.wish, w); return; }
    const open = e.target.closest('[data-open]');
    if (open) { e.preventDefault(); openQV(open.dataset.open); }
  });

  /* ================================================================
     Shop filters + sort
     ================================================================ */
  const grid = $('#grid');
  const pill = $('.filters__pill');
  const filterBtns = $$('.filters button');
  let currentFilter = 'all';

  function movePill(btn, instant) {
    if (!hasGSAP) return;
    gsap.to(pill, { x: btn.offsetLeft, width: btn.offsetWidth, duration: instant ? 0 : 0.7, ease: 'expo.out' });
  }

  function flipGrid(mutate) {
    const cards = $$('.card', grid);
    if (!hasGSAP || !window.Flip) { mutate(cards); return; }
    const state = Flip.getState(cards);
    const h0 = grid.offsetHeight;
    mutate(cards);
    const h1 = grid.offsetHeight;
    gsap.fromTo(grid, { height: h0 }, { height: h1, duration: 0.8, ease: 'expo.inOut', clearProps: 'height' });
    Flip.from(state, {
      duration: 0.8, ease: 'expo.inOut', scale: true, absolute: true, stagger: 0.015,
      onEnter: els => gsap.fromTo(els, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.7, delay: 0.25, ease: 'expo.out' }),
      onLeave: els => gsap.to(els, { opacity: 0, scale: 0.85, duration: 0.4, ease: 'power2.in' }),
      onComplete: () => window.ScrollTrigger && ScrollTrigger.refresh()
    });
  }

  filterBtns.forEach(btn => btn.addEventListener('click', () => {
    if (btn.dataset.filter === currentFilter) return;
    currentFilter = btn.dataset.filter;
    filterBtns.forEach(b => { const on = b === btn; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on); });
    movePill(btn);
    flipGrid(cards => {
      let n = 0;
      cards.forEach(c => {
        const show = currentFilter === 'all' || c.dataset.tags.split(' ').includes(currentFilter);
        c.classList.toggle('is-hidden', !show);
        if (show) n++;
      });
      $('#resultCount').textContent = n;
    });
  }));

  $('#sort').addEventListener('change', e => {
    const v = e.target.value;
    const cmp = {
      featured: (a, b) => a.dataset.index - b.dataset.index,
      low: (a, b) => a.dataset.price - b.dataset.price,
      high: (a, b) => b.dataset.price - a.dataset.price,
      rating: (a, b) => b.dataset.rating - a.dataset.rating
    }[v];
    flipGrid(cards => cards.slice().sort(cmp).forEach(c => grid.appendChild(c)));
  });

  /* ================================================================
     Wig Studio
     ================================================================ */
  function initStudio() {
    const S = D.studio;
    const state = { ...S.initial };
    const hair = new HairStudio($('#studioCanvas'));
    const find = (list, id) => list.find(o => o.id === id);
    const priceEl = $('#stPrice');
    const shown = { v: 0 };
    let first = true;

    const current = () => ({
      t: find(S.textures, state.texture),
      c: find(S.colors, state.color),
      d: find(S.densities, state.density),
      l: find(S.laces, state.lace)
    });
    const priceOf = ({ t, c, d, l }) => t.base + (state.length - S.minLen) * S.perInch + c.fee + d.fee + l.fee;

    function swapText(el, txt) {
      if (el.textContent === txt) return;
      if (!hasGSAP || first) { el.textContent = txt; return; }
      gsap.to(el, {
        yPercent: -110, duration: 0.3, ease: 'power2.in', overwrite: true,
        onComplete: () => { el.textContent = txt; gsap.fromTo(el, { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: 'expo.out' }); }
      });
    }

    function apply() {
      const cur = current();
      const { t, c, d } = cur;
      const [r0, g0, b0] = hex(c.root), [r1, g1, b1] = hex(c.mid), [r2, g2, b2] = hex(c.tip);
      hair.to({
        ...t.p,
        length: (state.length - S.minLen) / (S.maxLen - S.minLen),
        tuck: state.length <= 14 && state.texture !== 'kinky' ? 1 : 0,
        count: d.count, r0, g0, b0, r1, g1, b1, r2, g2, b2
      }, first ? 0 : 1.3);

      const price = priceOf(cur);
      if (hasGSAP && !first) gsap.to(shown, { v: price, duration: 0.9, ease: 'power3.out', onUpdate: () => { priceEl.textContent = money(shown.v); } });
      else { shown.v = price; priceEl.textContent = money(price); }

      const range = $('#stLength');
      range.style.setProperty('--pct', ((state.length - S.minLen) / (S.maxLen - S.minLen)) * 100 + '%');
      $('#stLenVal').textContent = state.length + '"';
      $('#stTextureVal').textContent = t.label;
      $('#stColorVal').textContent = c.label;
      swapText($('#stName'), t.label);
      $('#stSpec').textContent = `${state.length}" · ${c.label}`;
      first = false;
    }

    $('.panel').addEventListener('change', e => {
      const { name, value } = e.target;
      if (name in state) { state[name] = value; apply(); }
    });
    $('#stLength').addEventListener('input', e => { state.length = +e.target.value; apply(); });
    $('#stage').addEventListener('pointerenter', () => $('#stage').classList.add('is-touched'), { once: true });

    $('#stAdd').addEventListener('click', () => {
      const cur = current();
      const { t, c, d, l } = cur;
      const thumb = hair.snapshot(180);
      cart.add({
        key: `custom-${state.texture}-${state.length}-${state.color}-${state.density}-${state.lace}`,
        id: 'custom', name: `Custom ${t.label}`,
        meta: `${state.length}" · ${c.label} · ${d.label} · ${l.label}`,
        price: priceOf(cur), img: thumb
      });
      fly($('#studioCanvas'), thumb);
      toast(`Your <b>custom ${t.label.toLowerCase()}</b> unit is in your bag`, thumb);
    });

    apply();
  }

  /* ================================================================
     Boot without GSAP (CDN blocked / offline): everything still works
     ================================================================ */
  renderCart();
  syncWish();

  if (!hasGSAP) {
    document.documentElement.className = 'no-js';
    $('#loader')?.remove();
    document.body.classList.remove('is-loading');
    new HeroStrands($('#heroStrands'), $('.hero'), { still: reduce });
    initStudio();
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (a && a.getAttribute('href').length > 1) closeLayer();
    });
    return;
  }

  /* ================================================================
     Motion
     ================================================================ */
  gsap.registerPlugin(ScrollTrigger);
  if (window.Flip) gsap.registerPlugin(Flip);
  window.scrollTo(0, 0);

  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  // In-page anchors
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    if (activeLayer) closeLayer();
    if (lenis) lenis.scrollTo(target, { offset: id === '#top' ? 0 : -20, duration: 1.6 });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });
  $('#toTop').addEventListener('click', () => (lenis ? lenis.scrollTo(0, { duration: 2 }) : window.scrollTo({ top: 0, behavior: 'smooth' })));

  /* ---------- split text ---------- */
  function split(el, mode = 'chars') {
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    const walk = (node, parent) => {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { parent.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span');
          w.className = 'w';
          if (mode === 'chars') {
            for (const ch of part) {
              const c = document.createElement('span');
              c.className = 'c';
              c.textContent = ch;
              w.appendChild(c);
            }
          } else {
            const wi = document.createElement('span');
            wi.className = 'wi';
            wi.textContent = part;
            w.appendChild(wi);
          }
          parent.appendChild(w);
        });
      } else if (node.nodeType === 1) {
        const clone = node.cloneNode(false);
        node.childNodes.forEach(n => walk(n, clone));
        parent.appendChild(clone);
      }
    };
    const frag = document.createDocumentFragment();
    Array.from(el.childNodes).forEach(n => walk(n, frag));
    el.textContent = '';
    el.appendChild(frag);
    if (mode === 'chars') {
      el.setAttribute('aria-label', label);
      $$('.w', el).forEach(w => w.setAttribute('aria-hidden', 'true'));
    }
    return $$(mode === 'chars' ? '.c' : '.wi', el);
  }

  /* ---------- hero ---------- */
  const strands = new HeroStrands($('#heroStrands'), $('.hero'), { still: reduce });
  strands.reveal = 0;
  const heroChars = $$('.hero__title .line').flatMap(line => split(line));
  $('.hero__title').setAttribute('aria-label', 'Hair that moves like you do.');

  function ghostComb() {
    const gh = strands.ghost;
    Object.assign(gh, { on: true, x: strands.w * 1.05, y: strands.h * 0.15 });
    gsap.to(gh, { x: strands.w * 0.4, y: strands.h * 0.9, duration: 2.4, ease: 'power2.inOut', onComplete: () => { gh.on = false; } });
  }

  function heroIntro() {
    return gsap.timeline()
      .from(heroChars, { yPercent: 118, rotate: 7, transformOrigin: '0% 100%', duration: 1.35, stagger: 0.022, ease: 'expo.out' }, 0)
      .from('.hero .eyebrow', { opacity: 0, x: -24, duration: 1, ease: 'power3.out' }, 0.2)
      .from(['.hero__lead', '.hero__ctas', '.hero__proof'], { opacity: 0, y: 30, duration: 1.1, stagger: 0.1, ease: 'power3.out' }, 0.45)
      .fromTo('.arch__in', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' }, 0)
      .from('.arch img', { scale: 1.4, duration: 2.4, ease: 'expo.out' }, 0.3)
      .from('.arch-outline', { opacity: 0, scale: 0.9, duration: 1.6, ease: 'expo.out' }, 0.7)
      .from('.spin-badge', { scale: 0, rotate: -140, duration: 1.3, ease: 'back.out(1.5)' }, 0.95)
      .from('.float-card', { opacity: 0, y: 40, duration: 1.1, ease: 'expo.out' }, 1.1)
      .from('.hero__scroll', { opacity: 0, duration: 1 }, 1.3)
      .to(strands, { reveal: 1, duration: 2.8, ease: 'power2.inOut' }, 0)
      .add(ghostComb, 1.0);
  }

  function runLoader() {
    const loader = $('#loader');
    const chars = split($('.loader__brand'));
    const count = $('.loader__count');
    const o = { v: 0 };
    const done = () => {
      loader.remove();
      document.body.classList.remove('is-loading');
      if (lenis) lenis.start();
      ScrollTrigger.refresh();
    };
    if (reduce) {
      gsap.set(loader, { autoAlpha: 0 });
      done();
      strands.reveal = 1;
      return;
    }
    gsap.timeline()
      .from(chars, { yPercent: 120, duration: 1.1, stagger: 0.04, ease: 'expo.out' }, 0.1)
      .from('.loader__meta', { opacity: 0, y: 12, duration: 0.8, ease: 'power3.out' }, 0.4)
      .to(o, { v: 100, duration: 2, ease: 'power2.inOut', onUpdate: () => { count.textContent = String(Math.round(o.v)).padStart(3, '0'); } }, 0.2)
      .to('.loader__bar i', { scaleX: 1, duration: 2, ease: 'power2.inOut' }, 0.2)
      .to(chars, { yPercent: -120, duration: 0.7, stagger: 0.02, ease: 'expo.in' }, '>-0.05')
      .to('.loader__meta', { opacity: 0, duration: 0.4 }, '<')
      .addLabel('reveal', '>-0.15')
      .to('.loader__cols i', { scaleY: 0, duration: 1.1, stagger: 0.07, ease: 'expo.inOut' }, 'reveal')
      .add(heroIntro(), 'reveal+=0.35')
      .add(done, 'reveal+=1.3');
  }

  // Hero scroll-out parallax
  gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
    .to('.hero__copy', { yPercent: -16, opacity: 0.15, ease: 'none' }, 0)
    .to('.hero__visual', { yPercent: -8, ease: 'none' }, 0)
    .to('.arch img', { yPercent: 10, ease: 'none' }, 0)
    .to('.hero__strands', { opacity: 0.3, ease: 'none' }, 0);

  /* ---------- header + progress ---------- */
  const header = $('.header');
  let lastY = 0;
  const onScroll = y => {
    header.classList.toggle('is-scrolled', y > 40);
    if (Math.abs(y - lastY) < 6) return;
    header.classList.toggle('is-hidden', y > lastY && y > 700 && !activeLayer);
    lastY = y;
  };
  if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll));
  else window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
  gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  /* ---------- cursor + magnetic ---------- */
  if (fine && !reduce) {
    document.documentElement.classList.add('has-cursor');
    const cur = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('.cursor__label');
    gsap.set([dot, ring], { x: -100, y: -100 });
    const dx = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2' });
    const dy = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2' });
    const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
    const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
    window.addEventListener('pointermove', e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); cur.classList.remove('is-hidden'); }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => cur.classList.add('is-hidden'));
    document.addEventListener('pointerover', e => {
      let lab = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button, label, select, input[type=range]');
      if (lab && link && link !== lab && lab.contains(link)) lab = null;
      cur.classList.toggle('is-label', !!lab);
      if (lab) label.textContent = lab.dataset.cursor;
      cur.classList.toggle('is-link', !lab && !!link);
    });
    window.addEventListener('pointerdown', () => gsap.to(ring, { scale: 0.8, duration: 0.2 }));
    window.addEventListener('pointerup', () => gsap.to(ring, { scale: 1, duration: 0.6, ease: 'elastic.out(1, .4)' }));

    $$('.magnetic').forEach(el => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, .35)' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, .35)' });
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3);
        yTo((e.clientY - r.top - r.height / 2) * 0.4);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---------- section titles & reveals ---------- */
  $$('[data-split]').forEach(el => {
    const words = split(el, 'words');
    gsap.from(words, { yPercent: 115, duration: 1.3, stagger: 0.07, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  const statementWords = split($('.statement__text'), 'words');
  gsap.fromTo(statementWords, { opacity: 0.12 }, {
    opacity: 1, stagger: 0.1, ease: 'none',
    scrollTrigger: { trigger: '.statement__text', start: 'top 80%', end: 'bottom 45%', scrub: 0.6 }
  });

  $$('[data-count]').forEach(el => {
    const end = parseFloat(el.dataset.count);
    const dec = +(el.dataset.dec || 0);
    const o = { v: 0 };
    const fmt = v => (dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US'));
    el.textContent = fmt(0);
    ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 2.2, ease: 'power3.out', onUpdate: () => { el.textContent = fmt(o.v); } })
    });
  });

  const fadeUp = (sel, opts = {}) => {
    const els = $$(sel);
    if (!els.length) return;
    gsap.set(els, { y: opts.y ?? 50, opacity: 0 });
    ScrollTrigger.batch(els, {
      start: 'top 90%', once: true,
      onEnter: batch => gsap.to(batch, { y: 0, opacity: 1, duration: 1.2, stagger: 0.09, ease: 'expo.out' })
    });
  };
  fadeUp('.statement .eyebrow, .stat', { y: 30 });
  fadeUp('.card__in');
  fadeUp('.section-head .toolbar, .shop__count', { y: 24 });
  fadeUp('.panel > .muted-l, .opt, .total', { y: 30 });
  fadeUp('.look__head > *, .reviews__head .score', { y: 30 });
  fadeUp('.footer__top > *', { y: 30 });

  /* ---------- velocity tapes ---------- */
  (() => {
    const rows = $$('.tape').map(row => {
      const track = $('.tape__track', row);
      track.innerHTML += track.innerHTML;
      return { track, dir: +row.dataset.dir || 1, x: 0, w: track.scrollWidth / 2 };
    });
    const measure = () => rows.forEach(r => { r.w = r.track.scrollWidth / 2; });
    window.addEventListener('resize', measure);
    if (document.fonts) document.fonts.ready.then(measure);
    let speed = 0, sign = 1;
    gsap.ticker.add((time, dt) => {
      const v = lenis ? lenis.velocity : 0;
      if (v > 0.5) sign = 1; else if (v < -0.5) sign = -1;
      speed += (Math.min(Math.abs(v), 50) - speed) * 0.08;
      const move = (1 + speed * 0.14) * dt * 0.06 * (reduce ? 0 : 1);
      rows.forEach(r => {
        r.x -= move * r.dir * sign;
        if (r.x <= -r.w) r.x += r.w;
        if (r.x > 0) r.x -= r.w;
        r.track.style.transform = `translate3d(${r.x}px,0,0)`;
      });
    });
    gsap.from('.tape--gold', { xPercent: 30, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.tapes', start: 'top 85%' } });
    gsap.from('.tape--dark', { xPercent: -30, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.tapes', start: 'top 85%' } });
  })();

  /* ---------- bestsellers: pinned horizontal scroll ---------- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    const track = $('#hTrack');
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '.hs', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.8,
        invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: self => gsap.set('.hs__progress i', { scaleX: self.progress })
      }
    });
    $$('.feature').forEach(card => {
      gsap.fromTo($('.feature__zoom img', card), { xPercent: -7 }, {
        xPercent: 7, ease: 'none',
        scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true }
      });
    });
  });
  gsap.from('.feature, .hs__end', { y: 80, opacity: 0, rotate: 2, duration: 1.4, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.best', start: 'top 70%' } });
  gsap.from('.hs__intro .muted, .hs__hint', { y: 30, opacity: 0, duration: 1.1, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.best', start: 'top 70%' } });

  /* ---------- shop filter pill ---------- */
  const placePill = () => movePill($('.filters button.is-active'), true);
  placePill();
  window.addEventListener('resize', placePill);
  if (document.fonts) document.fonts.ready.then(placePill);

  /* ---------- promise icons draw ---------- */
  $$('.promise__item').forEach((item, i) => {
    const paths = $$('path, circle', item);
    paths.forEach(p => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
    gsap.set(item, { opacity: 0, y: 30 });
    ScrollTrigger.create({
      trigger: item, start: 'top 90%', once: true,
      onEnter: () => {
        gsap.to(item, { opacity: 1, y: 0, duration: 1, delay: i * 0.1, ease: 'expo.out' });
        gsap.to(paths, { strokeDashoffset: 0, duration: 1.8, delay: 0.2 + i * 0.1, stagger: 0.12, ease: 'power2.inOut' });
      }
    });
  });

  /* ---------- studio ---------- */
  initStudio();
  gsap.from('.stage', { clipPath: 'inset(30% 20% 30% 20% round 300px)', scale: 0.92, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.studio', start: 'top 70%' } });

  /* ---------- atelier steps ---------- */
  (() => {
    const imgs = $$('#atelierMedia img');
    const steps = $$('.step');
    const num = $('#atelierNum');
    let active = 0;
    imgs.forEach((im, k) => gsap.set(im, { clipPath: k ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 0% 0%)', zIndex: k ? 0 : 1 }));
    const setActive = i => {
      if (i === active) return;
      const prev = active;
      active = i;
      steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
      num.textContent = String(i + 1).padStart(2, '0');
      imgs.forEach((im, k) => gsap.set(im, { zIndex: k === i ? 2 : k === prev ? 1 : 0 }));
      gsap.fromTo(imgs[i], { clipPath: i > prev ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut', overwrite: true });
      gsap.fromTo(imgs[i], { scale: 1.25 }, { scale: 1, duration: 1.8, ease: 'expo.out' });
    };
    steps.forEach((s, i) => ScrollTrigger.create({ trigger: s, start: 'top 55%', end: 'bottom 55%', onToggle: self => self.isActive && setActive(i) }));
    gsap.to('.steps__line i', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 55%', end: 'bottom 55%', scrub: true } });
  })();

  /* ---------- lookbook ---------- */
  gsap.fromTo('.look__marquee span', { xPercent: 4 }, { xPercent: -28, ease: 'none', scrollTrigger: { trigger: '.look', start: 'top bottom', end: 'bottom top', scrub: true } });
  mm.add('(min-width: 900px)', () => {
    $$('.look__col').forEach(col => {
      const s = parseFloat(col.dataset.speed) - 1;
      gsap.fromTo(col, { y: s * -360 }, { y: s * 360, ease: 'none', scrollTrigger: { trigger: '.look__cols', start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });
  (() => {
    const items = $$('.look__item');
    gsap.set(items, { clipPath: 'inset(15% 12% 15% 12% round 18px)', opacity: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 95%', once: true,
      onEnter: batch => gsap.to(batch, { clipPath: 'inset(0% 0% 0% 0% round 18px)', opacity: 1, duration: 1.5, stagger: 0.1, ease: 'expo.out' })
    });
  })();

  /* ---------- CTA + footer ---------- */
  const ctaChars = split($('.cta__title'));
  gsap.from(ctaChars, { yPercent: 110, rotate: 6, duration: 1.4, stagger: 0.03, ease: 'expo.out', scrollTrigger: { trigger: '.cta', start: 'top 65%' } });
  fadeUp('.cta .eyebrow, .cta__lead, .cta__form', { y: 30 });

  const footChars = split($('.footer__brand'));
  gsap.from(footChars, { yPercent: 105, duration: 1.5, stagger: 0.04, ease: 'expo.out', scrollTrigger: { trigger: '.footer__brand', start: 'top 98%' } });

  $('#newsForm').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = $('#newsEmail');
    if (!input.value || !input.checkValidity()) {
      gsap.fromTo(form, { x: -10 }, { x: 0, duration: 0.6, ease: 'elastic.out(1, .3)' });
      input.focus();
      return;
    }
    form.classList.add('is-done');
    $('.cta__btn-label', form).textContent = 'You’re in';
    input.value = '';
    input.placeholder = 'Check your inbox for 15% off ✦';
    toast('Welcome to the Maison — your code <b>CROWN15</b> is on its way.');
  });

  /* ---------- go ---------- */
  window.addEventListener('load', () => ScrollTrigger.refresh());
  const fontsReady = document.fonts ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]) : Promise.resolve();
  fontsReady.then(runLoader);
})();
