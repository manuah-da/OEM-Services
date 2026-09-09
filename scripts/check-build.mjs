import { access, stat } from "node:fs/promises";

const bundles = [
  "cfmoto.min.js",
  "polaris-powersports.min.js",
  "polaris-snowmobile.min.js",
  "polaris-slingshot.min.js",
  "yamaha-powersports.min.js",
  "manufacturer-promotions.min.js"
];

for (const bundle of bundles) {
  const path = new URL(`../dist/${bundle}`, import.meta.url);
  await access(path);
  const details = await stat(path);
  if (!details.size) throw new Error(`${bundle} is empty.`);
}

console.log(`Verified ${bundles.length} frontend bundles.`);

