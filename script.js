"use strict";

const motionTokens = Object.freeze({
  duration: Object.freeze({
    instant: 0.08,
    fast: 0.18,
    normal: 0.35,
    slow: 0.65,
    crawl: 1.1
  }),
  ease: Object.freeze({
    smooth: "power3.out",
    sharp: "power2.inOut",
    reveal: "expo.out"
  }),
  distance: Object.freeze({
    sm: 12,
    md: 24,
    lg: 48,
    xl: 84
  })
});

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const lowEndDevice = typeof navigator !== "undefined" && navigator.hardwareConcurrency <= 4;
const canAnimate = !reducedMotion && !lowEndDevice;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function mapRange(value, inMin, inMax, outMin, outMax) {
  const progress = (value - inMin) / (inMax - inMin);
  return outMin + (outMax - outMin) * progress;
}

function initLoader() {
  const loader = document.getElementById("loader");
  const counter = document.getElementById("loader-counter");
  const progress = document.getElementById("loader-progress");
  const words = [...document.querySelectorAll(".loader__word span")];

  if (!loader || reducedMotion) {
    window.clearTimeout(window.__portfolioLoaderGuard);
    document.documentElement.classList.remove("is-loading");
    document.body.classList.remove("is-locked");
    runHeroIntro();
    return;
  }

  document.body.classList.add("is-locked");

  if (!window.gsap) {
    let value = 0;
    const timer = window.setInterval(() => {
      value += 4;
      counter.textContent = String(value).padStart(3, "0");
      progress.style.width = `${value}%`;
      if (value >= 100) {
        window.clearInterval(timer);
        loader.style.opacity = "0";
        window.setTimeout(() => {
          window.clearTimeout(window.__portfolioLoaderGuard);
          document.documentElement.classList.remove("is-loading");
          document.body.classList.remove("is-locked");
          runHeroIntro();
        }, 220);
      }
    }, 24);
    return;
  }

  const state = { value: 0 };
  const timeline = window.gsap.timeline({
    defaults: { ease: motionTokens.ease.sharp },
    onComplete: () => {
      window.clearTimeout(window.__portfolioLoaderGuard);
      document.documentElement.classList.remove("is-loading");
      document.body.classList.remove("is-locked");
      runHeroIntro();
    }
  });

  timeline
    .to(state, {
      value: 100,
      duration: motionTokens.duration.crawl,
      ease: "power1.inOut",
      onUpdate: () => {
        const value = Math.round(state.value);
        counter.textContent = String(value).padStart(3, "0");
        progress.style.width = `${value}%`;
      }
    })
    .to(words[0], { yPercent: -120, duration: motionTokens.duration.normal }, 0.35)
    .fromTo(words[1], { yPercent: 120 }, { yPercent: 0, duration: motionTokens.duration.normal }, 0.35)
    .to(words[1], { yPercent: -120, duration: motionTokens.duration.normal }, 0.78)
    .fromTo(words[2], { yPercent: 120 }, { yPercent: 0, duration: motionTokens.duration.normal }, 0.78)
    .to(loader, {
      yPercent: -100,
      duration: motionTokens.duration.slow,
      ease: "expo.inOut"
    }, 1.18);
}

function runHeroIntro() {
  if (!window.gsap || reducedMotion) return;

  const timeline = window.gsap.timeline({
    defaults: { ease: motionTokens.ease.reveal }
  });

  timeline
    .fromTo(".hero__media img", { scale: 1.1 }, {
      scale: 1.04,
      duration: 1.5
    })
    .fromTo(".hero__line > span", {
      yPercent: 112,
      rotate: 3
    }, {
      yPercent: 0,
      rotate: 0,
      duration: 0.95,
      stagger: 0.09
    }, 0.06)
    .fromTo([
      ".hero__kicker",
      ".hero__summary",
      ".hero__actions",
      ".hero__system",
      ".hero__scroll"
    ], {
      y: motionTokens.distance.md,
      opacity: 0
    }, {
      y: 0,
      opacity: 1,
      duration: motionTokens.duration.slow,
      stagger: 0.07
    }, 0.28)
    .fromTo(".hero__metric", {
      x: motionTokens.distance.lg,
      opacity: 0
    }, {
      x: 0,
      opacity: 1,
      duration: motionTokens.duration.slow,
      stagger: 0.08
    }, 0.42);
}

