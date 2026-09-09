import assert from "node:assert/strict";
import test from "node:test";
import { readBrandPromotions } from "../src/core/feed.js";

const headers = [
  "OEM",
  "Region",
  "Carousel position",
  "Title",
  "Image",
  "Image 2",
  "Start Date",
  "End Date",
  "Content",
  "Terms & Conditions",
  "Status",
  "Hrefs",
  "Category",
  "Type",
  "Featured"
];

function promotionRow(region, title) {
  const row = Array(35).fill("");
  row.splice(0, headers.length, ...[
    "CFMoto",
    region,
    "1",
    title,
    "https://example.com/promotion.webp",
    "",
    "09/01/2026",
    "09/30/2026",
    "Promotion content",
    "Promotion terms",
    "Active",
    '[]',
    "ATV",
    "Rebate",
    "TRUE"
  ]);
  return row;
}

const usaPromotion = promotionRow("USA", "USA Promotion");
const canadaPromotion = promotionRow("CA", "Canada Promotion");
canadaPromotion[32] = "dealer.ca";
canadaPromotion[33] = "CFMoto";
canadaPromotion[34] = "CA";

const rows = [headers, usaPromotion, canadaPromotion];

test("uses the customer region for a configured Canadian domain", () => {
  const promotions = readBrandPromotions(rows, {
    oem: "CFMoto",
    previewDomain: "dealer.ca",
    defaultRegion: "USA",
    inventoryLink: "/inventory/"
  });

  assert.deepEqual(promotions.map((promotion) => promotion.title), ["Canada Promotion"]);
});

test("keeps USA as the migration fallback for domains not yet configured", () => {
  const promotions = readBrandPromotions(rows, {
    oem: "CFMoto",
    previewDomain: "legacy-dealer.com",
    defaultRegion: "USA",
    inventoryLink: "/inventory/"
  });

  assert.deepEqual(promotions.map((promotion) => promotion.title), ["USA Promotion"]);
});

test("does not expose an OEM excluded from the customer profile", () => {
  canadaPromotion[33] = "Yamaha Powersports";
  const promotions = readBrandPromotions(rows, {
    oem: "CFMoto",
    previewDomain: "dealer.ca",
    defaultRegion: "USA",
    inventoryLink: "/inventory/"
  });
  canadaPromotion[33] = "CFMoto";

  assert.equal(promotions.length, 0);
});

