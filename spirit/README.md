# Spirit — Cinematic Next.js Experience

Next.js App Router, React 19, TypeScript, Tailwind CSS v4, Framer Motion and the explicitly requested `@studio-freight/lenis` package. Lenis's old package name is deprecated upstream; it is retained to match the requested stack.

## Run

```sh
npm ci
npm run dev
```

Local preview: http://127.0.0.1:4174

```sh
npm run build
```

Next.js statically exports to `out`; `scripts/export.cjs` copies the completed build to `dist` for the existing Sites deployment. `app/` and `components/` are the authoritative application source. Previous plain-JavaScript files remain as historical reference and are not loaded by the new page.

## Experience

An ivory/crimson opening with the campaign title lettering; photographic hero; editorial film section; animated cast selector; supplied audio with seek controls; official YouTube sound-story dialog; gallery and downloadable images; release section. Framer Motion handles scroll-linked movement, spring hover physics and transitions. Magnetic controls use Euclidean pointer distance. Reduced-motion preferences disable smooth scrolling and ambient motion. Dialogs use native focus containment and Escape support. Cast tabs support arrow-key navigation.

No photo-mosaic background is used. The site is an independent fan concept, not an official production site. Existing supplied campaign assets and credits are retained. Source assets are in `public/assets`.

## Title motion and officer section

All Spirit wordmarks share an in-view entrance and gentle continuous lettering motion; silver stars rotate clockwise. Reduced-motion mode holds the artwork still. The director line directly under the opening title is removed. A full-width Prabhas officer section reuses the project's earlier generated artwork and labels it as an AI-generated fan concept.
