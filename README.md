# OEM Services Frontend

This repository publishes the JavaScript automation used by OEM brand pages
and Manufacturer Promotions. Each page has its own source script and its own
CDN bundle, so changing one brand does not replace another brand's behavior.

The CDN bundle contains JavaScript only. The page HTML and its styles remain in
the brand page/site; CSS, Swiper, PapaParse, and other libraries are loaded
separately when that page needs them.

## Repository map

- `Brand Pages/<Brand>/script.js` — automation source for that brand.
- `Brand Pages/<Brand>/index.html` — page markup/reference and script includes.
- `Brand Pages/<Brand>/styles.scss` — page styles source; compile and install
  the CSS separately from this CDN workflow.
- `Manufacturer Promotion/script.js` — Manufacturer Promotions automation.
- `dist/<name>.min.js` — generated CDN files. Do not edit these by hand.
- `build.mjs` — maps each source script to its independent bundle name.
- `scripts/check-build.mjs` — confirms all expected bundles are present.

## Add or update a brand page

1. Create or update `Brand Pages/<Brand>/script.js`. Keep the automation
   self-contained for that brand; do not edit a different brand's script to
   change this page.
2. Add a kebab-case output name and source path to `entryPoints` in
   `build.mjs`. For example:

   ```js
   "new-brand": path.join(root, "Brand Pages/New Brand/script.js"),
   ```

   This creates `dist/new-brand.min.js`.
3. Add that output filename to the `bundles` list in
   `scripts/check-build.mjs` so the build check includes the new page.
4. Add the page's required dependency tags and its bundle URL to this README
   and to the site's HTML. Keep dependencies before the bundle. WordPress
   already provides jQuery; include PapaParse, Swiper, or Font Awesome only if
   the script/page uses them. Load the page CSS separately.
5. Build and verify locally:

   ```bash
   npm install
   npm run build
   npm run check
   ```

6. Test the page with its real markup and dependencies. Commit both the source
   and generated `dist/<name>.min.js`, along with the build/check/README updates.
   Push a feature branch and merge its pull request into `main`.
7. After the merge, install the production URL:

   ```text
   https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/<name>.min.js
   ```

   If a CDN cache still serves the previous bundle, purge that exact URL using
   the jsDelivr purge tool listed below.

### Update an existing page

Edit its source `script.js`, run `npm run build` and `npm run check`, then commit
the source and matching `dist` bundle. Once merged to `main`, the existing CDN
URL updates; purge the URL if the change is not appearing yet. Never hand-edit
`dist/` because the next build overwrites it.

## Site installation

Keep the page's complete HTML and CSS in the site. Load the following tags in
the displayed order: dependency CSS, page CSS, then dependency scripts and the
OEM Services bundle. WordPress provides jQuery; omit Font Awesome only when the
site already provides it.

### CFMoto

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
/>
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
/>
<!-- Keep the CFMoto page CSS after the dependency CSS. -->

<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/cfmoto.min.js"></script>
```

### Polaris Powersports

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.css"
/>
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
/>
<!-- Keep the Polaris page CSS after the dependency CSS. -->

<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/polaris-powersports.min.js"></script>
```

### Lynx

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
/>
<!-- Keep the Lynx page CSS after the dependency CSS. -->

<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/lynx.min.js"></script>
```

### Can-Am

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
/>
<!-- Keep the Can-Am page CSS after the dependency CSS. -->

<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/can-am.min.js"></script>
```

### Sea-Doo

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
/>
<!-- Keep the Sea-Doo page CSS after the dependency CSS. -->

<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/sea-doo.min.js"></script>
```

### Polaris Powersports Canada

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.css"
/>
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
/>
<!-- Keep the Polaris page CSS after the dependency CSS. -->

<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/polaris-powersports-canada.min.js"></script>
```

### Polaris Snowmobile

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.css"
/>
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
/>
<!-- Keep the Polaris page CSS after the dependency CSS. -->

<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/polaris-snowmobile.min.js"></script>
```

### Polaris Slingshot

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.css"
/>
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
/>
<!-- Keep the Polaris page CSS after the dependency CSS. -->

<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/polaris-slingshot.min.js"></script>
```

### Yamaha Powersports

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
/>
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
/>
<!-- Keep the Yamaha page CSS after the dependency CSS. -->

<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/yamaha-powersports.min.js"></script>
```

### Manufacturer Promotions

Requires the HTML from `Manufacturer Promotion/index.html` and its compiled
`Manufacturer Promotion/styles.css`.

```html
<!-- Load the Manufacturer Promotions CSS before these scripts. -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/manufacturer-promotions.min.js"></script>
```

## Bulk Purge Cache

Paste the needed bundle URLs into the [jsDelivr purge tool](https://www.jsdelivr.com/tools/purge),
one URL per line:

```text
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/manufacturer-promotions.min.js
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/yamaha-powersports.min.js
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/polaris-slingshot.min.js
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/polaris-snowmobile.min.js
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/polaris-powersports-canada.min.js
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/polaris-powersports.min.js
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/cfmoto.min.js
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/lynx.min.js
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/can-am.min.js
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/sea-doo.min.js
```

## Regions

Brand Pages and Manufacturer Promotions resolve the current domain from `AG`
and its region from `AI`. New records use `USA` or `CAN`; legacy promotions
with region `ALL` continue to apply to both.

State targeting uses `Banner States` in promotion column `P` and the dealer's
`Dealer States` in customer column `AK`. A blank `Banner States` value or `ALL`
applies to every dealer in the selected region. Otherwise, the promotion is
shown when at least one banner state matches one dealer state.

Manufacturer Promotions reads the ordered OEM preferences from `AJ`, renders one
featured promotion per preferred OEM, and shows at most six featured cards.
