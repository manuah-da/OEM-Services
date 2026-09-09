import { build, context } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const watch = process.argv.includes("--watch");
const rootDirectory = fileURLToPath(new URL(".", import.meta.url));
const options = {
  absWorkingDir: rootDirectory,
  entryPoints: {
    "cfmoto": path.join(rootDirectory, "src/entries/cfmoto.js"),
    "polaris-powersports": path.join(rootDirectory, "src/entries/polaris-powersports.js"),
    "polaris-snowmobile": path.join(rootDirectory, "src/entries/polaris-snowmobile.js"),
    "polaris-slingshot": path.join(rootDirectory, "src/entries/polaris-slingshot.js"),
    "yamaha-powersports": path.join(rootDirectory, "src/entries/yamaha-powersports.js"),
    "manufacturer-promotions": path.join(rootDirectory, "src/entries/manufacturer-promotions.js")
  },
  outdir: path.join(rootDirectory, "dist"),
  entryNames: "[name].min",
  bundle: true,
  minify: true,
  sourcemap: false,
  format: "iife",
  platform: "browser",
  target: ["es2018"],
  legalComments: "none",
  banner: {
    js: "/*! OEM Services Frontend - generated file; edit src/ instead. */"
  }
};

if (watch) {
  const buildContext = await context(options);
  await buildContext.watch();
  console.log("Watching OEM frontend bundles...");
} else {
  await build(options);
  console.log("OEM frontend bundles created in dist/.");
}
