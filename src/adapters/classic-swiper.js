import { escapeHtml } from "../core/utils.js";

function linkMarkup(promotion, content, className = "") {
  const link = promotion.resolvedHref;
  const classAttribute = className ? ` class="${className}"` : "";
  if (!link) return `<div${classAttribute}>${content}</div>`;

  const external = link.external
    ? ' target="_blank" rel="noopener noreferrer"'
    : "";
  return `<a${classAttribute} href="${escapeHtml(link.href)}" title="${escapeHtml(promotion.title)}"${external}>${content}</a>`;
}

function pictureMarkup(promotion) {
  const image = promotion.image || promotion.image2;
  return `<picture>
    <source media="(max-width: 768px)" srcset="${escapeHtml(image)}">
    <source media="(min-width: 769px)" srcset="${escapeHtml(image)}">
    <img src="${escapeHtml(image)}" alt="${escapeHtml(promotion.title)}" loading="lazy">
  </picture>`;
}

export function createClassicSwiperAdapter(options = {}) {
  const settings = {
    standardSelector: "#promotionsCont",
    swiperSelector: ".promoSwiper",
    fallbackSelector: ".promo-fallback",
    ...options
  };

  function initSwiper(count) {
    const element = document.querySelector(settings.swiperSelector);
    if (!element || typeof window.Swiper === "undefined") return;
    element.swiper?.destroy(true, true);

    new window.Swiper(element, {
      loop: count > 1,
      pagination: {
        el: element.querySelector(".swiper-pagination"),
        clickable: true,
        dynamicBullets: true
      },
      navigation: {
        nextEl: element.querySelector(".swiper-button-next"),
        prevEl: element.querySelector(".swiper-button-prev")
      }
    });
  }

  return {
    render(promotions) {
      const validPromotions = promotions.filter((promotion) => promotion.image || promotion.image2);
      const standard = document.querySelector(settings.standardSelector);
      const swiper = document.querySelector(settings.swiperSelector);
      const wrapper = swiper?.querySelector(".swiper-wrapper");

      if (!validPromotions.length) {
        initSwiper(0);
        return;
      }

      standard?.querySelectorAll(settings.fallbackSelector).forEach((item) => item.remove());

      if (standard && !standard.querySelector(".swiper-wrapper")) {
        standard.querySelectorAll('[data-oem-promotion="dynamic"]').forEach((item) => item.remove());
        standard.insertAdjacentHTML(
          "beforeend",
          validPromotions
            .map((promotion) => {
              const disclaimer = promotion.terms
                ? `<p class="promo-disclaimer">${escapeHtml(promotion.terms).replace(/\n/g, "<br>")}</p>`
                : "";
              return linkMarkup(
                promotion,
                `${pictureMarkup(promotion)}${disclaimer}`,
                "oem-promotion-link"
              ).replace(/^<(a|div)/, '<$1 data-oem-promotion="dynamic"');
            })
            .join("")
        );
      }

      if (wrapper) {
        wrapper.innerHTML = validPromotions
          .map((promotion) => `<div class="swiper-slide">${linkMarkup(promotion, pictureMarkup(promotion))}</div>`)
          .join("");
      }

      initSwiper(validPromotions.length);
    },

    onError() {
      initSwiper(document.querySelectorAll(`${settings.swiperSelector} .swiper-slide`).length);
    }
  };
}

