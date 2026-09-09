export function asText(value) {
  return String(value == null ? "" : value).trim();
}

export function normalizeText(value) {
  return asText(value).toLowerCase();
}

export function normalizeOem(value) {
  return normalizeText(value).replace(/[^a-z0-9]/g, "");
}

export function normalizeDomain(value) {
  return normalizeText(value)
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split(/[\/:?#]/)[0]
    .replace(/\.$/, "");
}

export function normalizeRegion(value) {
  const region = normalizeText(value);
  if (["ca", "can", "canada"].includes(region)) return "CA";
  if (["us", "usa", "united states"].includes(region)) return "USA";
  if (["all", "*"].includes(region)) return "ALL";
  return asText(value).toUpperCase();
}

export function splitList(value) {
  return asText(value)
    .split(/[,;|\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function getDrivePreviewUrl(value, width = 1600) {
  const url = splitList(value)[0] || "";
  if (!url.includes("drive.google.com")) return url;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match
    ? `https://lh3.googleusercontent.com/d/${match[1]}=w${width}`
    : url;
}

export function onReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true });
  } else {
    callback();
  }
}