function initNavigation() {
  const nav = document.getElementById("site-nav");
  const toggle = document.getElementById("menu-toggle");
  const links = document.getElementById("nav-links");
  const sectionLinks = [...document.querySelectorAll(".nav-links a")];
  const sections = [...document.querySelectorAll("main section[id]")];

  const updateNav = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 28);
  };

  const closeMenu = () => {
    toggle.classList.remove("is-open");
    links.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
  };

  toggle.addEventListener("click", () => {
    const isOpen = !links.classList.contains("is-open");
    toggle.classList.toggle("is-open", isOpen);
    links.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  sectionLinks.forEach((link) => link.addEventListener("click", closeMenu));
  window.addEventListener("scroll", updateNav, { passive: true });
  updateNav();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      sectionLinks.forEach((link) => {
        link.classList.toggle("active", link.hash === `#${entry.target.id}`);
      });
    });
  }, {
    rootMargin: "-45% 0px -48% 0px",
    threshold: 0
  });

  sections.forEach((section) => observer.observe(section));
}

function initScrollMeter() {
  const meter = document.getElementById("scroll-meter");
  let queued = false;

  const update = () => {
    const root = document.documentElement;
    const max = root.scrollHeight - root.clientHeight;
    const progress = max > 0 ? root.scrollTop / max : 0;
    meter.style.transform = `scaleX(${progress})`;
    queued = false;
  };

  window.addEventListener("scroll", () => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  }, { passive: true });

  update();
}

function initCustomCursor() {
  if (!finePointer || reducedMotion) return;

  const cursor = document.getElementById("cursor");
  const label = cursor.querySelector(".cursor__label");
  let targetX = -100;
  let targetY = -100;
  let currentX = -100;
  let currentY = -100;
  let rafId = 0;

  document.body.classList.add("custom-cursor");

  const render = () => {
    currentX += (targetX - currentX) * 0.2;
    currentY += (targetY - currentY) * 0.2;
    cursor.style.transform = `translate3d(${currentX - cursor.offsetWidth / 2}px, ${currentY - cursor.offsetHeight / 2}px, 0)`;
    rafId = window.requestAnimationFrame(render);
  };

  window.addEventListener("pointermove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    cursor.style.opacity = "1";
  });

  document.documentElement.addEventListener("pointerleave", () => {
    cursor.style.opacity = "0";
  });

  document.addEventListener("pointerover", (event) => {
    const interactive = event.target.closest("a, button, [data-cursor]");
    cursor.classList.toggle("is-active", Boolean(interactive));
    label.textContent = interactive?.dataset.cursor || (interactive ? "OPEN" : "VIEW");
  });

  document.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget) cursor.classList.remove("is-active");
  });

  render();
  window.addEventListener("pagehide", () => window.cancelAnimationFrame(rafId), { once: true });
}

function initMagneticElements() {
  if (!finePointer || reducedMotion) return;

  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;

      if (window.gsap) {
        window.gsap.to(element, {
          x: x * 0.16,
          y: y * 0.22,
          duration: motionTokens.duration.normal,
          ease: motionTokens.ease.smooth,
          overwrite: true
        });
      } else {
        element.style.transform = `translate3d(${x * 0.16}px, ${y * 0.22}px, 0)`;
      }
    });

    element.addEventListener("pointerleave", () => {
      if (window.gsap) {
        window.gsap.to(element, {
          x: 0,
          y: 0,
          duration: motionTokens.duration.slow,
          ease: "elastic.out(1, 0.35)",
          overwrite: true
        });
      } else {
        element.style.transform = "";
      }
    });
  });
}

