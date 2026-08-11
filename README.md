# Dheeraj Reddy Mamidi Portfolio

An editorial research-dossier portfolio for an Applied AI / ML Engineer. The
site uses plain HTML, CSS, and JavaScript with locally vendored GSAP files for
the project-case scroll sequence. There is no build step or external runtime.

## Experience

- Full-bleed generated research-dossier cover artwork
- Self-hosted Archivo, Newsreader, and IBM Plex Mono typography
- Scroll-driven full-page case-file transitions on desktop
- Stacked, touch-friendly case studies on mobile
- Production-impact counters and a field-note experience log
- Accessible navigation, focus states, and 24px minimum touch targets
- Reduced-motion and missing-GSAP fallbacks
- Background-tab pausing for continuous ticker motion

## Preview

```bash
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173`.

## Content

Portfolio copy and contact details live in `index.html`. Motion behavior is in
`script.js`; the visual system and responsive layouts are in `styles.css`.

The optimized `assets/research-dossier-hero-v2.webp` is the primary cover
image. Its PNG source is retained for sharing metadata and browser fallback.

## Deployment

Deploy this folder directly to Netlify, GitHub Pages, Vercel, Cloudflare Pages,
or any static server. Use the project root as the publish directory and leave
the build command empty. Fonts, images, GSAP, and ScrollTrigger are all local.

## Verification

- JavaScript syntax checked with `node --check`
- Desktop, tablet, and mobile overflow checks at 1440, 768, and 375 pixels
- Mobile menu, Escape behavior, pinned case states, and static fallbacks tested
- Lighthouse desktop: 100 performance, accessibility, and best practices
- Lighthouse mobile: 96 performance, 100 accessibility and best practices
- Mobile Core Web Vitals lab values: 2.7s LCP, 0.001 CLS, 0ms TBT
