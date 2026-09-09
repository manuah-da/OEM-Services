import { DEFAULT_CSV_URL } from "./constants.js";
import { downloadSheet, readBrandPromotions } from "./feed.js";

export function getRuntimeConfig(defaults) {
  return {
    csvUrl: DEFAULT_CSV_URL,
    previewDomain: "",
    defaultRegion: "USA",
    inventoryLink: "/inventory/",
    ...defaults,
    ...(window.OEM_PROMO_CONFIG || {})
  };
}

export async function startBrandPromotions(defaults, adapter) {
  const config = getRuntimeConfig(defaults);

  try {
    const rows = await downloadSheet(config.csvUrl);
    if (!rows.length) throw new Error("The published promotions sheet is empty.");

    const promotions = readBrandPromotions(rows, config);
    adapter.render(promotions, config);
  } catch (error) {
    console.error(`Unable to load ${config.oem} promotions.`, error);
    adapter.onError?.(error, config);
  }
}

