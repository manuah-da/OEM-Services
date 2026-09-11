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
order. Omit jQuery or Font Awesome only when the site already provides them.

### CFMoto

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
<!-- Keep the CFMoto page CSS after the dependency CSS. -->

<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/cfmoto.min.js"></script>
```

### Polaris Powersports

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
<!-- Keep the Polaris page CSS after the dependency CSS. -->

<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/polaris-powersports.min.js"></script>
```

### Polaris Powersports Canada

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
<!-- Keep the Polaris page CSS after the dependency CSS. -->

<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/polaris-powersports-canada.min.js"></script>
```

### Polaris Snowmobile

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
<!-- Keep the Polaris page CSS after the dependency CSS. -->

<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/polaris-snowmobile.min.js"></script>
```

### Polaris Slingshot

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
<!-- Keep the Polaris page CSS after the dependency CSS. -->

<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/polaris-slingshot.min.js"></script>
```

### Yamaha Powersports

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
<!-- Keep the Yamaha page CSS after the dependency CSS. -->

<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/yamaha-powersports.min.js"></script>
```

### Manufacturer Promotions

Requires the HTML from `Manufacturer Promotion/index.html` and its compiled
`Manufacturer Promotion/styles.css`.

```html
<!-- Load the Manufacturer Promotions CSS before these scripts. -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/manufacturer-promotions.min.js"></script>
```

## Regions

Brand Pages resolve the current domain from customer column `AG` and its region
from `AI`. Use `USA` or `CAN`; promotions with `ALL` apply to both regions.
