(function ($) {
  "use strict";

  // Lynx promotion feed and customer columns in the shared spreadsheet.
  const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQxeKAIyWFGRAoXqXW9TG5KNkwkfTuQi2CJNFNVwtFMNyn5CVJjIfnC_2R0McOMEE-xZELk5WBSeEcQ/pub?gid=0&single=true&output=csv";
  const currentDomain = window.location.hostname.toLowerCase().replace(/^www\./, "");
  const $section = $(".lynx-promotions");
  const $slider = $section.find(".lynx-promotions__slider");
  const $wrapper = $slider.find(".swiper-wrapper");
  // Spreadsheet positions are zero-based in CSV rows.
  const promotionColumnCount = 16; // A:P
  const customerRowsStart = 2; // Customer records start at spreadsheet row 3.
  const customerDomainColumn = 32; // AG
  const customerRegionColumn = 34; // AI
  const customerStatesColumn = 36; // AK
  let promotions = [];

  // Escape spreadsheet text before placing it in generated HTML.
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Match saved domains and page hosts in the same format.
  function domainName(value) {
    return String(value || "").toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .trim();
  }

  // Convert a Google Drive image link to a direct display URL.
  function imageUrl(value) {
    const url = String(value || "").split(/[\n,;]+/)[0].trim();
    const fileId = url.match(/drive\.google\.com.*\/d\/([\w-]+)/);
    return fileId ? "https://lh3.googleusercontent.com/d/" + fileId[1] + "=w1600" : url;
  }

  // Split comma-separated state cells into values used by the filter.
  function splitStates(value) {
    return (value || "").split(",").map(function (state) {
      return state.trim();
    }).filter(Boolean);
  }

  // Use dealer-specific hrefs first, then the wildcard, then inventory.
  function promotionHref(promo) {
    const hrefs = JSON.parse(promo.Hrefs || "[]");
    const dealerHref = hrefs.find(function (item) {
      return domainName(item.domain) === currentDomain;
    });
    const wildcardHref = hrefs.find(function (item) {
      return item.domain === "*";
    });
    return (dealerHref || wildcardHref || {}).href || "/inventory/?condition=New&make=Lynx";
  }

  // Keep active Lynx promotions for this dealer's region and states.
  function getPromotions(rows) {
    const headers = rows[0].slice(0, promotionColumnCount);
    const customer = rows.slice(customerRowsStart).find(function (row) {
      return domainName(row[customerDomainColumn]) === currentDomain;
    });
    const region = customer[customerRegionColumn];
    const dealerStates = splitStates(customer[customerStatesColumn]);

    const allPromotions = rows.slice(1).map(function (row) {
      const promo = {};
      headers.forEach(function (header, index) {
        promo[header.trim()] = row[index] || "";
      });
      return promo;
    });

    return allPromotions.filter(function (promo) {
      const bannerStates = splitStates(promo["Banner States"]);
      const stateMatches = !bannerStates.length || bannerStates.includes("ALL") ||
        bannerStates.some(function (state) { return dealerStates.includes(state); });
      const regionMatches = promo.Region === region || promo.Region === "ALL";

      return promo.OEM === "Lynx" && promo.Status === "Active" && regionMatches && stateMatches;
    }).sort(function (first, second) {
      return Number(first["Carousel position"]) - Number(second["Carousel position"]);
    });
  }

  // Render one optional Terms or Content panel.
  function detailMarkup(title, copy) {
    if (!copy) return "";
    return `<div>
      <h3 class="lynx-promotions__overlay-title">${title}</h3>
      <p class="lynx-promotions__overlay-copy">${escapeHtml(copy).replace(/\r?\n/g, "<br>")}</p>
    </div>`;
  }

  // Build the hover overlay and mobile detail buttons from available fields.
  function overlayMarkup(promo, index) {
    const terms = promo["Terms & Conditions"].trim();
    const content = promo.Content.trim();

    return `<div class="lynx-promotions__overlay">
      <div class="lynx-promotions__overlay-inner">
        <div class="lynx-promotions__overlay-content">
          ${detailMarkup("Terms", terms)}
          ${detailMarkup("Content", content)}
        </div>
        <div class="lynx-promotions__mobile-actions">
          ${content ? `<button type="button" data-promo-index="${index}" data-copy="content">View Details</button>` : ""}
          ${terms ? `<button type="button" data-promo-index="${index}" data-copy="terms">Terms &amp; Conditions</button>` : ""}
        </div>
        <a class="lynx-promotions__overlay-cta" href="${escapeHtml(promotionHref(promo))}">View Promotion</a>
      </div>
    </div>`;
  }

  // Create one modal and load the selected full text when a mobile button is tapped.
  function setupModal() {
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
    let modalTrigger;

    function closeModal() {
      $modal.removeClass("is-open").attr("aria-hidden", "true").prop("hidden", true);
      $("body").removeClass("lynx-promotions-modal-open");
      if (modalTrigger) modalTrigger.focus();
    }

    $section.on("click", ".lynx-promotions__mobile-actions button", function () {
      const promo = promotions[Number(this.dataset.promoIndex)];
      const isTerms = this.dataset.copy === "terms";
      modalTrigger = this;

      $modal.find("#lynx-promotion-modal-title").text(isTerms ? "Terms & Conditions" : promo.Title);
      $modal.find(".lynx-promotions__modal-body").text(isTerms ? promo["Terms & Conditions"] : promo.Content);
      $modal.find(".lynx-promotions__modal-cta").attr("href", promotionHref(promo));
      $modal.prop("hidden", false).attr("aria-hidden", "false").addClass("is-open");
      $("body").addClass("lynx-promotions-modal-open");
    });

    $modal.on("click", ".lynx-promotions__modal-close", closeModal);
    $modal.on("click", function (event) {
      if (event.target === this) closeModal();
    });
    $(document).on("keydown.lynxPromotions", function (event) {
      if (event.key === "Escape" && !$modal.prop("hidden")) closeModal();
    });
  }

  // Replace the loading placeholder with the filtered slides.
  function renderPromotions(rows) {
    promotions = getPromotions(rows);
    const slides = promotions.map(function (promo, index) {
      const image = imageUrl(promo["Image 2"]) || imageUrl(promo.Image);
      const title = promo.Title || "Lynx Promotion";

      return `<div class="lynx-promotions__slide swiper-slide">
        <a class="lynx-promotions__link" href="${escapeHtml(promotionHref(promo))}" title="${escapeHtml(title)}">
          <img class="lynx-promotions__image" src="${escapeHtml(image)}" alt="${escapeHtml(title)}" loading="lazy">
        </a>
        ${overlayMarkup(promo, index)}
      </div>`;
    });

    if (!slides.length) {
      $section.prop("hidden", true).attr("aria-busy", "false");
      return;
    }

    $wrapper.html(slides.join(""));
    $section.prop("hidden", false).attr("aria-busy", "false");
    new Swiper($slider[0], {
      slidesPerView: 1,
      autoHeight: true,
      speed: 650,
      loop: slides.length > 1,
      autoplay: slides.length > 1 ? { delay: 5000, pauseOnMouseEnter: true } : false,
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

  // Load the public spreadsheet after the page libraries are ready.
  setupModal();
  Papa.parse(csvUrl, {
    download: true,
    header: false,
    skipEmptyLines: true,
    complete: function (result) {
      renderPromotions(result.data);
    },
    error: function () {
      $section.prop("hidden", true).attr("aria-busy", "false");
    },
  });
})(jQuery);
