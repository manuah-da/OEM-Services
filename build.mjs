import { build, context } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const watchMode = process.argv.includes("--watch");

// Every output is built only from the independent script owned by that page.
const entryPoints = {
  cfmoto: path.join(root, "Brand Pages/CFMoto/script.js"),
  "polaris-powersports": path.join(root, "Brand Pages/Polaris Powersports/script.js"),
  "polaris-snowmobile": path.join(root, "Brand Pages/Polaris Snowmobile/script.js"),
  "polaris-slingshot": path.join(root, "Brand Pages/Polaris Slingshot/script.js"),
  "yamaha-powersports": path.join(root, "Brand Pages/Yamaha Powersports/script.js"),
  "manufacturer-promotions": path.join(root, "Manufacturer Promotion/script.js")
};

const options = {
  entryPoints,
  outdir: path.join(root, "dist"),
  entryNames: "[name].min",
  bundle: false,
  minify: true,
  platform: "browser",
  target: ["es2018"],
  legalComments: "none",
  banner: {
    js: "/*! OEM Services - generated file; edit the page script.js instead. */"
  }
};

if (watchMode) {
  const buildContext = await context(options);
  await buildContext.watch();
  console.log("Watching independent OEM automation scripts...");
} else {
  await build(options);
  console.log("Created 6 independent bundles in dist/.");
}
