# OEM Services Frontend

Public CDN scripts for OEM Brand Pages and Manufacturer Promotions. Each
bundle includes the page behavior and spreadsheet automation.

## Make and publish changes

Edit the page's `script.js`; never edit `dist/` manually.

```bash
npm install
npm run build
npm run check
```

Commit the source and generated bundle, push the branch, and merge it into
`main`.

## Site installation

Keep the page's complete HTML and CSS. Load the following tags in the displayed
order. WordPress provides jQuery; omit Font Awesome only when the site already
provides it.

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
URL: https://www.jsdelivr.com/tools/purge

https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/manufacturer-promotions.min.js
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/yamaha-powersports.min.js
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/polaris-slingshot.min.js
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/polaris-snowmobile.min.js
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/polaris-powersports-canada.min.js
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/polaris-powersports.min.js
https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/cfmoto.min.js

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