function initHeroParallax() {
  if (!finePointer || !canAnimate) return;

  const hero = document.getElementById("home");
  const media = hero.querySelector(".hero__media");
  const content = hero.querySelector(".hero__content");
  let queued = false;
  let pointerX = 0.5;
  let pointerY = 0.5;

  const update = () => {
    const mediaX = mapRange(pointerX, 0, 1, -12, 12);
    const mediaY = mapRange(pointerY, 0, 1, -8, 8);
    const copyX = mapRange(pointerX, 0, 1, 5, -5);
    const copyY = mapRange(pointerY, 0, 1, 3, -3);

    media.style.transform = `translate3d(${mediaX}px, ${mediaY}px, 0) scale(1.04)`;
    content.style.transform = `translate3d(${copyX}px, ${copyY}px, 0)`;
    queued = false;
  };

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    pointerX = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    pointerY = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  });

  hero.addEventListener("pointerleave", () => {
    pointerX = 0.5;
    pointerY = 0.5;
    update();
  });
}

function initScrollAnimations() {
  if (!window.gsap || !window.ScrollTrigger || reducedMotion) return;

  window.gsap.registerPlugin(window.ScrollTrigger);

  const revealGroups = [
    ".manifesto__body h2",
    ".manifesto__aside",
    ".section-heading > *",
    ".impact__intro",
    ".metric",
    ".timeline__item",
    ".about__statement",
    ".about__copy",
    ".capability-map",
    ".credentials",
    ".education"
  ];

  document.querySelectorAll(revealGroups.join(",")).forEach((element) => {
    window.gsap.fromTo(element, {
      y: motionTokens.distance.lg,
      opacity: 0
    }, {
      y: 0,
      opacity: 1,
      duration: motionTokens.duration.slow,
      ease: motionTokens.ease.smooth,
      scrollTrigger: {
        trigger: element,
        start: "top 88%",
        once: true
      }
    });
  });

  window.gsap.to(".hero__media img", {
    yPercent: 9,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: 0.8
    }
  });

  window.gsap.to(".hero__title", {
    y: -70,
    opacity: 0.18,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom 25%",
      scrub: 0.8
    }
  });

  window.gsap.fromTo(".contact h2 span", {
    yPercent: 110
  }, {
    yPercent: 0,
    duration: 0.9,
    stagger: 0.08,
    ease: motionTokens.ease.reveal,
    scrollTrigger: {
      trigger: ".contact h2",
      start: "top 84%",
      once: true
    }
  });
}

function initProjectRail() {
  const stage = document.getElementById("project-stage");
  const rail = document.getElementById("project-rail");
  const progress = document.getElementById("project-progress");

  if (!window.gsap || !window.ScrollTrigger || reducedMotion) {
    stage.classList.add("project-stage--static");
    rail.classList.add("project-rail--static");
    return;
  }

  const media = window.matchMedia("(min-width: 721px)");
  let tween = null;

  const setup = () => {
    if (!media.matches) return;

    const getDistance = () => Math.max(0, rail.scrollWidth - stage.clientWidth);
    tween = window.gsap.to(rail, {
      x: () => -getDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: stage,
        start: "top 12%",
        end: () => `+=${getDistance()}`,
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          progress.style.transform = `scaleX(${0.25 + self.progress * 0.75})`;
        }
      }
    });
  };

  const destroy = () => {
    if (!tween) return;
    tween.scrollTrigger?.kill();
    tween.kill();
    window.gsap.set(rail, { clearProps: "transform" });
    progress.style.transform = "";
    tween = null;
  };

  const handleChange = () => {
    destroy();
    setup();
    window.ScrollTrigger.refresh();
  };

  setup();
  media.addEventListener("change", handleChange);
}

