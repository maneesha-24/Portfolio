# Maneesha P.C. — Portfolio

A single-page portfolio site — plain HTML, CSS, and JavaScript, no build step, no frameworks. Free to host on GitHub Pages.

## What's inside

```
portfolio/
├── index.html                    ← all page content lives here
├── css/style.css                 ← colors, fonts, layout, animations
├── js/
│   ├── script.js                 ← intro animation, nav, scroll effects, tilt, background
│   └── vendor/three.min.js       ← Three.js r128 (MIT licence), bundled so no CDN is needed
└── assets/
    ├── images/
    │   ├── favicon.svg           ← browser tab icon
    │   ├── about-cutout.png      ← hero photo
    │   ├── interests/            ← illustrations for "Outside the Desk"
    │   └── projects/             ← screenshots for each project card
    ├── resume/
    │   └── Maneesha_PC_Resume.pdf ← linked from the "Resume" button
    └── reports/                  ← project PDF write-ups, linked from each "Report" button
```

## 1. Preview it locally

Easiest way in VS Code: install the **Live Server** extension, right-click `index.html` → "Open with Live Server". This gives you working smooth-scroll, fonts, and animations exactly as they'll appear live.

(You can also just double-click `index.html` to open it in a browser directly — everything will work, but Live Server avoids a couple of minor file:// quirks.)

## 2. Push it to GitHub

```bash
cd portfolio
git init
git add .
git commit -m "Initial portfolio"
git branch -M main
git remote add origin https://github.com/maneesha-24/YOUR-REPO-NAME.git
git push -u origin main
```

## 3. Make it live — free, via GitHub Pages

You have two options:

**Option A — cleanest URL (recommended).** Name the GitHub repo exactly `maneesha-24.github.io`. As soon as you push to it, GitHub automatically publishes it at:
```
https://maneesha-24.github.io
```
No extra setup step needed.

**Option B — any other repo name** (e.g. `portfolio`). After pushing:
1. Go to the repo on GitHub → **Settings** → **Pages**
2. Under "Build and deployment", set **Source** to "Deploy from a branch"
3. Branch: `main`, folder: `/ (root)` → **Save**
4. Your site goes live at `https://maneesha-24.github.io/portfolio/` within a minute or two.

## Making changes later

- **Text content** (About paragraph, project descriptions, Why Me, etc.) → edit directly in `index.html`, it's all plain readable HTML with comments marking each section.
- **Colors, fonts, spacing** → `css/style.css`, all colors are defined once at the top under `:root` as CSS variables (`--color-coral`, `--color-navy`, etc.) so you can retheme by changing a handful of lines.
- **Swap a photo or project screenshot** → just replace the file in `assets/images/` (or `assets/images/projects/`) keeping the same filename, or update the filename referenced in `index.html`.
- **Add a 5th project** → copy one `<article class="project-card">...</article>` block in `index.html`, update its text/links/image, and drop the screenshot + PDF into the matching `assets/` folder.

## Notes

- No paid services, no backend, and no third-party scripts — Three.js is bundled in `js/vendor/`, and the only external request is Google Fonts.
- "Hire Me" opens the visitor's email client directly (mailto link). The whole site is static, so GitHub Pages hosting is free indefinitely.
- Animations respect `prefers-reduced-motion`, and the layout is responsive down to small phones.
