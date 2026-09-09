import { escapeHtml } from "../core/utils.js";

function overlayMarkup(promotion) {
  const sections = [];
  if (promotion.content) {
    sections.push(`<div class="cfmoto-current-promotions__content"><h3>Content</h3><p>${escapeHtml(promotion.content).replace(/\n/g, "<br>")}</p></div>`);
  }
  if (promotion.terms) {
    sections.push(`<div class="cfmoto-current-promotions__terms"><h3>Terms and Conditions</h3><p>${escapeHtml(promotion.terms).replace(/\n/g, "<br>")}</p></div>`);
  }
  return sections.length
    ? `<div class="cfmoto-current-promotions__overlay"><div class="cfmoto-current-promotions__overlay-inner">${sections.join("")}</div></div>`
    : "";
}

function mediaMarkup(promotion, image) {
  const content = `<img class="cfmoto-current-promotions__image" src="${escapeHtml(image)}" alt="${escapeHtml(promotion.title)}" loading="lazy">`;
  if (!promotion.resolvedHref) return `<div class="cfmoto-current-promotions__link">${content}</div>`;
  const external = promotion.resolvedHref.external
    ? ' target="_blank" rel="noopener noreferrer"'
    : "";
  return `<a class="cfmoto-current-promotions__link" href="${escapeHtml(promotion.resolvedHref.href)}" title="${escapeHtml(promotion.title)}"${external}>${content}</a>`;
}

export const cfmotoAdapter = {
  render(promotions) {
    const section = document.querySelector(".cfmoto-current-promotions");
    const slider = document.querySelector(".cfmoto-current-promotions__slider");
    const wrapper = slider?.querySelector(".swiper-wrapper");
    if (!section || !slider || !wrapper) return;

    const validPromotions = promotions.filter((promotion) => promotion.image2 || promotion.image);
    wrapper.innerHTML = validPromotions
      .map((promotion) => {
        const image = promotion.image2 || promotion.image;
        return `<div class="cfmoto-current-promotions__slide swiper-slide">${mediaMarkup(promotion, image)}${overlayMarkup(promotion)}</div>`;
      })
      .join("");

    section.hidden = !validPromotions.length;
    section.style.display = validPromotions.length ? "" : "none";
    if (!validPromotions.length || typeof window.Swiper === "undefined") return;

    slider.swiper?.destroy(true, true);
    new window.Swiper(slider, {
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 650,
      loop: validPromotions.length > 1,
      autoplay: validPromotions.length > 1
        ? { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }
        : false,
      pagination: {
        el: slider.querySelector(".cfmoto-current-promotions__pagination"),
        clickable: true
      }
    });
  },

  onError() {
    const section = document.querySelector(".cfmoto-current-promotions");
    if (section) {
      section.hidden = true;
      section.style.display = "none";
    }
  }
};

