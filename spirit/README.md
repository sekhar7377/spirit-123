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

All Spirit wordmarks share an in-view entrance and gentle continuous lettering motion; silver stars rotate clockwise. Reduced-motion mode holds the artwork still. The director line directly under the opening title is removed. A new younger Prabhas officer concept forms from a WebGL2 particle field with volumetric scatter, cursor-velocity repulsion, swirling trails, and smooth return. Desktop starts with 1,572,864 particles and adapts to 393,216 under sustained load; mobile uses 131,072. Pause/reform controls, offscreen suspension, context-loss fallback and reduced-motion artwork are included. The generated concept is labelled as fan artwork.


The officer artwork was regenerated using first-look-clean.png as the physical reference: long wavy hair, lean forearms and a tailored silhouette. The shader remains a point cloud at full formation; mouse velocity drives varied scattering and tangential motion, then decays after movement stops. The original hero image is unchanged.

## Current cosmic direction
The police section is replaced by prabhas-cosmic-portrait.png: a clean-shaven, short-haired, waist-up celestial fan concept with a bent right arm. The WebGL scene preserves its white constellation network, applies slow chest breathing, renders 1,800 drifting background stars, and retains cursor scattering. This is a real-time browser animation, not an 8K video export or a verified film costume likeness.

## Articulated particle motion
The live renderer now uses image-derived weighted neck and arm pivots, chest expansion, and coordinated body sway. A parametric rounded-square bottle shares the wrist transform. Portrait particles retain the source likeness; this is a shallow volumetric reconstruction, not a scanned full 3D human. Reduced-motion fallback remains a still. Adaptive particle sizes preserve brightness at lower GPU densities.
