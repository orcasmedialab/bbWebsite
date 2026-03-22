# Bussy Botanicals Landing Page

A lightweight static landing page built for quick deployment to GitHub Pages or easy migration into a local repo.

## Structure
- `index.html`
- `assets/css/styles.css`
- `assets/js/script.js`
- `assets/audio/brand-theme.mp3`
- `assets/images/` (drop future product art here)
  - `logo.png` (placeholder file — replace with your PNG brand mark)
  - `favicons/` (favicon set, `site.webmanifest`, `og-image.png`)

## Quick preview options

### Option 1: Open directly
Double-click `index.html` and it will open in your browser.

### Option 2: Run a tiny local server
From the project folder:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## GitHub Pages deployment
1. Create a new GitHub repo.
2. Upload these files to the repo root.
3. In GitHub, go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the main branch and `/root`.
6. Save, then wait for GitHub Pages to publish.

## Recommended next edits
- Replace the front-end-only waitlist form with Formspree, ConvertKit, Mailchimp, or Buttondown.
- Swap placeholder product art with real renders or photos.
- Add compliance-reviewed product copy once your formula and claims are finalized.
- Add your real social links and favicon.
- Replace `assets/images/logo.png` with your actual PNG logo (keep the same filename for an instant swap, or update `.brand-logo` in the CSS if you change it).
