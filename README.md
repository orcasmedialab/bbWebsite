# Bussy Botanicals Landing Page

A lightweight static landing page built for quick deployment to GitHub Pages or easy migration into a local repo.

## Structure
- `index.html`
- `assets/css/styles.css`
- `assets/js/script.js` (menu, audio, signup form, mobile buy bar)
- `assets/js/motion.js` (animation layer, see below)
- `assets/audio/brand-theme.mp3`
- `assets/images/`
  - `bbLogo-rounded-64.png` (brand mark used in the header)
  - `product/`
    - `bbProductImage*.png`: original 1254px listing images (source files, not referenced by the page)
    - `hero-feel-fresh.jpg`: listing image 6, retouched to remove the printed "Feel Fresh. Look Good."
      tagline, divider and leaf mark, used in the hero
    - `product-shower-ready.jpg`: text-free crop of image 5, used in "The Wash"
    - `how-to-cleaner-routine.jpg`: text-free crop of image 2, used in "How to use"
    - `what-its-for-back.jpg`: royalty-free stock photo used in "What it's for" (see credits)
  - `favicons/` (favicon set, `site.webmanifest`, `og-image.png`)

## Product links
The Amazon listing (ASIN `B0HJV56RDN`) is linked as `https://www.amazon.com/dp/B0HJV56RDN` throughout `index.html`.
The Product structured data (JSON-LD in `<head>`) includes the price; update it if the Amazon price changes.

## Motion
`assets/js/motion.js` has no dependencies and keeps motion deliberately small:
- **Hero entrance:** once the hero photo is decoded, `.hero` gets `is-in`; the photo curtain-reveals while
  settling from a slight zoom, and the headline words rise out of masks (all CSS transitions).
- **Scroll-lit statement:** the text in `[data-scroll-words]` is split into words that brighten one by one
  as the statement scrolls through the viewport.
- Gentle fade-ups for `data-reveal` / `data-reveal-group`, and a smooth FAQ open/close.

An inline script in `<head>` adds `motion-ok` to `<html>` only when JS runs and the visitor hasn't enabled
"reduce motion"; without it, everything renders statically.

## Site music
`assets/audio/brand-theme.mp3`, handled at the bottom of `assets/js/script.js`:
- **Computers:** the song tries to play on load. Browsers block sound until the visitor's first click or key
  press (scrolling doesn't count), so if it's blocked it starts on that first interaction.
- **Phones/tablets:** no autoplay and no download; a "Play the Bussy Song" button appears instead.
- The speaker button in the header mutes/unmutes. The choice is remembered (`localStorage` key
  `bbAudioMuted`) only when the visitor clicks it; run `resetExperience()` in dev tools to clear it.

## Waitlist / newsletter form
Submissions go to Formspree (form `mnjoanog`) via `fetch` in `script.js`. View and export them in the Formspree dashboard.

## Coupon popup
Disabled via `ENABLE_COUPON_CAMPAIGN` in `script.js`. The markup is kept so it can be reused with a real promo code.

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
- **High priority: keep the Product JSON-LD price and availability in sync with Amazon.** `index.html`
  hard-codes `"price": "19.99"` and `"availability": "https://schema.org/InStock"`. The Amazon price will
  go up in steps after the review-first launch period and stock can change, so these should come from the
  Amazon listing (the source of truth) instead of manual website edits, e.g. a scheduled job that reads the
  listing's price/availability and rewrites the JSON-LD. Until that exists, update both fields by hand
  whenever the Amazon price or stock status changes; stale structured data is easy to miss.
- **Soon: proper social preview image.** People are already sharing the URL, and link previews use
  `assets/images/favicons/og-image.png` (512×512 logo). Replace it with a 1200×630 preview image and update
  `og:image:width` / `og:image:height` in `index.html` to match.
- **Make the Bussy Song opt-in on desktop too.** `assets/js/script.js` currently tries to autoplay on
  desktop and otherwise starts on the first click/key press. Switch desktop to the same opt-in
  "Play the Bussy Song" button that phones already get.
- Swap the early-user testimonials for unbiased Amazon reviews once enough of those exist.
- **Content research: Japan / lactic-acid background.** The FAQ's Japan reference stays for now: it rests
  on historical Japanese cosmetic and home-remedy use of lactic-acid-containing ingredients, and lactic acid
  is a key ingredient in the wash. Gather credible scientific publications and historical sources that
  substantiate this, to support a possible educational section for customers later.
- Add your real social links.

## Image credits
- `what-its-for-back.jpg`: photo by Diego Lozano on Unsplash
  (https://unsplash.com/photos/Vps2k0FJcBE), used under the Unsplash License (free for commercial use,
  attribution not required).
