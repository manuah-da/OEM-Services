(function ($) {
  "use strict";

  /* Spreadsheet and page configuration. */
  const config = {
    csvUrl:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vQxeKAIyWFGRAoXqXW9TG5KNkwkfTuQi2CJNFNVwtFMNyn5CVJjIfnC_2R0McOMEE-xZELk5WBSeEcQ/pub?gid=0&single=true&output=csv",
    oem: "Lynx",
    inventoryLink: "/inventory/?condition=New&make=Lynx",
    defaultRegion: "USA",
  };

  const PROMOTION_COLUMN_COUNT = 16; // A:P, including Banner States.
  const CUSTOMER_START_ROW = 2; // Customer records begin on spreadsheet row 3.
  const CUSTOMER_DOMAIN_COLUMN = 32; // AG
  const CUSTOMER_REGION_COLUMN = 34; // AI
  const CUSTOMER_STATES_COLUMN = 36; // AK

  const $section = $(".lynx-promotions");
  const $slider = $section.find(".lynx-promotions__slider");
  const $wrapper = $slider.find(".swiper-wrapper");
  let promotionSwiper = null;
  let currentPromotions = [];
  let lastModalTrigger = null;

  /* Small helpers for sheet values and safe HTML output. */
  const utils = {
    escapeHtml: function (value) {
      return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    },

    normalizeDomain: function (value) {
      const raw = String(value || "").trim().toLowerCase();
      if (!raw || raw === "*") return raw;
      try {
        return new URL(raw.includes("://") ? raw : `https://${raw}`)
          .hostname.replace(/^www\./, "");
      } catch (error) {
        return raw.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
      }
    },

    splitList: function (value) {
      return String(value || "").split(",").map(function (item) {
        return item.trim();
      }).filter(Boolean);
    },

    matchesStates: function (bannerValue, dealerStates) {
      const bannerStates = utils.splitList(bannerValue);
      if (!bannerStates.length || bannerStates.includes("ALL")) return true;
      return bannerStates.some(function (state) {
        return dealerStates.includes(state);
      });
    },

    imageUrl: function (value) {
      const url = String(value || "").split(/[\n,;]+/)[0].trim();
      if (!url || !url.includes("drive.google.com")) return url;
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      return match ? `https://lh3.googleusercontent.com/d/${match[1]}=w1600` : url;
    },
  };

  /* Resolve an exact dealer href first, then wildcard, then inventory. */
  function resolveHref(promo) {
    let hrefs = [];
    try {
      hrefs = JSON.parse(promo.Hrefs || "[]");
    } catch (error) {
      hrefs = [];
    }

    const currentDomain = utils.normalizeDomain(window.location.hostname);
    const exact = hrefs.find(function (item) {
      return utils.normalizeDomain(item.domain) === currentDomain;
    });
    const wildcard = hrefs.find(function (item) {
      return item.domain === "*";
    });
    return String((exact || wildcard || {}).href || config.inventoryLink).trim();
  }

  /* Read only Active Lynx rows valid for this dealer's region and states. */
  function readPromotions(rows) {
    const headers = (rows[0] || []).slice(0, PROMOTION_COLUMN_COUNT);
    const currentDomain = utils.normalizeDomain(window.location.hostname);
    const customer = rows.slice(CUSTOMER_START_ROW).find(function (row) {
      return utils.normalizeDomain(row[CUSTOMER_DOMAIN_COLUMN]) === currentDomain;
    });
    const region = String(customer ? customer[CUSTOMER_REGION_COLUMN] : "").trim() ||
      config.defaultRegion;
    const dealerStates = utils.splitList(
      customer ? customer[CUSTOMER_STATES_COLUMN] : "",
    );

    return rows.slice(1).map(function (row) {
      return headers.reduce(function (promo, header, index) {
        const key = String(header || "").trim();
        if (key) promo[key] = row[index] == null ? "" : row[index];
        return promo;
      }, {});
    }).filter(function (promo) {
      const promoRegion = String(promo.Region || "").trim();
      return String(promo.OEM || "").trim().toLowerCase() === config.oem.toLowerCase() &&
        String(promo.Status || "").trim().toLowerCase() === "active" &&
        (promoRegion === region || promoRegion === "ALL") &&
        utils.matchesStates(promo["Banner States"], dealerStates);
    }).sort(function (a, b) {
      return (parseInt(a["Carousel position"], 10) || 999) -
        (parseInt(b["Carousel position"], 10) || 999);
    });
  }

  /* Render Terms on the left and Content on the right when supplied. */
  function overlayMarkup(promo, promotionIndex) {
    const terms = String(promo["Terms & Conditions"] || "").trim();
    const content = String(promo.Content || "").trim();
    if (!terms && !content) return "";
    const promotionHref = utils.escapeHtml(resolveHref(promo));

    return `<div class="lynx-promotions__overlay">
      <div class="lynx-promotions__overlay-inner">
        <div class="lynx-promotions__overlay-content">
          ${terms ? `<div><h3 class="lynx-promotions__overlay-title">Terms</h3><p class="lynx-promotions__overlay-copy">${utils.escapeHtml(terms).replace(/\r?\n/g, "<br>")}</p></div>` : ""}
          ${content ? `<div><h3 class="lynx-promotions__overlay-title">Content</h3><p class="lynx-promotions__overlay-copy">${utils.escapeHtml(content).replace(/\r?\n/g, "<br>")}</p></div>` : ""}
        </div>
        <div class="lynx-promotions__mobile-actions">
          ${content ? `<button type="button" data-promotion-index="${promotionIndex}" data-promotion-copy="content">View Details</button>` : ""}
          ${terms ? `<button type="button" data-promotion-index="${promotionIndex}" data-promotion-copy="terms">Terms & Conditions</button>` : ""}
        </div>
        <a class="lynx-promotions__overlay-cta" href="${promotionHref}">View Promotion</a>
      </div>
    </div>`;
  }

  /* Use one accessible modal for long mobile promotion copy. */
  function setupPromotionModal() {
    if ($section.find(".lynx-promotions__modal").length) return;

    $section.append(`<div class="lynx-promotions__modal" aria-hidden="true" hidden>
      <div class="lynx-promotions__modal-dialog" role="dialog" aria-modal="true" aria-labelledby="lynx-promotion-modal-title">
        <div class="lynx-promotions__modal-header">
          <h2 id="lynx-promotion-modal-title"></h2>
          <button class="lynx-promotions__modal-close" type="button" aria-label="Close promotion details">&times;</button>
        </div>
        <div class="lynx-promotions__modal-body"></div>
        <div class="lynx-promotions__modal-footer">
          <a class="lynx-promotions__modal-cta" href="">View Promotion</a>
        </div>
      </div>
    </div>`);

    const $modal = $section.find(".lynx-promotions__modal");

    function closeModal() {
      $modal.removeClass("is-open").attr("aria-hidden", "true");
      $("body").removeClass("lynx-promotions-modal-open");
      window.setTimeout(function () {
        $modal.prop("hidden", true);
      }, 250);
      if (lastModalTrigger) lastModalTrigger.focus();
    }

    $section.on("click", ".lynx-promotions__mobile-actions button", function () {
      const promo = currentPromotions[Number($(this).attr("data-promotion-index"))];
      const copyType = $(this).attr("data-promotion-copy");
      if (!promo) return;

      const isTerms = copyType === "terms";
      const copy = isTerms ? promo["Terms & Conditions"] : promo.Content;
      const promoTitle = String(promo.Title || "Lynx Promotion").trim();
      lastModalTrigger = this;

      $modal.find("#lynx-promotion-modal-title").text(isTerms ? "Terms & Conditions" : promoTitle);
      $modal.find(".lynx-promotions__modal-body").text(String(copy || "").trim());
      $modal.find(".lynx-promotions__modal-cta").attr("href", resolveHref(promo));
      $modal.prop("hidden", false).attr("aria-hidden", "false");
      $("body").addClass("lynx-promotions-modal-open");
      window.requestAnimationFrame(function () {
        $modal.addClass("is-open");
        $modal.find(".lynx-promotions__modal-close").trigger("focus");
      });
    });

    $modal.on("click", function (event) {
      if (event.target === this) closeModal();
    });
    $modal.on("click", ".lynx-promotions__modal-close", closeModal);
    $(document).on("keydown.lynxPromotions", function (event) {
      if (event.key === "Escape" && $modal.hasClass("is-open")) closeModal();
    });
  }

  /* Replace the skeleton with promotion slides and initialize Swiper. */
  function renderPromotions(promotions) {
    currentPromotions = promotions.filter(function (promo) {
      return Boolean(utils.imageUrl(promo["Image 2"]) || utils.imageUrl(promo.Image));
    });

    const slides = currentPromotions.map(function (promo, promotionIndex) {
      const image = utils.imageUrl(promo["Image 2"]) || utils.imageUrl(promo.Image);
      const title = String(promo.Title || "Lynx Promotion").trim();

      return `<div class="lynx-promotions__slide swiper-slide">
        <a class="lynx-promotions__link" href="${utils.escapeHtml(resolveHref(promo))}" title="${utils.escapeHtml(title)}">
          <img class="lynx-promotions__image" src="${utils.escapeHtml(image)}" alt="${utils.escapeHtml(title)}" loading="lazy">
        </a>
        ${overlayMarkup(promo, promotionIndex)}
      </div>`;
    });

    if (!slides.length) {
      $section.prop("hidden", true).attr("aria-busy", "false");
      return;
    }

    $wrapper.html(slides.join(""));
    $section.prop("hidden", false).attr("aria-busy", "false");

    if (promotionSwiper) promotionSwiper.destroy(true, true);
    promotionSwiper = new Swiper($slider[0], {
      slidesPerView: 1,
      autoHeight: true,
      speed: 650,
      loop: slides.length > 1,
      autoplay: slides.length > 1 ? {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      } : false,
      navigation: {
        prevEl: $section.find(".lynx-promotions__prev")[0],
        nextEl: $section.find(".lynx-promotions__next")[0],
      },
      pagination: {
        el: $section.find(".lynx-promotions__pagination")[0],
        clickable: true,
      },
    });
  }

  /* Load the published sheet once the page dependencies are available. */
  function loadPromotions() {
    if (!$slider.length) return;
    if (typeof Papa === "undefined" || typeof Swiper === "undefined") {
      console.error("Lynx promotions require PapaParse and Swiper.");
      $section.prop("hidden", true).attr("aria-busy", "false");
      return;
    }

    setupPromotionModal();
    Papa.parse(config.csvUrl, {
      download: true,
      header: false,
      skipEmptyLines: true,
      complete: function (results) {
        renderPromotions(readPromotions(results.data || []));
      },
      error: function (error) {
        console.error("Unable to load Lynx promotions:", error);
        $section.prop("hidden", true).attr("aria-busy", "false");
      },
    });
  }

  $(loadPromotions);
})(jQuery);
