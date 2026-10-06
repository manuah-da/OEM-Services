(function ($) {
  // Ski-Doo promotions use the shared OEM Manager spreadsheet.
  const csvUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQxeKAIyWFGRAoXqXW9TG5KNkwkfTuQi2CJNFNVwtFMNyn5CVJjIfnC_2R0McOMEE-xZELk5WBSeEcQ/pub?gid=0&single=true&output=csv";
  const currentDomain = window.location.hostname
    .toLowerCase()
    .replace(/^www\./, "");
  const $section = $(".ski-doo-promotions");
  const $slider = $section.find(".ski-doo-promotions__slider");
  const $wrapper = $slider.find(".swiper-wrapper");
  // Spreadsheet positions are zero-based in parsed CSV rows.
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

  // Match spreadsheet domains to the current site host.
  function domainName(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .trim();
  }

  // Convert Google Drive image links to direct image URLs.
  function imageUrl(value) {
    const url = String(value || "")
      .split(/[\n,;]+/)[0]
      .trim();
    const fileId = url.match(/drive\.google\.com.*\/d\/([\w-]+)/);
    return fileId
      ? "https://lh3.googleusercontent.com/d/" + fileId[1] + "=w1600"
      : url;
  }

  // Read the dealer's assigned state list.
  function splitStates(value) {
    return (value || "")
      .split(",")
      .map(function (state) {
        return state.trim();
      })
      .filter(Boolean);
  }

  // Prefer a dealer-specific promotion link, then wildcard, then inventory.
  function promotionHref(promo) {
    const hrefs = JSON.parse(promo.Hrefs || "[]");
    const dealerHref = hrefs.find(function (item) {
      return domainName(item.domain) === currentDomain;
    });
    const wildcardHref = hrefs.find(function (item) {
      return item.domain === "*";
    });
    return (
      (dealerHref || wildcardHref || {}).href ||
      "/inventory/?condition=New&make=Ski-Doo"
    );
  }

  // Filter active Ski-Doo promotions by dealer region and state.
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

    return allPromotions
      .filter(function (promo) {
        const bannerStates = splitStates(promo["Banner States"]);
        const stateMatches =
          !bannerStates.length ||
          bannerStates.includes("ALL") ||
          bannerStates.some(function (state) {
            return dealerStates.includes(state);
          });
        const regionMatches = promo.Region === region || promo.Region === "ALL";

        return (
          promo.OEM === "Ski-Doo" &&
          promo.Status === "Active" &&
          regionMatches &&
          stateMatches
        );
      })
      .sort(function (first, second) {
        return (
          Number(first["Carousel position"]) -
          Number(second["Carousel position"])
        );
      });
  }

  // Render one optional Terms or Content panel.
  function detailMarkup(title, copy) {
    if (!copy) return "";
    return `<div>
      <h3 class="ski-doo-promotions__overlay-title">${title}</h3>
      <p class="ski-doo-promotions__overlay-copy">${escapeHtml(copy).replace(/\r?\n/g, "<br>")}</p>
    </div>`;
  }

  // Build desktop hover content and mobile detail buttons.
  function overlayMarkup(promo, index) {
    const terms = promo["Terms & Conditions"].trim();
    const content = promo.Content.trim();

    return `<div class="ski-doo-promotions__overlay">
      <div class="ski-doo-promotions__overlay-inner">
        <div class="ski-doo-promotions__overlay-content">
          ${detailMarkup("Terms", terms)}
          ${detailMarkup("Content", content)}
        </div>
        <div class="ski-doo-promotions__mobile-actions">
          ${content ? `<button type="button" data-promo-index="${index}" data-copy="content">View Details</button>` : ""}
          ${terms ? `<button type="button" data-promo-index="${index}" data-copy="terms">Terms &amp; Conditions</button>` : ""}
        </div>
        <a class="ski-doo-promotions__overlay-cta" href="${escapeHtml(promotionHref(promo))}">View Promotion</a>
      </div>
    </div>`;
  }

  // Create one scrollable modal for long promotion copy on mobile.
  function setupModal() {
    $section.append(`<div class="ski-doo-promotions__modal" aria-hidden="true" hidden>
      <div class="ski-doo-promotions__modal-dialog" role="dialog" aria-modal="true" aria-labelledby="ski-doo-promotion-modal-title">
        <div class="ski-doo-promotions__modal-header">
          <h2 id="ski-doo-promotion-modal-title"></h2>
          <button class="ski-doo-promotions__modal-close" type="button" aria-label="Close promotion details">&times;</button>
        </div>
        <div class="ski-doo-promotions__modal-body"></div>
        <div class="ski-doo-promotions__modal-footer">
          <a class="ski-doo-promotions__modal-cta" href="">View Promotion</a>
        </div>
      </div>
    </div>`);

    const $modal = $section.find(".ski-doo-promotions__modal");
    let modalTrigger;

    function closeModal() {
      $modal
        .removeClass("is-open")
        .attr("aria-hidden", "true")
        .prop("hidden", true);
      $("body").removeClass("ski-doo-promotions-modal-open");
      if (modalTrigger) modalTrigger.focus();
    }

    $section.on(
      "click",
      ".ski-doo-promotions__mobile-actions button",
      function () {
        const promo = promotions[Number(this.dataset.promoIndex)];
        const isTerms = this.dataset.copy === "terms";
        modalTrigger = this;

        $modal
          .find("#ski-doo-promotion-modal-title")
          .text(isTerms ? "Terms & Conditions" : promo.Title);
        $modal
          .find(".ski-doo-promotions__modal-body")
          .text(isTerms ? promo["Terms & Conditions"] : promo.Content);
        $modal
          .find(".ski-doo-promotions__modal-cta")
          .attr("href", promotionHref(promo));
        $modal
          .prop("hidden", false)
          .attr("aria-hidden", "false")
          .addClass("is-open");
        $("body").addClass("ski-doo-promotions-modal-open");
      },
    );

    $modal.on("click", ".ski-doo-promotions__modal-close", closeModal);
    $modal.on("click", function (event) {
      if (event.target === this) closeModal();
    });
    $(document).on("keydown.skiDooPromotions", function (event) {
      if (event.key === "Escape" && !$modal.prop("hidden")) closeModal();
    });
  }

  // Replace the loading placeholder with filtered promotions.
  function renderPromotions(rows) {
    promotions = getPromotions(rows);
    const slides = promotions.map(function (promo, index) {
      const image = imageUrl(promo["Image 2"]) || imageUrl(promo.Image);
      const title = promo.Title || "Ski-Doo Promotion";

      return `<div class="ski-doo-promotions__slide swiper-slide">
        <a class="ski-doo-promotions__link" href="${escapeHtml(promotionHref(promo))}" title="${escapeHtml(title)}">
          <img class="ski-doo-promotions__image" src="${escapeHtml(image)}" alt="${escapeHtml(title)}" loading="lazy">
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
      autoplay:
        slides.length > 1 ? { delay: 5000, pauseOnMouseEnter: true } : false,
      navigation: {
        prevEl: $section.find(".ski-doo-promotions__prev")[0],
        nextEl: $section.find(".ski-doo-promotions__next")[0],
      },
      pagination: {
        el: $section.find(".ski-doo-promotions__pagination")[0],
        clickable: true,
      },
    });
  }

  // Load the shared sheet after Swiper, PapaParse, and jQuery are available.
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
