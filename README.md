# Dheeraj Reddy Mamidi Portfolio

A cinematic, responsive portfolio for an Applied AI / ML Engineer. The site uses
plain HTML, CSS, and JavaScript, with locally vendored GSAP files for scroll
choreography. There is no build step.

## Project

```text
portfolio-rebuild/
├── assets/
│   ├── ai-system-hero.png
│   ├── ai-system-hero.webp
│   └── vendor/
│       ├── gsap.min.js
│       └── ScrollTrigger.min.js
├── index.html
├── styles.css
├── script.js
└── resume.pdf
```

The optimized WebP image is used by default. The PNG is retained as a fallback.

## Experience

- Animated system loader and kinetic hero typography
- Pointer-reactive hero media and custom contextual cursor
- Scroll-driven project rail on desktop
- Stacked project sequence on mobile
- Animated production-impact counters
- Live network canvases that pause in background tabs
- Magnetic calls to action and active-section navigation
- Reduced-motion and low-end-device fallbacks

## Preview

```bash
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173`.

## Content

Most portfolio copy is in `index.html`. Motion behavior is in `script.js`, and
the visual system is defined by CSS variables at the top of `styles.css`.

Replace the email, GitHub URL, résumé, or project copy directly in `index.html`.

## Deployment

This folder can be deployed as a static site on Netlify, GitHub Pages, Vercel,
Cloudflare Pages, or any standard web server. The publish directory is the project
root and no build command is required.

The production host should be able to reach:

- `fonts.googleapis.com` and `fonts.gstatic.com`

GSAP and ScrollTrigger are included locally. The page remains readable if those
scripts are unavailable, but scroll choreography is disabled.

## Verification

- JavaScript syntax checked with `node --check`
- Desktop visual and pinned-scroll checks at 1440 × 900
- Mobile visual, menu, and overflow checks at 375 × 812
- Lighthouse desktop: 100 accessibility, best practices, SEO, and agentic browsing
- Lighthouse mobile: 100 accessibility, best practices, SEO, and agentic browsing
- Local endpoints verified for the page, résumé, hero image, and GSAP assets
