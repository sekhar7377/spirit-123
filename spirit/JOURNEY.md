# Opening journey treatment

The crimson Spirit opening sits on an ivory film-photo mosaic. Twenty-five released-film poster references, from Eeswar (2002) through The Raja Saab (2026), plus the supplied Spirit campaign photograph form a chronological 26-image archive. It is a curated film journey, not a claim to include every cameo, documentary or a million distinct photographs.

`dist/assets/journey/manifest.json` records each title, year, source page and original image URL. Sources: https://prabhas.in/movies, IMDb's Mr. Perfect poster, and Sun NXT's Rebel artwork. Copyright remains with the respective owners. The fan-site catalog is used for imagery, not as an official studio source.

`dist/journey.js` renders the ordered archive into 240 photo cells and reuses that texture on two independently drifting planes. Warm monochrome grading, an ivory center veil and a protected control area keep the title dominant. Animation pauses when the entry closes or the document is hidden and respects reduced motion. Failed image loads fall back to the ivory opening.

`dist/living-hero.js` maps a subtle ember, lighter flame and smoke to normalized coordinates in the first hero image, accounting for object-fit, object-position and transformed bounds. The effect disappears on the second image. Reduced motion keeps a static glow without moving smoke.

QA: desktop and 390px mobile opening and hero visually checked; no horizontal overflow in the mobile check; browser error log empty; JavaScript syntax and Git whitespace checks passed.
