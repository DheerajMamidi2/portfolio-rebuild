(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktopMotion = window.matchMedia("(min-width: 761px)");
  const loader = document.querySelector("#loader");
  const loaderCounter = document.querySelector("#loader-counter");
  const loaderProgress = document.querySelector("#loader-progress");
  const siteHeader = document.querySelector("#site-header");
  const menuToggle = document.querySelector("#menu-toggle");
  const nav = document.querySelector("#nav");
  const scrollProgress = document.querySelector("#scroll-progress");
  const caseCurrent = document.querySelector("#case-current");
  const caseTotal = document.querySelector("#case-total");
  const caseProgress = document.querySelector("#case-progress");
  const year = document.querySelector("#year");
  const localTime = document.querySelector("#local-time");
  const motionContexts = [];

  const finishLoading = () => {
    window.clearTimeout(window.__portfolioLoaderGuard);
    root.classList.remove("is-loading");
    body.classList.remove("is-locked");
    loader?.remove();
  };

  const initLoader = () => {
    if (reducedMotion.matches || !window.gsap) {
      finishLoading();
      return;
    }

    const progressState = { value: 0 };
    const timeline = window.gsap.timeline({
      defaults: { ease: "power4.out" },
      onComplete: finishLoading,
    });

    timeline
      .to(progressState, {
        value: 100,
        duration: 0.85,
        ease: "power2.inOut",
        onUpdate: () => {
          const value = Math.round(progressState.value);
          if (loaderCounter) loaderCounter.textContent = String(value).padStart(2, "0");
          if (loaderProgress) loaderProgress.style.transform = `scaleX(${value / 100})`;
        },
      })
      .to(".loader__statement span", {
        yPercent: -110,
        opacity: 0,
        duration: 0.48,
        stagger: 0.04,
      }, "-=0.2")
      .to(loader, {
        yPercent: -100,
        duration: 0.72,
      }, "-=0.15");
  };

  const closeMenu = () => {
    nav?.classList.remove("is-open");
    menuToggle?.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open navigation");
  };

  const initNavigation = () => {
    menuToggle?.addEventListener("click", () => {
      const isOpen = nav?.classList.toggle("is-open") ?? false;
      menuToggle.classList.toggle("is-open", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });

    nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
        menuToggle?.focus();
      }
    });
  };

  const initClock = () => {
    if (year) year.textContent = String(new Date().getFullYear());

    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Denver",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZoneName: "short",
    });

    const update = () => {
      if (localTime) localTime.textContent = formatter.format(new Date());
    };

    update();
    window.setInterval(update, 30000);
  };

  const initScrollState = () => {
    let ticking = false;

    const update = () => {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(window.scrollY / maxScroll, 1);
      if (scrollProgress) scrollProgress.style.transform = `scaleX(${progress})`;
      siteHeader?.classList.toggle("is-scrolled", window.scrollY > 18);
      ticking = false;
    };

    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  };

  const initCounters = () => {
    const counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;

    if (reducedMotion.matches || !window.gsap || !window.ScrollTrigger) {
      counters.forEach((counter) => {
        counter.textContent = counter.dataset.count ?? "0";
      });
      return;
    }

    counters.forEach((counter) => {
      const value = Number(counter.dataset.count ?? 0);
      const state = { value: 0 };
      window.gsap.to(state, {
        value,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: counter,
          start: "top 86%",
          once: true,
        },
        onUpdate: () => {
          counter.textContent = String(Math.round(state.value));
        },
      });
    });
  };

  const initMotion = () => {
    if (reducedMotion.matches || !desktopMotion.matches || !window.gsap || !window.ScrollTrigger) return;

    root.classList.add("has-motion");
    window.gsap.registerPlugin(window.ScrollTrigger);

    const pageContext = window.gsap.context(() => {
      window.gsap.set(".hero__line > span", { yPercent: 110 });
      window.gsap.set([".hero__brief", ".hero__foot"], { opacity: 0, y: 18 });

      window.gsap.timeline({ defaults: { ease: "power4.out" }, delay: 0.06 })
        .to(".hero__line > span", { yPercent: 0, duration: 0.95, stagger: 0.08 })
        .to(".hero__brief", { opacity: 1, y: 0, duration: 0.62 }, 0.48)
        .to(".hero__foot", { opacity: 1, y: 0, duration: 0.5 }, 0.62);

      window.gsap.to(".hero__art img", {
        yPercent: 8,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      const deck = document.querySelector("#case-deck");
      const stage = document.querySelector("#case-stage");
      if (deck && stage) {
        const cases = window.gsap.utils.toArray(".case");
        const finalCaseIndex = Math.max(0, cases.length - 1);
        if (caseTotal) caseTotal.textContent = String(cases.length).padStart(2, "0");
        window.gsap.set(cases.slice(1), { yPercent: 100 });
        window.gsap.set(cases, { zIndex: (index) => index + 1 });

        const caseTimeline = window.gsap.timeline({
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: `+=${Math.max(1, finalCaseIndex) * 100}%`,
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const index = Math.min(finalCaseIndex, Math.round(self.progress * finalCaseIndex));
              if (caseCurrent) caseCurrent.textContent = String(index + 1).padStart(2, "0");
              if (caseProgress) caseProgress.style.transform = `scaleX(${self.progress})`;
              const scanner = document.querySelector(".scanner");
              const radarNeedle = document.querySelector(".radar i");
              if (scanner) scanner.style.transform = `translateY(${self.progress * 210}px)`;
              if (radarNeedle) radarNeedle.style.transform = `rotate(${self.progress * 310 - 36}deg)`;
            },
          },
        });

        cases.slice(1).forEach((caseElement) => {
          caseTimeline.to(caseElement, {
            yPercent: 0,
            duration: 1,
            ease: "none",
          });
        });
      }

      window.gsap.from(".thesis__lead h2", {
        opacity: 0,
        y: 42,
        duration: 0.9,
        ease: "power4.out",
        scrollTrigger: { trigger: ".thesis__lead", start: "top 78%", once: true },
      });

      window.gsap.from(".contact h2 span", {
        opacity: 0,
        y: 54,
        duration: 0.9,
        stagger: 0.1,
        ease: "power4.out",
        scrollTrigger: { trigger: ".contact", start: "top 58%", once: true },
      });
    });

    motionContexts.push(pageContext);
  };

  const refreshMotion = () => {
    if (!window.ScrollTrigger || reducedMotion.matches) return;
    window.requestAnimationFrame(() => window.ScrollTrigger.refresh());
  };

  const initVisibility = () => {
    document.addEventListener("visibilitychange", () => {
      body.classList.toggle("is-paused", document.hidden);
    });
  };

  const destroyMotion = () => {
    motionContexts.splice(0).forEach((context) => context.revert());
    window.ScrollTrigger?.getAll().forEach((trigger) => trigger.kill());
  };

  reducedMotion.addEventListener?.("change", () => window.location.reload());
  desktopMotion.addEventListener?.("change", () => window.location.reload());
  window.addEventListener("pagehide", destroyMotion, { once: true });
  window.addEventListener("load", refreshMotion, { once: true });

  initNavigation();
  initClock();
  initScrollState();
  initVisibility();
  initLoader();
  initCounters();
  initMotion();

  document.fonts?.ready.then(refreshMotion);
})();
