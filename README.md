# OEM Services Frontend

Public frontend distribution for OEM Brand Pages and Manufacturer Promotions.
The private OEM Manager and Google Apps Script backend must remain in their
separate private repository.

## Repository layout

```text
Brand Pages/                    Original working templates and visual assets
Manufacturer Promotion/        Original Manufacturer Promotions template
src/core/                       Shared CSV, customer, region and href logic
src/adapters/                   DOM and Swiper implementations by page family
src/entries/                    One build entry per CDN bundle
dist/                           Generated files published through the CDN
scripts/                        Build verification utilities
```

The original templates remain untouched during the first migration phase. Once
a generated bundle is verified against its template, its old inline promotions
loader can be replaced with the corresponding CDN script.

## Install and build

```bash
npm install
npm run build
npm run check
```

Use watch mode during development:

```bash
npm run build:watch
```

Do not edit `dist/` directly. It is generated from `src/`.

## Bundles

```text
dist/cfmoto.min.js
dist/polaris-powersports.min.js
dist/polaris-snowmobile.min.js
dist/polaris-slingshot.min.js
dist/yamaha-powersports.min.js
dist/manufacturer-promotions.min.js
```

Each Brand Page loads only its own bundle. PapaParse is included in the bundle;
Swiper remains provided by the page because every existing template already
loads and styles it.

```html
<script>
  window.OEM_PROMO_CONFIG = {
    // Optional values for local QA or dealer-specific fallback behavior.
    previewDomain: "",
    defaultRegion: "USA"
  };
</script>
<script src="https://cdn.jsdelivr.net/gh/ORGANIZATION/oem-services@production/dist/polaris-powersports.min.js"></script>
```

## Region migration

The frontend expects the customer catalog in the published spreadsheet to use:

```text
AG: Domain
AH: OEMs
AI: Region
```

Until the private manager adds column AI, existing sites fall back to `USA`.
Supported region values are `USA`, `CA`, and `ALL`. `CAN` and `Canada` are
normalized to `CA` for compatibility, but the manager should store `CA`.

If a customer exists for the current domain but the page OEM is not included in
that customer's OEM list, no promotions are rendered.

## Security boundary

This repository is public and must contain read-only browser code only. Never
commit the Apps Script API token, write endpoints, credentials, `.env` files, or
administrative dashboard code here.

## Deployment order

1. Build and test locally.
2. Test one USA dealer with a `previewDomain` override.
3. Add Region support to the private OEM Manager.
4. Test one Canadian dealer.
5. Merge reviewed code into the protected `production` branch.
6. Replace inline promotion loaders one template family at a time.
