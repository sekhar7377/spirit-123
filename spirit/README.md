# Spirit — cinematic website concept

An independent Spirit film website using authentic campaign title artwork and original posters. Not affiliated with the filmmakers.

## Run
From this directory: `node server.cjs`, then open http://127.0.0.1:4173.
The static site is in `dist`; no build step or package installation is required.

## Experience
One continuous scrolling experience: opening, film, cast, animated title interlude, theatre, gallery, sound, release and credits. In-page navigation preserves the document and audio player. The opening draws the Spirit lettering left to right alongside a red underline and 1–100% sequence indicator. Two faceted silver stars rotate in perspective; glossy crimson drips animate from the lettering. Includes pointer-responsive atmosphere, a fullscreen artwork viewer, campaign video and the supplied audio with waveform/seek/volume. Sound requires a user gesture. Reduced motion and keyboard controls are provided.

The Spirit lettering is actual campaign artwork; the rotating stars and blood effects are custom code. General UI text uses Manrope and Barlow Condensed, not claimed as official production fonts. Cleaned photographs use ImageGen to remove printed text and logos; originals are preserved. See IMAGE-EDITS.md for prompts and provenance. Local video is 848 × 480, not native 4K.

## Edit and Git
Edit `flow-main-v3.js` and `flow-audio-v3.js`, then run `node build-v3.cjs`. Title rendering is in `dist/title-v3.js` and `.css`; layout overrides are in `dist/flow-v3.css`. The static HTML entry is `dist/index.html`.

The workspace Git remote is https://github.com/sekhar7377/spirit-123.git. Source, website assets and project documentation are committed. Reproducible ZIP/tar bundles and the nested Sites checkout are ignored; website publishing uses the separate Sites repository.

## Verification
Checked desktop and 390px mobile layouts, loader progress, title rendering, in-page navigation preserving all sections, gallery opening, audio start/pause/skip, image loading and horizontal overflow. Browser errors and JavaScript syntax were checked. A specialist implemented the title component and reviewed audio initialization; integration and visual QA were performed by the primary agent.
