let width, height;
let app, container;
let mouse = { x: 0, y: 0 },
  lastMouse = { x: 0, y: 0 },
  mouseV = { x: 0, y: 0 };
let spritesheet,
  particles = [];
let activeParticles = [];
let rafId = 0;
let isRunning = true;
const colors = [
  0xe31104, 0xef5f1f, 0xc80e84, 0x48a71e, 0x1b81b4, 0x5741ac, 0x393f85,
];

const isSmallScreen = () => document.documentElement.clientWidth < 640;
const isTouchDevice =
  window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const PARTICLE_COUNT = prefersReducedMotion
  ? 120
  : isSmallScreen()
    ? 180
    : 420;

function resize() {
  width = document.documentElement.clientWidth;
  height = document.documentElement.clientHeight;
  if (app) app.renderer.resize(width, height);
}

async function setup() {
  if (isTouchDevice || prefersReducedMotion) return;

  resize();

  // set up Pixi stage and container
  app = new PIXI.Application({
    width,
    height,
    backgroundAlpha: 0,
    antialias: false,
    powerPreference: 'low-power',
    resolution: 1,
  });

  container = new PIXI.ParticleContainer(PARTICLE_COUNT, {
    tint: true,
  });

  app.stage.addChild(container);
  document.body.prepend(app.view);

  const spriteData = {
    meta: {
      image: '/assets/images/paint.png',
      size: { w: 480, h: 480 },
      scale: 1,
    },
    frames: [],
  };
  for (let x = 0; x < 480; x += 80) {
    for (let y = 0; y < 480; y += 80) {
      spriteData.frames.push({
        frame: { x, y, w: 80, h: 80 },
        sourceSize: { w: 80, h: 80 },
        spriteSourceSize: { x: 0, y: 0, w: 80, h: 80 },
      });
    }
  }

  spritesheet = new PIXI.Spritesheet(
    PIXI.BaseTexture.from(spriteData.meta.image),
    spriteData,
  );

  await spritesheet.parse();
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle(i));
  }
}

setup();

class Particle {
  constructor(i) {
    this.sprite = new PIXI.Sprite(spritesheet.textures[i % 36]);
    this.sprite.alpha = 0;
    this.sprite.tint = new PIXI.Color(
      colors[Math.floor(Math.random() * colors.length)],
    );
    this.sprite.width = 80;
    this.sprite.height = 80;
    this.sprite.anchor.set(0.5);
    container.addChild(this.sprite);
  }

  launch({ x, y }, { x: vx, y: vy }) {
    this.sprite.alpha = 0.2 + Math.round(Math.random() * 16) / 100;
    this.vx = vx * randomNormal() * 2;
    this.vy = vy * randomNormal() * 2;
    if (this.vx > 6) this.vx = 6;
    if (this.vy > 6) this.vy = 6;
    if (this.vx < -6) this.vx = -6;
    if (this.vy < -6) this.vy = -6;
    this.sprite.x = x;
    this.sprite.y = y;
    this.active = true;
  }

  update() {
    if (this.sprite.alpha > 0) {
      this.sprite.alpha -= 0.005;
      this.sprite.x += this.vx;
      this.sprite.y += this.vy;
      this.vx *= 0.9;
      this.vy *= 0.9;
      if (this.sprite.alpha <= 0) {
        this.active = false;
      }
    }
  }
}

window.addEventListener('resize', resize);
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  spinning = false;
});
window.addEventListener(
  'touchmove',
  (e) => {
    if (isTouchDevice || !e.touches?.length) return;
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  },
  { passive: true },
);

function animate(t) {
  if (!isRunning) {
    rafId = 0;
    return;
  }

  if (window.localStorage.getItem('cursorTrails') === 'false') {
    isRunning = false;
    return;
  }
  mouseV.x = lastMouse.x - mouse.x;
  mouseV.y = lastMouse.y - mouse.y;
  lastMouse.x = mouse.x;
  lastMouse.y = mouse.y;

  if (Math.abs(mouseV.x) + Math.abs(mouseV.y) > 1) {
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      if (particle.sprite.alpha <= 0) {
        particle.launch(mouse, mouseV);
        activeParticles.push(particle);
        break;
      }
    }
  }

  for (let i = activeParticles.length - 1; i >= 0; i--) {
    const particle = activeParticles[i];
    particle.update();
    if (!particle.active) {
      activeParticles.splice(i, 1);
    }
  }

  rafId = requestAnimationFrame(animate);
}

if (!isTouchDevice && !prefersReducedMotion) {
  rafId = requestAnimationFrame(animate);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    isRunning = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    return;
  }

  if (
    !isTouchDevice &&
    !prefersReducedMotion &&
    window.localStorage.getItem('cursorTrails') !== 'false'
  ) {
    isRunning = true;
    if (!rafId) rafId = requestAnimationFrame(animate);
  }
});

window.setCursorTrailsEnabled = (enabled) => {
  if (enabled) {
    if (isTouchDevice || prefersReducedMotion) return;
    isRunning = true;
    if (!rafId) rafId = requestAnimationFrame(animate);
  } else {
    isRunning = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }
};

function randomNormal() {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) return randomNormal(); // resample between 0 and 1
  return num;
}
