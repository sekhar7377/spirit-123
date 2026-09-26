# Next.js rebuild validation

- Production build: Next.js static export, React 19, TypeScript checking.
- Desktop hero reviewed at the default 1280px browser viewport.
- Mobile hero reviewed at 390 x 844; image crop corrected and no horizontal overflow observed.
- Entry focus moves to Enter with sound when loading finishes; entering silently works.
- Cast selection updates the image, name and selected tab; keyboard activation checked.
- Supplied audio plays and pauses after user interaction.
- Gallery opens a native dialog, advances to the next artwork and closes with Escape.
- Mobile chapter menu opens, closes, and navigates to the selected section.
- Fixed SSR hydration warning by rounding waveform geometry to deterministic values.
- Video uses the existing official YouTube embed and includes a direct fallback link; external playback depends on YouTube availability.
- The old @studio-freight/lenis package name is retained at the user's explicit request.
