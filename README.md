# sudeepcv.github.io — GitHub Pages user site

This repository is your GitHub Pages user site (published at `https://sudeepcv.github.io`). The site is driven by `data.json` so you can update your public profile, skills, experience, education and social links by editing the JSON and pushing to `main`.

## What’s in this repo

- `index.html`, `styles.css`, `script.js` — the static site and renderer
- `data.json` — single source of site content (edit to update the site)
- `assets/` — local logos and images
- `docker-compose.yml`, `Dockerfile` — optional local dev server (browser-sync)
- `scripts/` — (optional) helper scripts that were used during development

## How this is deployed

This repository is configured as a GitHub user site. When you push changes to the `main` branch, GitHub Pages will serve the site at:

```
https://sudeepcv.github.io
```

To publish updates:

```bash
git add .
git commit -m "chore: update site"
git push origin main
```

GitHub Pages will serve the latest content from `main` (it may take a minute to update).

## Local development (optional)

If you want to preview the site locally or use live reload while editing, use the provided Docker Compose setup which runs a browser-sync server and mounts the repository:

```bash
docker-compose up --build
```

Open http://localhost:3000 to preview. The Docker setup is optional — you can simply edit `data.json` and push to `main` to update the live site.



## Editing content

- Update `data.json` to change the visible content. Fields include `profileImage`, `name`, `title`, `tagline`, `about`, `skills`, `experience`, and `education`.
- Prefer local assets (place files in `assets/`) for reliable loading. The renderer prefers local assets when present.

## Tips before pushing

- Verify `data.json` is valid JSON (no trailing commas, properly quoted strings).
- Confirm assets referenced in `data.json` exist in `assets/`.

