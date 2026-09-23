# Spirit opening concept — v1

20-second fan-concept opening, rendered at 3840 × 2160, 24 fps, H.264 + stereo AAC. The underlying composition is 1920 × 1080 and is upscaled with Lanczos for the 4K export. This is animated generated still artwork, not newly generated live-action footage or an official studio film.

## Files

- `spirit-opening-4k.mp4`: master delivery.
- `spirit-opening-preview.mp4`: lighter 1080p review copy.
- `hero-generated.png`, `macro-generated.png`: original artwork generated with the built-in image-generation tool from the supplied September 24 reference images.
- `render.py`: reproducible camera, particles, title, clockwise faceted-star animation, procedural stereo sound bed and export.
- `qa-*.jpg`: sampled composition frames for review.
- `reference-*.jpg`: frames inspected from the three supplied reference videos. They are not included in the finished film.

## Creative timeline

0–4.5s: bandaged hand / amber glass macro reveal. 4.5–7.5s: uniform detail. 7.5–12.5s: face push-in. 12.5–15.7s: wide hero reveal. 15.7–20s: left-to-right Spirit lettering, clockwise silver stars, red underline and final fade. No bleeding effects. The score is synthesized from scratch in the renderer, not copied from the supplied fan edits.

## Generation prompts

Hero: Create ONE original seamless 16:9 photoreal cinematic artwork highest resolution ideally 3840x2160. Reference images for Prabhas identity, police uniform, bandaged hand and bottle, crimson Spirit palette. Prabhas centered slightly right waist-up in a dark monumental station corridor, faithful recognizable face, swept-back hair and beard, intensely composed, khaki police uniform, two silver shoulder stars. Sunglasses held in left hand, right hand bandaged gripping amber glass bottle low beside him. Pale grand staircase and blurred crowd behind deep shadows, inspired by supplied full-body photo. Strong warm cinematic side light, smoky volumetric shafts, charcoal shadows and negative space left, subtle crimson light, realistic skin and fabric, premium anamorphic film photography. New scene from scratch, not a collage. Absolutely NO text, titles, watermarks, usernames, logos, social interface or lettering on badges. No blood. Accurate hands and anatomy. Background plate for cinematic opening camera movement.

Macro: Original cinematic 16:9 widescreen extreme closeup of bandaged masculine hand gripping an elegant square amber liquor bottle near his side, khaki fabric on right, no face. Inspired by supplied two reference photographs, reconstruct a new horizontal shot from scratch, no text, no logos, no watermarks or UI. Bottle and hand on right third, vast smoky black negative space on left, razor warm diagonal window light illuminating gauze threads and amber caustics, dark station interior, subtle dust. Premium anamorphic cinema macro lens with shallow focus, rich blacks, photorealistic glass and hand anatomy. Highest image resolution. No blood, no firearm.

## Rebuild

Python dependencies: Pillow, numpy, imageio-ffmpeg. Run `python render.py` from any working directory. Optionally set `FFMPEG` to an existing executable. Intermediates in `work/` and local downloaded renderer dependencies are ignored by Git. Final media and source are tracked.
