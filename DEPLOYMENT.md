# Spirit source and deployment

The complete current website is in `spirit/`: application source, public images,
audio, fonts and licenses, package lock, and exported `dist/` output.

Use **`codex/spirit-experience`**, the repository's default branch, for current
production source. Completed Spirit changes must be committed and pushed there;
do not leave newer work only on `codex/n` or another working branch.

For Vercel, select root directory `spirit`, framework Next.js, install with
`npm ci`, and build with `npm run build`. The static export is `spirit/out`.
Leave `NEXT_PUBLIC_BASE_PATH` unset for a root-domain Vercel deployment.

The GitHub Pages workflow uses the same source with
`NEXT_PUBLIC_BASE_PATH=/spirit-123`.

Files outside `spirit/` belonging to other local projects are not part of this site.

## Source reconciliation, October 22, 2026

The current hosted Spirit site is Sites version 37, source commit
`a9e3787691151ef64c51425debe602b95835928e`. Its October photographic
surface/particle renderer and `prabhas-celestial-profile.jpg` supersede the older
long-haired cosmic artwork. Source and deployed assets were recovered from the
Site repository, not reconstructed from the outdated local checkout.

Before future edits, compare the hosted Site version with this checkout and
retrieve newer hosted source first. Do not publish an older local copy over it.
