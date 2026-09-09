import { asText, normalizeDomain } from "./utils.js";

export function parseHrefs(value) {
  if (!value) return [];

  try {
    const parsed = Array.isArray(value) ? value : JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => ({
        domain: normalizeDomain(item?.domain || "*"),
        href: asText(item?.href)
      }))
      .filter((item) => item.href);
  } catch (error) {
    console.warn("Invalid promotion Hrefs JSON.", error);
    return [];
  }
}

export function resolvePromotionHref(promotion, domain, fallbackHref = "") {
  const currentDomain = normalizeDomain(domain);
  const hrefs = parseHrefs(promotion.Hrefs);
  const exact = hrefs.find((item) => item.domain === currentDomain);
  const wildcard = hrefs.find((item) => item.domain === "*");
  const href = asText((exact || wildcard)?.href || fallbackHref);

  if (!href || href === "#" || /^javascript:/i.test(href)) return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(href)) {
    return { href, external: false };
  }

  try {
    const url = new URL(href);
    if (normalizeDomain(url.hostname) === currentDomain) {
      return {
        href: `${url.pathname}${url.search}${url.hash}`,
        external: false
      };
    }
  } catch (error) {
    return { href, external: false };
  }

  return { href, external: true };
}

