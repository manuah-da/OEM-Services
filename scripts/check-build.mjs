import { access, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bundles = [
  "cfmoto.min.js",
  "polaris-powersports.min.js",
  "polaris-powersports-canada.min.js",
  "polaris-snowmobile.min.js",
  "polaris-slingshot.min.js",
  "yamaha-powersports.min.js",
  "manufacturer-promotions.min.js"
];

for (const bundle of bundles) {
  const file = path.join(root, "dist", bundle);
  await access(file);
  if ((await stat(file)).size === 0) {
    throw new Error(`${bundle} is empty.`);
  }
}

console.log(`Verified ${bundles.length} independent frontend bundles.`);
