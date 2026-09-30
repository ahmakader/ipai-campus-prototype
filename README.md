# IPAI campus prototype

Interactive bilingual campus explorer with a fixed aerial overview, building labels, connected video navigation, building comparisons and illustrative office floor plans.

## Run locally

Requires Node.js 22 or newer, npm, curl and unzip.

```sh
npm ci
bash scripts/download-media.sh
npm run dev
```

`npm run build` creates a portable static website in `dist/`. Serve that directory with a web server. Relative asset URLs support GitHub Pages beneath the repository path.

## Publishing

GitHub Actions builds and deploys `main` to GitHub Pages. Existing media is stored in the `media-v1` release as `ipai-campus-media-v1.zip`. The download script checks its SHA-256 before extracting it. This keeps large videos outside the source history. No new AI videos were generated for this export.

## Prototype scope

Building profiles and architectural images are based on the supplied July 2025 materials. Images © IPAI/MVRDV and their respective owners. Office floor plans, office areas and capacities are illustrative, not confirmed design or availability. Camera transitions and ambient videos were generated previously from supplied renders. The contact form is a demonstration and does not send messages. Favorites and comparisons are stored in the browser.

The export preserves the supplied official IPAI logo, fixed exploration overview, office comparison features and latest gentler scrolling behavior. No server, paid hosting or application secrets are required.
