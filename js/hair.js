/* Maison Tresse — generative hair renderers (Canvas 2D, no dependencies).
   HeroStrands: full-bleed silky strands you can "comb" with the pointer.
   HairStudio:  a parametric wig on a mannequin bust that morphs between textures/colours. */
(() => {
  'use strict';

  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const hex = h => {
    const n = parseInt(h.replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const shade = (c, k) => (k < 0 ? mix(c, [0, 0, 0], -k) : mix(c, [255, 255, 255], k));
  const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const rng = seed => () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const debounce = (fn, ms) => { let id; return () => { clearTimeout(id); id = setTimeout(fn, ms); }; };

  // Runs `frame(dt)` on rAF only while `el` is on screen.
  function runWhenVisible(el, frame) {
    let raf = 0, last = 0;
    const tick = now => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      frame(dt);
      raf = requestAnimationFrame(tick);
    };
    const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } };
    const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => (es[es.length - 1].isIntersecting ? start() : stop()), { rootMargin: '120px' }).observe(el);
    } else start();
  }

  /* ------------------------------------------------------------------ */
  class HeroStrands {
    constructor(canvas, host, { still = false } = {}) {
      this.c = canvas;
      this.ctx = canvas.getContext('2d');
      this.host = host || canvas.parentElement;
      this.still = still;
      this.t = 0;
      this.reveal = 1;
      this.m = { x: -9999, y: -9999, vx: 0, on: false };
      this.ghost = { x: -9999, y: -9999, on: false };
      this.resize();
      window.addEventListener('resize', debounce(() => this.resize(), 150));
      this.host.addEventListener('pointermove', e => {
        const r = this.c.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        if (this.m.on) this.m.vx = this.m.vx * 0.5 + (x - this.m.x) * 0.5;
        this.m.x = x; this.m.y = y; this.m.on = true;
      }, { passive: true });
      this.host.addEventListener('pointerleave', () => { this.m.on = false; });
      runWhenVisible(this.c, dt => this.frame(dt));
    }

    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const r = this.c.getBoundingClientRect();
      this.w = Math.max(1, r.width);
      this.h = Math.max(1, r.height);
      this.c.width = Math.round(this.w * dpr);
      this.c.height = Math.round(this.h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const rand = rng(11);
      const count = Math.round(clamp(this.w / 6.5, 50, 240));
      this.step = 12;
      this.n = Math.ceil((this.h + 80) / this.step) + 1;
      this.strands = Array.from({ length: count }, (_, i) => ({
        x0: ((i + rand() * 0.8) / count) * (this.w + 160) - 80,
        ph: rand() * TAU,
        amp: 8 + rand() * 30,
        sp: 0.35 + rand() * 0.5,
        lw: 0.4 + rand() * 1.4,
        a: 0.14 + rand() * 0.5,
        tone: rand(),
        off: new Float32Array(this.n),
        vel: new Float32Array(this.n)
      }));
    }

    frame(dt) {
      if (!this.still) this.t += dt;
      const { ctx, w, h, step, n, t } = this;
      ctx.clearRect(0, 0, w, h);
      const m = this.m.on ? this.m : this.ghost.on ? this.ghost : null;
      this.m.vx *= 0.9;
      const R = Math.min(170, Math.max(90, w * 0.12)), R2 = R * R;

      // three tonal families, with a slowly drifting band of shine
      const sy = clamp(0.48 + Math.sin(t * 0.22) * 0.14, 0.3, 0.7);
      const tones = [
        [[46, 30, 21], [150, 105, 72]],
        [[132, 92, 63], [228, 192, 148]],
        [[205, 168, 128], [252, 232, 204]]
      ];
      const grads = tones.map(([base, hi]) => {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, rgba(base, 0));
        g.addColorStop(0.1, rgba(base, 0.85));
        g.addColorStop(sy - 0.14, rgba(base, 1));
        g.addColorStop(sy, rgba(hi, 1));
        g.addColorStop(sy + 0.14, rgba(base, 1));
        g.addColorStop(0.9, rgba(base, 0.55));
        g.addColorStop(1, rgba(base, 0));
        return g;
      });

      const limit = Math.max(2, Math.floor(n * this.reveal));
      ctx.lineCap = 'round';
      for (const s of this.strands) {
        ctx.beginPath();
        for (let j = 0; j < limit; j++) {
          const y = -40 + j * step;
          const yn = y / h;
          let x = s.x0
            + Math.sin(y * 0.0055 + t * s.sp + s.ph) * s.amp * (0.25 + yn)
            + Math.sin(y * 0.002 - t * 0.3 + s.ph * 0.5) * 24 * yn;
          let target = 0;
          if (m) {
            const dx = x + s.off[j] - m.x, dy = y - m.y, d2 = dx * dx + dy * dy;
            if (d2 < R2 * 5) {
              const f = Math.exp(-d2 / R2);
              target = (dx >= 0 ? 1 : -1) * f * R * 0.55 + this.m.vx * f * 1.2;
            }
          }
          let v = s.vel[j] + (target - s.off[j]) * 0.07;
          v *= 0.84;
          s.vel[j] = v;
          s.off[j] += v;
          x += s.off[j];
          if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = grads[s.tone < 0.5 ? 0 : s.tone < 0.86 ? 1 : 2];
        ctx.globalAlpha = s.a;
        ctx.lineWidth = s.lw;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }

  /* ------------------------------------------------------------------ */
  class HairStudio {
    constructor(canvas) {
      this.c = canvas;
      this.ctx = canvas.getContext('2d');
      this.VW = 600;
      this.VH = 720;
      this.g = { cx: 300, cy: 236, rx: 84, ry: 98 };
      const rand = rng(2026);
      this.strands = Array.from({ length: 620 }, () => ({
        side: rand() < 0.5 ? -1 : 1,
        back: rand() < 0.45,
        u: rand(),
        v: rand(),
        ph: rand() * TAU,
        lenJ: 0.84 + rand() * 0.24,
        lw: 0.7 + rand() * 1.1,
        a: 0.55 + rand() * 0.4,
        tone: rand(),
        sw: 0.6 + rand() * 0.8
      }));
      this.p = {
        amp: 2, freq: 0.02, curl: 0, volume: 0.12, puff: 0, shine: 0.6, coh: 0.9,
        length: 0.55, count: 330, tuck: 0,
        r0: 13, g0: 10, b0: 9, r1: 31, g1: 23, b1: 20, r2: 46, g2: 35, b2: 29
      };
      this.t = 0;
      this.wind = 0;
      this.m = { x: -999, y: -999, vx: 0, on: false, pow: 0 };
      this.resize();
      window.addEventListener('resize', debounce(() => this.resize(), 150));
      canvas.addEventListener('pointermove', e => {
        const r = this.c.getBoundingClientRect();
        const x = (e.clientX - r.left) / this.scale, y = (e.clientY - r.top) / this.scale;
        if (this.m.on) this.m.vx = this.m.vx * 0.6 + (x - this.m.x) * 0.4;
        this.m.x = x; this.m.y = y; this.m.on = true;
      }, { passive: true });
      canvas.addEventListener('pointerleave', () => { this.m.on = false; });
      runWhenVisible(canvas, dt => this.frame(dt));
    }

    resize() {
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = this.c.getBoundingClientRect();
      const w = Math.max(1, r.width);
      this.scale = w / this.VW;
      this.c.width = Math.round(w * this.dpr);
      this.c.height = Math.round(w * (this.VH / this.VW) * this.dpr);
    }

    // Tween to new parameters (falls back to an instant change without GSAP).
    to(vals, duration = 1.2) {
      if (window.gsap && duration > 0) {
        window.gsap.to(this.p, { ...vals, duration, ease: 'power3.inOut', overwrite: 'auto' });
      } else Object.assign(this.p, vals);
    }

    frame(dt) {
      this.t += dt;
      const { ctx, p, g, m } = this;
      m.pow += ((m.on ? 1 : 0) - m.pow) * 0.08;
      m.vx *= 0.9;
      this.wind += (clamp(m.vx, -40, 40) * 0.02 * m.pow - this.wind) * 0.06;

      const k = this.dpr * this.scale;
      ctx.setTransform(k, 0, 0, k, 0, 0);
      ctx.clearRect(0, 0, this.VW, this.VH);

      const fall = lerp(118, 470, p.length);
      const top = g.cy - g.ry * 1.5, bottom = g.cy + fall + 60;
      const root = [p.r0, p.g0, p.b0], mid = [p.r1, p.g1, p.b1], tip = [p.r2, p.g2, p.b2];
      const at = y => clamp((y - top) / (bottom - top), 0, 1);
      const grad = kk => {
        const lg = ctx.createLinearGradient(0, top, 0, bottom);
        lg.addColorStop(0, rgba(shade(root, kk)));
        lg.addColorStop(at(g.cy - g.ry * 0.9), rgba(shade(mix(root, mid, 0.55), kk + p.shine * 0.3)));
        lg.addColorStop(at(g.cy - g.ry * 0.25), rgba(shade(mix(root, mid, 0.8), kk)));
        lg.addColorStop(at(g.cy + fall * 0.3), rgba(shade(mid, kk + p.shine * 0.22)));
        lg.addColorStop(at(g.cy + fall * 0.55), rgba(shade(mix(mid, tip, 0.45), kk)));
        lg.addColorStop(1, rgba(shade(tip, kk)));
        return lg;
      };

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      this.layer(true, fall, [grad(-0.5), grad(-0.3)]);
      ctx.globalAlpha = 1;
      this.bust();
      this.cap(grad(-0.18));
      this.fluff([grad(-0.25), grad(-0.05)]);
      this.layer(false, fall, [grad(0), grad(0.1), grad(-0.2)]);
      ctx.globalAlpha = 1;
    }

    layer(back, fall, grads) {
      const { ctx, p, g, m } = this;
      const n = Math.min(this.strands.length, Math.round(p.count));
      const puff = 1 + p.puff * 0.34;
      const step = clamp(TAU / p.freq / 9, 2.5, 8);
      const R2 = 72 * 72;
      const phase0 = 1 - p.coh * 0.85;
      for (let i = 0; i < n; i++) {
        const s = this.strands[i];
        if (s.back !== back) continue;
        const side = s.side;
        const rxs = g.rx * (back ? 1.1 + s.u * 0.18 : 0.99 + s.u * 0.12) * puff;
        const rys = g.ry * (back ? 1.04 + s.u * 0.12 : 0.72 + s.v * 0.32) * puff;
        // where this strand settles across the curtain (back strands also fill in behind the neck)
        const spread = g.rx * (back ? lerp(-0.62, 0.45, s.u) : lerp(-0.06, 0.55, s.u));
        const a1 = -Math.PI / 2 + side * (Math.PI / 2 + 0.04 + s.u * 0.22);

        ctx.beginPath();
        let x = 0, y = 0;
        const arcSteps = 9 + Math.round(p.puff * 28);
        for (let kk = 0; kk <= arcSteps; kk++) {
          const q = kk / arcSteps;
          const a = lerp(-Math.PI / 2, a1, q);
          const frizz = 1 + (p.puff * p.amp * 0.8 * Math.sin(kk * 2.3 + s.ph)) / g.rx;
          x = g.cx + Math.cos(a) * rxs * frizz + side * (1.5 + s.v * 3) * (1 - q);
          y = g.cy + Math.sin(a) * rys * frizz;
          if (kk === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        const ex = x, ey = y;
        const L = fall * s.lenJ * (back ? 1 : 0.97);
        const ph0 = s.ph * phase0 + Math.sin(this.t * 0.6 + s.ph) * 0.25;
        const fq = p.freq * (0.92 + s.u * 0.16);
        const sway = Math.sin(this.t * 0.9 * s.sw + s.ph) * 5;
        for (let d = step; d <= L; d += step) {
          const q = d / L;
          const env = Math.min(1, q * 3 + 0.1);
          const ph = fq * d + ph0;
          let px = ex
            + side * (p.volume * 74 * Math.pow(q, 0.75) + (back ? 16 : 5) * q + spread * Math.min(1, q * 2.4))
            + p.amp * env * Math.sin(ph)
            + (sway + this.wind * 60) * q * q;
          const py = ey + d + p.curl * p.amp * env * Math.cos(ph) * 0.95;
          if (p.tuck > 0.01 && q > 0.78) {
            const tq = (q - 0.78) / 0.22;
            px -= side * p.tuck * tq * tq * 18;
          }
          if (m.pow > 0.01) {
            const dx = px - m.x, dy = py - m.y, d2 = dx * dx + dy * dy;
            if (d2 < R2 * 4) px += (dx >= 0 ? 1 : -1) * Math.exp(-d2 / R2) * 30 * m.pow * (0.3 + q);
          }
          ctx.lineTo(px, py);
        }
        ctx.strokeStyle = grads[Math.min(grads.length - 1, Math.floor(s.tone * grads.length))];
        ctx.globalAlpha = s.a;
        ctx.lineWidth = s.lw * (back ? 1.6 : 1.15);
        ctx.stroke();
      }
    }

    // Coiled halo radiating from the crown — gives curly/coily textures their volume.
    fluff(grads) {
      const { ctx, p, g } = this;
      const k = clamp((p.puff - 0.05) / 0.95, 0, 1);
      if (k <= 0) return;
      const puff = 1 + p.puff * 0.34;
      const n = Math.round(440 * k);
      const len = 16 + 50 * p.puff;
      for (let i = 0; i < n; i++) {
        const s = this.strands[i];
        const a = Math.PI * (0.8 + 1.4 * s.u);
        const nx = Math.cos(a), ny = Math.sin(a);
        const r0 = 0.72 + s.v * 0.22;
        const bx = g.cx + nx * g.rx * puff * r0, by = g.cy + ny * g.ry * puff * r0;
        const L = len * (0.55 + s.v * 0.65);
        ctx.beginPath();
        ctx.moveTo(bx, by);
        for (let d = 3; d <= L; d += 3) {
          const ph = d * p.freq * 1.2 + s.ph + Math.sin(this.t * 0.8 + s.ph) * 0.3;
          const wob = Math.sin(ph) * p.amp * 0.9;
          const along = d + Math.cos(ph) * p.amp * p.curl * 0.6;
          ctx.lineTo(bx + nx * along - ny * wob, by + ny * along + nx * wob);
        }
        ctx.strokeStyle = grads[s.tone < 0.5 ? 0 : 1];
        ctx.globalAlpha = s.a * k;
        ctx.lineWidth = s.lw * 1.3;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    bust() {
      const { ctx, VH } = this;
      const { cx, cy, rx, ry } = this.g;
      // neck + shoulders
      const sg = ctx.createLinearGradient(0, cy + ry * 0.6, 0, VH);
      sg.addColorStop(0, '#cfb59b');
      sg.addColorStop(0.3, '#dcc6b0');
      sg.addColorStop(1, '#c4a78b');
      ctx.fillStyle = sg;
      const nw = rx * 0.48, n0 = cy + ry * 0.7, n1 = cy + ry * 1.72;
      ctx.beginPath();
      ctx.moveTo(cx - nw, n0);
      ctx.lineTo(cx + nw, n0);
      ctx.quadraticCurveTo(cx + nw * 0.92, n1 - ry * 0.2, cx + nw * 1.4, n1);
      ctx.bezierCurveTo(cx + rx * 2.4, n1 + ry * 0.12, cx + rx * 3.1, n1 + ry * 0.45, cx + rx * 3.25, VH + 4);
      ctx.lineTo(cx - rx * 3.25, VH + 4);
      ctx.bezierCurveTo(cx - rx * 3.1, n1 + ry * 0.45, cx - rx * 2.4, n1 + ry * 0.12, cx - nw * 1.4, n1);
      ctx.quadraticCurveTo(cx - nw * 0.92, n1 - ry * 0.2, cx - nw, n0);
      ctx.closePath();
      ctx.fill();
      // shadow under the jaw
      const sh = ctx.createRadialGradient(cx, cy + ry * 1.18, 4, cx, cy + ry * 1.18, rx * 0.95);
      sh.addColorStop(0, 'rgba(110,78,54,.4)');
      sh.addColorStop(1, 'rgba(110,78,54,0)');
      ctx.fillStyle = sh;
      ctx.beginPath();
      ctx.ellipse(cx, cy + ry * 1.24, rx * 0.85, ry * 0.42, 0, 0, TAU);
      ctx.fill();
      // face (soft egg shape)
      const fx = cx, fy = cy + ry * 0.12, fw = rx * 0.86, fh = ry * 1.06;
      const fg = ctx.createRadialGradient(fx - fw * 0.25, fy - fh * 0.15, 6, fx, fy, fh * 1.1);
      fg.addColorStop(0, '#f1e3d4');
      fg.addColorStop(0.55, '#e2cdb8');
      fg.addColorStop(1, '#c9ad92');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.moveTo(fx, fy - fh);
      ctx.bezierCurveTo(fx + fw * 1.1, fy - fh, fx + fw * 1.05, fy + fh * 0.35, fx + fw * 0.55, fy + fh * 0.82);
      ctx.quadraticCurveTo(fx, fy + fh * 1.1, fx - fw * 0.55, fy + fh * 0.82);
      ctx.bezierCurveTo(fx - fw * 1.05, fy + fh * 0.35, fx - fw * 1.1, fy - fh, fx, fy - fh);
      ctx.fill();
    }

    cap(fill) {
      const { ctx } = this;
      const { cx, cy, rx, ry } = this.g;
      const puff = 1 + this.p.puff * 0.34;
      const ext = 0.25 + this.p.puff * 0.3; // how far the cap wraps below the ears
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * 1.06 * puff, ry * 1.01 * puff, 0, Math.PI - ext, TAU + ext);
      ctx.quadraticCurveTo(cx + rx * 0.98, cy + ry * 0.4, cx + rx * 0.9, cy + ry * 0.08);
      ctx.quadraticCurveTo(cx, cy - ry * 1.45, cx - rx * 0.9, cy + ry * 0.08);
      ctx.quadraticCurveTo(cx - rx * 0.98, cy + ry * 0.4, cx + Math.cos(Math.PI - ext) * rx * 1.06 * puff, cy + Math.sin(Math.PI - ext) * ry * 1.01 * puff);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    }

    snapshot(w = 180, bg = '#efe4d8') {
      const h = Math.round(w * (this.VH / this.VW));
      const oc = document.createElement('canvas');
      oc.width = w; oc.height = h;
      const o = oc.getContext('2d');
      const gr = o.createRadialGradient(w / 2, h * 0.3, 2, w / 2, h * 0.4, h * 0.7);
      gr.addColorStop(0, '#fffaf4');
      gr.addColorStop(1, bg);
      o.fillStyle = gr;
      o.fillRect(0, 0, w, h);
      o.drawImage(this.c, 0, 0, w, h);
      return oc.toDataURL('image/jpeg', 0.85);
    }
  }

  window.MTHair = { HeroStrands, HairStudio, hex };
})();
