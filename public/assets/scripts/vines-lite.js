(() => {
  const canvas = document.getElementById('vineCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(max-width: 700px)').matches;
  const lowPower =
    (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

  let running = false;
  let rafId = 0;
  let lastTs = 0;
  const fps = lowPower ? 24 : 30;
  const minFrameMs = 1000 / fps;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.5);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(ts) {
    if (!running) {
      rafId = 0;
      return;
    }

    if (lastTs && ts - lastTs < minFrameMs) {
      rafId = requestAnimationFrame(draw);
      return;
    }
    lastTs = ts;

    const t = ts / 1000;
    const w = window.innerWidth;
    const h = window.innerHeight;

    ctx.clearRect(0, 0, w, h);

    const baseX = w - Math.max(20, Math.min(42, w * 0.05));
    const amplitude = lowPower ? 9 : 14;

    ctx.strokeStyle = 'rgba(72, 102, 45, 0.78)';
    ctx.lineWidth = lowPower ? 2 : 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();

    const segments = lowPower ? 44 : 60;
    for (let i = 0; i <= segments; i++) {
      const p = i / segments;
      const y = h + 40 - p * (h + 120);
      const x =
        baseX -
        p * (lowPower ? 18 : 28) -
        Math.sin(p * 12 + t * 0.7) * amplitude -
        Math.sin(p * 26 + t * 0.4) * (lowPower ? 4 : 6);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const leafCount = lowPower ? 10 : 15;
    for (let i = 0; i < leafCount; i++) {
      const p = (i + 2) / (leafCount + 3);
      const y = h + 40 - p * (h + 120);
      const x =
        baseX -
        p * (lowPower ? 18 : 28) -
        Math.sin(p * 12 + t * 0.7) * amplitude;
      const side = i % 2 ? 1 : -1;
      const sway = Math.sin(t * 1.2 + i) * 0.2;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(side * (0.8 + sway));
      ctx.fillStyle = i % 3 === 0 ? 'rgba(106, 140, 62, 0.7)' : 'rgba(87, 120, 52, 0.75)';
      ctx.beginPath();
      ctx.ellipse(0, 0, lowPower ? 7 : 9, lowPower ? 3.5 : 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    rafId = requestAnimationFrame(draw);
  }

  function setEnabled(enabled) {
    const shouldRun = Boolean(enabled) && !mobile && !prefersReducedMotion;
    canvas.style.display = shouldRun ? 'block' : 'none';
    running = shouldRun;

    if (!shouldRun) {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      return;
    }

    resize();
    lastTs = 0;
    if (!rafId) {
      rafId = requestAnimationFrame(draw);
    }
  }

  window.addEventListener('resize', () => {
    if (!running) return;
    resize();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      return;
    }

    if (running && !rafId) {
      rafId = requestAnimationFrame(draw);
    }
  });

  window.__setVineAnimationInternal = setEnabled;
})();
