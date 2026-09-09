import Papa from "papaparse";
import { SHEET_LAYOUT } from "./constants.js";
import {
  asText,
  getDrivePreviewUrl,
  normalizeDomain,
  normalizeOem,
  normalizeRegion,
  normalizeText,
  splitList
} from "./utils.js";
import { resolvePromotionHref } from "./hrefs.js";

export function downloadSheet(csvUrl) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvUrl, {
      download: true,
      header: false,
      dynamicTyping: false,
      skipEmptyLines: false,
      complete: (results) => resolve(Array.isArray(results.data) ? results.data : []),
      error: reject
    });
  });
}

function rowToPromotion(headers, row) {
  return headers.reduce((promotion, header, index) => {
    const key = asText(header);
    if (key) promotion[key] = row[index] == null ? "" : row[index];
    return promotion;
  }, {});
}

export function readCustomers(rows) {
  return rows
    .slice(SHEET_LAYOUT.customerStartRow)
    .map((row) => ({
      domain: normalizeDomain(row[SHEET_LAYOUT.customerDomainColumn]),
      oems: splitList(row[SHEET_LAYOUT.customerOemsColumn]),
      region: normalizeRegion(row[SHEET_LAYOUT.customerRegionColumn])
    }))
    .filter((customer) => customer.domain);
}

export function findCustomer(rows, domain) {
  const currentDomain = normalizeDomain(domain);
  return readCustomers(rows).find((customer) => customer.domain === currentDomain) || null;
}

export function readBrandPromotions(rows, config) {
  const headers = (rows[0] || []).slice(0, SHEET_LAYOUT.promotionColumnCount);
  const domain = normalizeDomain(config.previewDomain || window.location.hostname);
  const customer = findCustomer(rows, domain);
  const region = normalizeRegion(customer?.region || config.defaultRegion);
  const targetOem = normalizeOem(config.oem);
  const customerOems = (customer?.oems || []).map(normalizeOem);

  if (customer && !customerOems.includes(targetOem)) return [];

  return rows
    .slice(1)
    .map((row) => rowToPromotion(headers, row))
    .filter((promotion) => {
      const promotionRegion = normalizeRegion(promotion.Region);
      const sameRegion = promotionRegion === region || promotionRegion === "ALL";
      return (
        normalizeOem(promotion.OEM) === targetOem &&
        normalizeText(promotion.Status) === "active" &&
        sameRegion
      );
    })
    .map((promotion) => ({
      ...promotion,
      title: asText(promotion.Title || `${config.oem} Promotion`),
      content: asText(promotion.Content),
      terms: asText(promotion["Terms & Conditions"]),
      image: getDrivePreviewUrl(promotion.Image),
      image2: getDrivePreviewUrl(promotion["Image 2"]),
      position: parseInt(promotion["Carousel position"], 10) || 9999,
      resolvedHref: resolvePromotionHref(promotion, domain, config.inventoryLink)
    }))
    .sort((first, second) => first.position - second.position);
}