function initCounters() {
  const counters = [...document.querySelectorAll("[data-count]")];

  const animate = (element) => {
    const target = Number(element.dataset.count);
    if (!window.gsap || reducedMotion) {
      element.textContent = String(target);
      return;
    }

    const value = { current: 0 };
    window.gsap.to(value, {
      current: target,
      duration: 1.2,
      ease: motionTokens.ease.smooth,
      onUpdate: () => {
        element.textContent = String(Math.round(value.current));
      }
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animate(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.65 });

  counters.forEach((counter) => observer.observe(counter));
}

class NetworkCanvas {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.context = canvas?.getContext("2d");
    this.options = Object.freeze({
      count: options.count || 44,
      distance: options.distance || 130,
      color: options.color || "255,255,255",
      speed: options.speed || 0.22
    });
    this.nodes = [];
    this.width = 0;
    this.height = 0;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.rafId = 0;
    this.active = false;
    this.resizeTimer = 0;
    this.resize = this.resize.bind(this);
    this.draw = this.draw.bind(this);
  }

  mount() {
    if (!this.canvas || !this.context || !canAnimate) return;
    this.active = true;
    this.resize();
    window.addEventListener("resize", this.resize, { passive: true });
    this.draw();
  }

  resize() {
    window.clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(() => {
      const rect = this.canvas.getBoundingClientRect();
      this.width = Math.max(1, rect.width);
      this.height = Math.max(1, rect.height);
      this.canvas.width = Math.floor(this.width * this.pixelRatio);
      this.canvas.height = Math.floor(this.height * this.pixelRatio);
      this.context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
      this.seed();
    }, 80);
  }

  seed() {
    this.nodes = Array.from({ length: this.options.count }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * this.options.speed,
      vy: (Math.random() - 0.5) * this.options.speed,
      radius: Math.random() > 0.82 ? 2 : 1
    }));
  }

  setActive(active) {
    this.active = active;
    if (active && !this.rafId) this.draw();
    if (!active && this.rafId) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  draw() {
    if (!this.active) return;
    const ctx = this.context;
    ctx.clearRect(0, 0, this.width, this.height);

    this.nodes.forEach((node, index) => {
      node.x += node.vx;
      node.y += node.vy;

      if (node.x < 0 || node.x > this.width) node.vx *= -1;
      if (node.y < 0 || node.y > this.height) node.vy *= -1;

      for (let nextIndex = index + 1; nextIndex < this.nodes.length; nextIndex += 1) {
        const next = this.nodes[nextIndex];
        const dx = node.x - next.x;
        const dy = node.y - next.y;
        const distance = Math.hypot(dx, dy);

        if (distance >= this.options.distance) continue;
        const opacity = (1 - distance / this.options.distance) * 0.28;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(next.x, next.y);
        ctx.strokeStyle = `rgba(${this.options.color},${opacity})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.options.color},0.72)`;
      ctx.fill();
    });

    this.rafId = window.requestAnimationFrame(this.draw);
  }
}

function initCanvases() {
  const networks = [
    new NetworkCanvas(document.getElementById("hero-canvas"), {
      count: 38,
      distance: 150,
      color: "200,255,61",
      speed: 0.18
    }),
    new NetworkCanvas(document.getElementById("contact-canvas"), {
      count: 54,
      distance: 145,
      color: "255,255,255",
      speed: 0.25
    })
  ];

  networks.forEach((network) => network.mount());

  document.addEventListener("visibilitychange", () => {
    const active = document.visibilityState === "visible";
    document.documentElement.classList.toggle("page-hidden", !active);
    networks.forEach((network) => network.setActive(active));
  });
}

function initFooter() {
  const year = document.getElementById("year");
  const time = document.getElementById("local-time");
  year.textContent = String(new Date().getFullYear());

  const updateTime = () => {
    time.textContent = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).format(new Date());
  };

  updateTime();
  window.setInterval(updateTime, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initNavigation();
  initScrollMeter();
  initCustomCursor();
  initMagneticElements();
  initHeroParallax();
  initScrollAnimations();
  initProjectRail();
  initCounters();
  initCanvases();
  initFooter();
});
