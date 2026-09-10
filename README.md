# OEM Services Frontend

Public CDN scripts for the OEM Brand Pages and Manufacturer Promotions. Each
bundle contains both the page behavior and its promotion automation. The
dashboard, Google Apps Script and private credentials belong in the separate
OEM Manager repository.

## Where to make changes

Each page owns all of its JavaScript behavior and promotion automation. There
is no shared JavaScript between brands.

```text
Brand Pages/CFMoto/script.js
Brand Pages/Polaris Powersports/script.js
Brand Pages/Polaris Powersports Canada/script.js
Brand Pages/Polaris Snowmobile/script.js
Brand Pages/Polaris Slingshot/script.js
Brand Pages/Yamaha Powersports/script.js
Manufacturer Promotion/script.js
```

Edit the `script.js` next to the page you need to change. It includes that
page's sliders, navigation, interactive behavior and spreadsheet automation.
Do not edit files in `dist/`; they are generated files.

## Generate the CDN files

Install the project once:

```bash
npm install
```

After changing any page script, generate and verify the global distribution:

```bash
npm run build
npm run check
```

The build reads every independent `script.js` and generates:

```text
dist/cfmoto.min.js
dist/polaris-powersports.min.js
dist/polaris-powersports-canada.min.js
dist/polaris-snowmobile.min.js
dist/polaris-slingshot.min.js
dist/yamaha-powersports.min.js
dist/manufacturer-promotions.min.js
```

## Update process

1. Modify only the `script.js` belonging to the affected page, whether the
   change is visual behavior or promotion automation.
2. Run `npm run build` and `npm run check`.
3. Test the corresponding file from `dist/`.
4. Commit and push both the source script and its generated bundle.
5. Use a version tag for production or `@main` temporarily during testing.

Example CDN URL:

```html
<script src="https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/polaris-powersports.min.js"></script>
```

Polaris Powersports Canada uses its own independent bundle:

```html
<script src="https://cdn.jsdelivr.net/gh/manuah-da/OEM-Services@main/dist/polaris-powersports-canada.min.js"></script>
```

The page must continue loading jQuery, PapaParse and Swiper before the CDN
automation script, as its original template already does.

## Brand Page regions

Brand Pages resolve the current domain against the customer catalog (`AG`) and
read its region from `AI`. Customer and promotion regions must use the exact
codes `USA` or `CAN`; promotions marked `ALL` apply to both countries. An empty
customer region temporarily falls back to `USA`.
