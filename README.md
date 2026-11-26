# OEM Services Frontend

This repository publishes the JavaScript automation used by OEM brand pages and Manufacturer Promotions. Each page has its own source script and its own CDN bundle, so changing one brand does not replace another brand's behavior.

The CDN bundle contains JavaScript only. The page HTML and its styles remain in the brand page/site; CSS, Swiper, PapaParse, and other libraries are loaded separately when that page needs them.

## Repository map

- `Brand Pages/<Brand>/script.js` — automation source for that brand.
- `Brand Pages/<Brand>/index.html` — page markup/reference and script includes.
- `Brand Pages/<Brand>/styles.scss` — page styles source; compile and install the CSS separately from this CDN workflow.
- `Manufacturer Promotion/script.js` — Manufacturer Promotions automation.
- `dist/<name>.min.js` — generated CDN files. Do not edit these by hand.
- `build.mjs` — maps each source script to its independent bundle name.
- `scripts/check-build.mjs` — confirms all expected bundles are present.

## Add or update a brand page

1. Create or update `Brand Pages/<Brand>/script.js`. Keep the automation self-contained for that brand; do not edit a different brand's script to change this page.
2. Add a kebab-case output name and source path to `entryPoints` in `build.mjs`. For example:
   ```
   "new-brand": path.join(root, "Brand Pages/New Brand/script.js"),
   ```
   This creates `dist/new-brand.min.js`.
3. Add that output filename to the `bundles` list in `scripts/check-build.mjs` so the build check includes the new page.
4. Add the page's required dependency tags and its bundle URL to this README and to the site's HTML. Keep dependencies before the bundle. WordPress already provides jQuery; include PapaParse, Swiper, or Font Awesome only if the script/page uses them. Load the page CSS separately.
5. Build and verify locally:
   ```
   npm install
   npm run build
   npm run check
   ```
6. Test the page with its real markup and dependencies. Commit both the source and generated `dist/<name>.min.js`, along with the build/check/README updates. Push a feature branch and merge its pull request into `main`.
7. After the merge, install the production URL:
   ```
   https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/<name>.min.js

   ```
   If a CDN cache still serves the previous bundle, purge that exact URL using the jsDelivr purge tool listed below.

### Update an existing page

Edit its source `script.js`, run `npm run build` and `npm run check`, then commit the source and matching `dist` bundle. Once merged to `main`, the existing CDN URL updates; purge the URL if the change is not appearing yet. Never hand-edit `dist/` because the next build overwrites it.

## Site installation

Keep the page's complete HTML and CSS in the site. Load the following tags in the displayed order: dependency CSS, page CSS, then dependency scripts and the OEM Services bundle. WordPress provides jQuery; omit Font Awesome only when the site already provides it.

### CFMoto

```
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

```
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

```
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

```
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

```
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
/>
<!-- Keep the Sea-Doo page CSS after the dependency CSS. -->

<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/sea-doo.min.js"></script>
```

### Ski-Doo

```
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
/>
<!-- Keep the Ski-Doo page CSS after the dependency CSS. -->

<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/ski-doo.min.js"></script>
```

### Polaris Powersports Canada

```
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

```
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

```
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

```
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

### Indian Motorcycle

Use `Brand Pages/Indian Motorcycle/index.html` as the WordPress page markup and install its supplied `styles.css` separately after Swiper CSS. Keep `window.indianDealer` in the page HTML, before the bundle, and customize the dealer contact information, links, actual inventory make filter, and region/state settings for each site. WordPress provides jQuery and processes `[latest_inventory]`. PapaParse is optional because this bundle includes its own CSV parser fallback. Font Awesome is not required. The page CSS includes its Google Fonts import.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11.2.10/swiper-bundle.min.css">
<!-- Install the Indian Motorcycle page CSS separately here. -->
<!-- Keep the page markup and inline window.indianDealer configuration before the scripts. -->
<script src="https://cdn.jsdelivr.net/npm/swiper@11.2.10/swiper-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/indian-motorcycle.min.js"></script>
```

Leave `promotions.ignoreRegion` and `promotions.ignoreStates` set to `false` in production. Configure the actual dealer domain in the OEM Manager (or set the approved `dealerDomain` override for a staging host); `defaultRegion` and `defaultStates` are dealer-specific fallbacks. Promotions are ordered numerically by Carousel Position, use Image 2 in the hero and Image 1 in Current Promotions, and link to `#imc-current-inventory` with an inventory-page fallback if the shortcode has no units. The hero terms panel opens only by clicking its button.

### Manufacturer Promotions

Requires the HTML from `Manufacturer Promotion/index.html` and its compiled `Manufacturer Promotion/styles.css`.

```
<!-- Load the Manufacturer Promotions CSS before these scripts. -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/manufacturer-promotions.min.js"></script>
```

## Bulk Purge Cache

Paste the needed bundle URLs into the [jsDelivr purge tool](https://www.jsdelivr.com/tools/purge), one URL per line:

```
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/manufacturer-promotions.min.js
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/indian-motorcycle.min.js
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/yamaha-powersports.min.js
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/polaris-slingshot.min.js
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/polaris-snowmobile.min.js
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/polaris-powersports-canada.min.js
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/polaris-powersports.min.js
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/cfmoto.min.js
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/lynx.min.js
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/can-am.min.js
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/sea-doo.min.js
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/ski-doo.min.js

```

## Regions

Brand Pages and Manufacturer Promotions resolve the current domain from `AG` and its region from `AI`. New records use `USA` or `CAN`; legacy promotions with region `ALL` continue to apply to both.

State targeting uses `Banner States` in promotion column `P` and the dealer's `Dealer States` in customer column `AK`. A blank `Banner States` value or `ALL` applies to every dealer in the selected region. Otherwise, the promotion is shown when at least one banner state matches one dealer state.

Manufacturer Promotions reads the ordered OEM preferences from `AJ`, renders one featured promotion per preferred OEM, and shows at most six featured cards.