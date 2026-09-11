jQuery(document).ready(function ($) {
  const $page = $(".oem-mp");
  if (!$page.length) return;

  /* --------------------------------------------------------------------------
     Configuration and page state
     -------------------------------------------------------------------------- */

  const config = {
    csvUrl:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vQxeKAIyWFGRAoXqXW9TG5KNkwkfTuQi2CJNFNVwtFMNyn5CVJjIfnC_2R0McOMEE-xZELk5WBSeEcQ/pub?gid=0&single=true&output=csv",
    previewDomain: "", // Optional local testing domain; keep empty in production.
    pageSize: 9,
  };

  // Fixed spreadsheet layout managed by the OEM Manager dashboard.
  const PROMOTION_COLUMN_COUNT = 15; // A:O
  const CUSTOMER_START_ROW = 2; // Spreadsheet row 3
  const DOMAIN_COLUMN = 32; // AG
  const CUSTOMER_OEMS_COLUMN = 33; // AH

  const state = {
    customer: null,
    promotions: [],
    filteredPromotions: [],
    currentPage: 1,
    isLoading: true,
  };

  const $dom = {
    featured: $page.find(".oem-mp__featured"),
    featuredDivider: $page.find(".oem-mp__featured-divider"),
    featuredGrid: $page.find(".oem-mp__featured-grid"),
    filters: $page.find(".oem-mp__filters"),
    filtersForm: $page.find(".oem-mp__filters-form"),
    search: $page.find("#promotion-search"),
    oem: $page.find("#promotion-oem"),
    category: $page.find("#promotion-category"),
    type: $page.find("#promotion-type"),
    sort: $page.find("#promotion-sort"),
    promotions: $page.find(".oem-mp__promotions"),
    promotionsGrid: $page.find(".oem-mp__promotions-grid"),
    pagination: $page.find(".oem-mp__pagination"),
    paginationPage: $page.find(".oem-mp__pagination-page"),
    resultsStatus: $page.find("#promotion-results-status"),
  };

  const termsIcon = function (fill) {
    return `
      <svg class="oem-mp__terms-icon" width="16" height="16" viewBox="0 0 16 16" fill="none"
        xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        <path d="M14.2733 7.72L8.27333 1.72C8.02334 1.47205 7.68543 1.33305 7.33333 1.33333H2.66667C2.31304 1.33333 1.97391 1.47381 1.72386 1.72386C1.47381 1.97391 1.33333 2.31304 1.33333 2.66667V7.33333C1.33319 7.50927 1.36788 7.6835 1.43538 7.84598C1.50289 8.00845 1.60189 8.15596 1.72667 8.28L7.72667 14.28C7.97666 14.5279 8.31457 14.6669 8.66667 14.6667C9.01972 14.6652 9.35777 14.5237 9.60667 14.2733L14.2733 9.60667C14.5237 9.35777 14.6652 9.01972 14.6667 8.66667C14.6668 8.49073 14.6321 8.3165 14.5646 8.15402C14.4971 7.99155 14.3981 7.84404 14.2733 7.72ZM8.66667 13.3333L2.66667 7.33333V2.66667H7.33333L13.3333 8.66667M4.33333 3.33333C4.53111 3.33333 4.72445 3.39198 4.8889 3.50186C5.05335 3.61175 5.18153 3.76792 5.25721 3.95065C5.3329 4.13338 5.3527 4.33444 5.31412 4.52842C5.27553 4.7224 5.18029 4.90059 5.04044 5.04044C4.90059 5.18029 4.7224 5.27553 4.52842C4.33444 5.3527 4.13338 5.3329 3.95065 5.25721C3.76792 5.18153 3.61175 5.05335 3.50186 4.8889C3.39198 4.72445 3.33333 4.53111 3.33333 4.33333C3.33333 4.06812 3.43869 3.81376 3.62623 3.62623C3.81376 3.43869 4.06812 3.33333 4.33333 3.33333Z"
          fill="${fill}" />
      </svg>`;
  };

  /* --------------------------------------------------------------------------
     Shared data helpers
     -------------------------------------------------------------------------- */

  const utils = {
    escapeHtml: function (value) {
      return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    },

    normalizeText: function (value) {
      return String(value == null ? "" : value)
        .trim()
        .toLowerCase();
    },

    normalizeDomain: function (value) {
      return String(value == null ? "" : value)
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split(/[/:?#]/)[0];
    },

    currentDomain: function () {
      return utils.normalizeDomain(
        config.previewDomain || window.location.hostname,
      );
    },

    splitList: function (value) {
      return String(value == null ? "" : value)
        .split(/[\n,;|]+/)
        .map(function (item) {
          return item.trim();
        })
        .filter(Boolean);
    },

    isFeatured: function (value) {
      return utils.normalizeText(value) === "true";
    },

    parseDate: function (value) {
      const raw = String(value == null ? "" : value).trim();
      if (!raw) return null;

      let match = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (match) return utils.createDate(+match[1], +match[2], +match[3]);

      match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (match) return utils.createDate(+match[3], +match[1], +match[2]);

      return null;
    },

    createDate: function (year, month, day) {
      const date = new Date(year, month - 1, day, 12, 0, 0, 0);
      if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
      ) {
        return null;
      }
      return date;
    },

    toIsoDate: function (date) {
      if (!date) return "";
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    formatDate: function (date) {
      if (!date) return "Date unavailable";
      return new Intl.DateTimeFormat("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }).format(date);
    },

    getDrivePreviewUrl: function (url) {
      if (!url || !url.includes("drive.google.com")) return url;
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      return match
        ? `https://lh3.googleusercontent.com/d/${match[1]}=w1200`
        : url;
    },

    parseHrefs: function (value) {
      if (!value) return [];

      try {
        const hrefs = JSON.parse(value);
        return Array.isArray(hrefs) ? hrefs : [];
      } catch (error) {
        console.warn("Invalid promotion Hrefs JSON:", value);
        return [];
      }
    },

    resolveHref: function (promo) {
      const domain = utils.currentDomain();
      const hrefs = utils.parseHrefs(promo.Hrefs);
      const exact = hrefs.find(function (item) {
        return utils.normalizeDomain(item.domain) === domain;
      });
      const wildcard = hrefs.find(function (item) {
        return item.domain === "*";
      });
      const href = String((exact || wildcard || {}).href || "").trim();

      if (!href || href === "#" || /^javascript:\s*void\s*\(0\)/i.test(href)) {
        return null;
      }

      if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(href)) {
        return { href: href, external: false };
      }

      try {
        const url = new URL(href);
        if (utils.normalizeDomain(url.hostname) === domain) {
          return {
            href: `${url.pathname}${url.search}${url.hash}`,
            external: false,
          };
        }
      } catch (error) {
        return { href: href, external: false };
      }

      return { href: href, external: true };
    },

    debounce: function (callback, delay) {
      let timeoutId;
      return function () {
        const args = arguments;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(function () {
          callback.apply(null, args);
        }, delay);
      };
    },
  };

  /* --------------------------------------------------------------------------
     Accessible custom dropdowns
     -------------------------------------------------------------------------- */

  function closeDropdown($dropdown, restoreFocus) {
    $dropdown.removeClass("is-open");
    $dropdown.find(".oem-mp__select-trigger").attr("aria-expanded", "false");
    if (restoreFocus)
      $dropdown.find(".oem-mp__select-trigger").trigger("focus");
  }

  function closeDropdowns($current) {
    $page
      .find(".oem-mp__select-control.is-open")
      .not($current)
      .each(function () {
        closeDropdown($(this), false);
      });
  }

  function updateDropdown($select) {
    const select = $select[0];
    const selected = select && select.options[select.selectedIndex];
    const $dropdown = $select.closest(".oem-mp__select-control");
    if (!selected) return;

    let label = selected.textContent;
    if (selected.value === "" && $select.attr("data-placeholder")) {
      label = $select.attr("data-placeholder");
    }

    $dropdown.find(".oem-mp__select-value").text(label);
    $dropdown
      .find(".oem-mp__select-option")
      .attr("aria-selected", function (index) {
        return String(index === select.selectedIndex);
      });
  }

  function buildDropdown($select) {
    const select = $select[0];
    if (!select) return;

    const $dropdown = $select.closest(".oem-mp__select-control");
    const $list = $dropdown.find(".oem-mp__select-options").empty();

    $(select.options).each(function (index) {
      $("<li>", {
        class: "oem-mp__select-option",
        role: "option",
        tabindex: -1,
        "data-option-index": index,
        "aria-selected": String(this.selected),
      })
        .text(this.textContent)
        .appendTo($list);
    });

    $dropdown.addClass("is-custom-select");
    updateDropdown($select);
  }

  function openDropdown($dropdown) {
    const $trigger = $dropdown.find(".oem-mp__select-trigger");
    const select = $dropdown.find(".oem-mp__select")[0];
    if (!select || $trigger.prop("disabled")) return;

    closeDropdowns($dropdown);
    $dropdown.addClass("is-open");
    $trigger.attr("aria-expanded", "true");
    $dropdown
      .find(".oem-mp__select-option")
      .eq(select.selectedIndex)
      .trigger("focus");
  }

  function initializeDropdowns() {
    $page.find(".oem-mp__select").each(function () {
      const $select = $(this);
      buildDropdown($select);

      new MutationObserver(function () {
        buildDropdown($select);
      }).observe(this, { childList: true, subtree: true, characterData: true });
    });
  }

  /* --------------------------------------------------------------------------
     Terms and Conditions popover
     -------------------------------------------------------------------------- */

  const $popover = $page.find(".oem-mp__terms-popover");
  const $terms = $popover.find(".oem-mp__terms-copy");
  const $more = $popover.find(".oem-mp__terms-more");
  const $close = $popover.find(".oem-mp__terms-close");
  const noTerms = "Terms and conditions are not available for this promotion.";
  let $activeTermsButton = null;

  function getCardTerms($button) {
    const template = $button
      .closest(".oem-mp__featured-card, .oem-mp__card")
      .find(".oem-mp__terms-template")[0];
    if (!template) return noTerms;
    return template.content.textContent.replace(/\s+/g, " ").trim() || noTerms;
  }

  function positionPopover() {
    if (!$activeTermsButton || !$popover.hasClass("is-open")) return;

    const trigger = $activeTermsButton[0].getBoundingClientRect();
    const popover = $popover[0].getBoundingClientRect();
    const edge = 15;
    const gap = 10;
    let left = trigger.left + (trigger.width - popover.width) / 2;
    let top = trigger.bottom + gap;

    left = Math.max(
      edge,
      Math.min(left, window.innerWidth - popover.width - edge),
    );
    if (top + popover.height > window.innerHeight - edge) {
      top = trigger.top - popover.height - gap;
    }

    $popover.css({
      left: Math.round(left) + "px",
      top: Math.round(Math.max(edge, top)) + "px",
    });
  }

  function updateMoreButton() {
    if ($popover.hasClass("is-expanded")) return;
    const hasOverflow = $terms[0].scrollHeight > $terms[0].clientHeight + 1;
    $more.prop("hidden", !hasOverflow);
    positionPopover();
  }

  function closePopover(restoreFocus) {
    if (!$activeTermsButton) return;
    const $previousButton = $activeTermsButton;

    $previousButton.attr("aria-expanded", "false");
    $popover.removeClass("is-open is-expanded").attr("aria-hidden", "true");
    $more.prop("hidden", false).attr("aria-expanded", "false");
    $terms.text("");
    $activeTermsButton = null;
    if (restoreFocus) $previousButton.trigger("focus");
  }

  function openPopover($button) {
    if ($activeTermsButton) $activeTermsButton.attr("aria-expanded", "false");

    $activeTermsButton = $button;
    $button
      .attr("aria-controls", "promotion-terms-popover")
      .attr("aria-expanded", "true");
    $terms.text(getCardTerms($button));
    $popover
      .removeClass("is-expanded")
      .attr("aria-hidden", "false")
      .addClass("is-open");
    $more.prop("hidden", false).attr("aria-expanded", "false");

    requestAnimationFrame(function () {
      updateMoreButton();
      $close.trigger("focus");
    });
  }

  /* --------------------------------------------------------------------------
     Coupon image modal
     -------------------------------------------------------------------------- */

  const $couponModal = $page.find(".oem-mp__coupon-modal");
  const $couponImage = $couponModal.find(".oem-mp__coupon-image");
  const $couponClose = $couponModal.find(".oem-mp__coupon-close");
  let $activeCouponButton = null;

  function openCouponModal($button) {
    const image = $button.attr("data-coupon-src");
    const title = $button.attr("data-coupon-title") || "Promotion";
    if (!image) return;

    if ($activeTermsButton) closePopover(false);
    $activeCouponButton = $button.attr("aria-expanded", "true");
    $couponImage.attr({ src: image, alt: `Coupon for ${title}` });
    $couponModal.addClass("is-open").attr("aria-hidden", "false");
    $("body").addClass("oem-mp--coupon-open");

    requestAnimationFrame(function () {
      $couponClose.trigger("focus");
    });
  }

  function closeCouponModal(restoreFocus) {
    if (!$couponModal.hasClass("is-open")) return;
    const $previousButton = $activeCouponButton;

    $couponModal.removeClass("is-open").attr("aria-hidden", "true");
    $("body").removeClass("oem-mp--coupon-open");
    $couponImage.attr({ src: "", alt: "" });
    if ($previousButton) $previousButton.attr("aria-expanded", "false");
    $activeCouponButton = null;
    if (restoreFocus && $previousButton) $previousButton.trigger("focus");
  }

  /* --------------------------------------------------------------------------
     CSV parsing and promotion normalization
     -------------------------------------------------------------------------- */

  function readCustomers(rows) {
    return rows
      .slice(CUSTOMER_START_ROW)
      .map(function (row) {
        return {
          domain: utils.normalizeDomain(row[DOMAIN_COLUMN]),
          oems: utils.splitList(row[CUSTOMER_OEMS_COLUMN]),
        };
      })
      .filter(function (item) {
        return item.domain;
      });
  }

  function rowToPromotion(headers, row) {
    const promo = {};
    headers.forEach(function (header, index) {
      const key = String(header || "").trim();
      if (key) promo[key] = row[index] == null ? "" : row[index];
    });
    return promo;
  }

  function normalizePromotion(promo, allowedOemKeys) {
    const oem = String(promo.OEM || "").trim();
    const title = String(promo.Title || "").trim();
    const startDate = utils.parseDate(promo["Start Date"]);
    const endDate = utils.parseDate(promo["End Date"]);
    const image = utils.getDrivePreviewUrl(
      String(promo.Image || promo["Image 2"] || "").trim(),
    );

    if (utils.normalizeText(promo.Status) !== "active") return null;
    if (!allowedOemKeys.has(utils.normalizeText(oem))) return null;

    const normalized = {
      ...promo,
      OEM: oem,
      Title: title,
      Type: String(promo.Type || "").trim(),
      Category: String(promo.Category || "").trim(),
      Content: String(promo.Content || "").trim(),
      terms: String(promo["Terms & Conditions"] || "").trim(),
      image: image,
      featured: utils.isFeatured(promo.Featured),
      startDate: startDate,
      endDate: endDate,
      position: parseInt(promo["Carousel position"], 10) || 9999,
      resolvedHref: utils.resolveHref(promo),
    };

    normalized.searchText = utils.normalizeText(
      [
        normalized.Title,
        normalized.OEM,
        normalized.Type,
        normalized.Category,
        normalized.Content,
      ].join(" "),
    );

    return normalized;
  }

  function readPromotions(rows, allowedOems) {
    const headers = (rows[0] || []).slice(0, PROMOTION_COLUMN_COUNT);
    const allowedOemKeys = new Set(allowedOems.map(utils.normalizeText));

    return rows
      .slice(1)
      .map(function (row) {
        return rowToPromotion(headers, row);
      })
      .map(function (promo) {
        return normalizePromotion(promo, allowedOemKeys);
      })
      .filter(Boolean);
  }

  /* --------------------------------------------------------------------------
     Card, loading and empty-state rendering
     -------------------------------------------------------------------------- */

  function skeletonLines() {
    return `
      <span class="oem-mp__skeleton-line oem-mp__skeleton-line--wide"></span>
      <span class="oem-mp__skeleton-line"></span>
      <span class="oem-mp__skeleton-line oem-mp__skeleton-line--short"></span>`;
  }

  function renderSkeletons() {
    const featuredSkeleton = `
      <article class="oem-mp__featured-card oem-mp__skeleton" aria-hidden="true">
        <span class="oem-mp__skeleton-featured-copy">${skeletonLines()}</span>
      </article>`;
    const cardSkeleton = `
      <article class="oem-mp__card oem-mp__skeleton" aria-hidden="true">
        <span class="oem-mp__skeleton-media"></span>
        <span class="oem-mp__skeleton-copy">${skeletonLines()}</span>
      </article>`;

    $dom.featuredGrid.html(featuredSkeleton.repeat(3));
    $dom.promotionsGrid.html(cardSkeleton.repeat(config.pageSize));
    $dom.pagination.prop("hidden", true);
    setControlsDisabled(true);
  }

  function mediaMarkup(promo, featured) {
    const className = featured
      ? "oem-mp__featured-media"
      : "oem-mp__card-media";
    const imageClass = featured
      ? "oem-mp__featured-image"
      : "oem-mp__card-image";
    const label = `View ${promo.Title}`;
    const image = `<img class="${imageClass}" src="${utils.escapeHtml(promo.image)}" alt="${utils.escapeHtml(promo.Title)}" loading="lazy">`;

    if (!promo.resolvedHref) {
      return `<div class="${className} is-disabled" aria-label="${utils.escapeHtml(label)}">${image}</div>`;
    }

    const externalAttributes = promo.resolvedHref.external
      ? ' target="_blank" rel="noopener noreferrer"'
      : "";
    return `<a class="${className}" href="${utils.escapeHtml(promo.resolvedHref.href)}" aria-label="${utils.escapeHtml(label)}"${externalAttributes}>${image}</a>`;
  }

  function couponButtonMarkup(promo) {
    return `
      <button class="oem-mp__coupon-button" type="button"
        data-coupon-src="${utils.escapeHtml(promo.image)}"
        data-coupon-title="${utils.escapeHtml(promo.Title)}"
        aria-controls="promotion-coupon-modal" aria-haspopup="dialog" aria-expanded="false"
        aria-label="View coupon for ${utils.escapeHtml(promo.Title)}">
        View Coupon
      </button>`;
  }

  function termsMarkup(promo, featured) {
    const disabled = promo.terms ? "" : " disabled aria-disabled=\"true\"";
    const modifier = featured ? " oem-mp__terms-button--featured" : "";
    const iconColor = featured ? "#FBFBFD" : "#1E1E1E";
    const template = promo.terms
      ? `<template class="oem-mp__terms-template">${utils.escapeHtml(promo.terms)}</template>`
      : "";

    return `
      <button class="oem-mp__terms-button${modifier}" type="button"
        aria-haspopup="dialog" aria-expanded="false"${disabled}>
        ${termsIcon(iconColor)}
        <span>Terms &amp; Conditions</span>
      </button>
      ${template}`;
  }

  function featuredCardMarkup(promo) {
    return `
      <article class="oem-mp__featured-card">
        ${mediaMarkup(promo, true)}
        ${couponButtonMarkup(promo)}
        <div class="oem-mp__featured-overlay" aria-hidden="true"></div>
        <time class="oem-mp__featured-date" datetime="${utils.toIsoDate(promo.endDate)}">End Date: ${utils.formatDate(promo.endDate)}</time>
        <div class="oem-mp__featured-content">
          <h3 class="oem-mp__featured-title">${utils.escapeHtml(promo.Title)}</h3>
          ${promo.Content ? `<p class="oem-mp__featured-description">${utils.escapeHtml(promo.Content)}</p>` : ""}
        </div>
        ${termsMarkup(promo, true)}
      </article>`;
  }

  function cardMarkup(promo) {
    return `
      <article class="oem-mp__card">
        ${mediaMarkup(promo, false)}
        ${couponButtonMarkup(promo)}
        <div class="oem-mp__card-body">
          <h3 class="oem-mp__card-title">${utils.escapeHtml(promo.Title)}</h3>
          ${promo.Content ? `<p class="oem-mp__card-description">${utils.escapeHtml(promo.Content)}</p>` : ""}
        </div>
        <footer class="oem-mp__card-footer">
          ${termsMarkup(promo, false)}
          <time class="oem-mp__end-date" datetime="${utils.toIsoDate(promo.endDate)}">End Date: ${utils.formatDate(promo.endDate)}</time>
        </footer>
      </article>`;
  }

  function stateMarkup(title, copy, isError) {
    return `
      <div class="oem-mp__state${isError ? " is-error" : ""}" role="status">
        <strong>${utils.escapeHtml(title)}</strong>
        <span>${utils.escapeHtml(copy)}</span>
      </div>`;
  }

  function renderFeatured() {
    const featured = state.promotions
      .filter(function (promo) {
        return promo.featured;
      })
      .sort(compareByPosition);

    const hasFeatured = featured.length > 0;
    $dom.featured.prop("hidden", !hasFeatured).attr("aria-busy", "false");
    $dom.featuredDivider.prop("hidden", !hasFeatured);
    $dom.featuredGrid.html(
      hasFeatured ? featured.map(featuredCardMarkup).join("") : "",
    );
  }

  function renderResults() {
    closePopover(false);

    const total = state.filteredPromotions.length;
    const totalPages = Math.max(1, Math.ceil(total / config.pageSize));
    state.currentPage = Math.min(Math.max(state.currentPage, 1), totalPages);

    if (!total) {
      $dom.promotionsGrid.html(
        stateMarkup(
          "No promotions found",
          "Try changing your search or selected filters.",
          false,
        ),
      );
    } else {
      const start = (state.currentPage - 1) * config.pageSize;
      const pagePromotions = state.filteredPromotions.slice(
        start,
        start + config.pageSize,
      );
      $dom.promotionsGrid.html(pagePromotions.map(cardMarkup).join(""));
    }

    $dom.promotions.attr("aria-busy", "false");
    $dom.resultsStatus.text(
      total === 1 ? "1 promotion found." : `${total} promotions found.`,
    );
    $dom.paginationPage.text(`${state.currentPage} of ${totalPages}`);
    $dom.pagination.prop("hidden", totalPages <= 1);
    $dom.pagination
      .find('[data-page-action="previous"]')
      .prop("disabled", state.currentPage <= 1);
    $dom.pagination
      .find('[data-page-action="next"]')
      .prop("disabled", state.currentPage >= totalPages);
  }

  function renderLoadFailure(title, copy) {
    state.isLoading = false;
    state.promotions = [];
    $dom.featured.prop("hidden", true).attr("aria-busy", "false");
    $dom.featuredDivider.prop("hidden", true);
    $dom.promotions.attr("aria-busy", "false");
    $dom.promotionsGrid.html(stateMarkup(title, copy, true));
    $dom.pagination.prop("hidden", true);
    $dom.resultsStatus.text(copy);
    setControlsDisabled(true);
  }

  /* --------------------------------------------------------------------------
     Search, filters, sorting and pagination
     -------------------------------------------------------------------------- */

  function compareByPosition(a, b) {
    return (
      a.position - b.position ||
      a.OEM.localeCompare(b.OEM) ||
      a.Title.localeCompare(b.Title)
    );
  }

  function sortPromotions(promotions, sort) {
    return promotions.slice().sort(function (a, b) {
      if (sort === "newest") {
        return b.startDate - a.startDate || a.Title.localeCompare(b.Title);
      }
      if (sort === "ending-soon") {
        return a.endDate - b.endDate || a.Title.localeCompare(b.Title);
      }
      if (sort === "a-z") return a.Title.localeCompare(b.Title);

      return Number(b.featured) - Number(a.featured) || compareByPosition(a, b);
    });
  }

  function applyFilters(resetPage) {
    if (state.isLoading) return;

    const search = utils.normalizeText($dom.search.val());
    const oem = utils.normalizeText($dom.oem.val());
    const category = utils.normalizeText($dom.category.val());
    const type = utils.normalizeText($dom.type.val());

    const matching = state.promotions.filter(function (promo) {
      return (
        (!search || promo.searchText.includes(search)) &&
        (!oem || utils.normalizeText(promo.OEM) === oem) &&
        (!category || utils.normalizeText(promo.Category) === category) &&
        (!type || utils.normalizeText(promo.Type) === type)
      );
    });

    state.filteredPromotions = sortPromotions(matching, $dom.sort.val());
    if (resetPage) state.currentPage = 1;
    renderResults();
  }

  function uniqueValues(field) {
    const values = new Map();
    state.promotions.forEach(function (promo) {
      const value = String(promo[field] || "").trim();
      const key = utils.normalizeText(value);
      if (key && !values.has(key)) values.set(key, value);
    });
    return [...values.values()].sort(function (a, b) {
      return a.localeCompare(b);
    });
  }

  function populateSelect($select, defaultLabel, values) {
    $select.empty().append($("<option>", { value: "", text: defaultLabel }));
    values.forEach(function (value) {
      $select.append($("<option>", { value: value, text: value }));
    });
    $select.prop("selectedIndex", 0);
    buildDropdown($select);
  }

  function populateFilters() {
    populateSelect($dom.oem, "All OEMs", uniqueValues("OEM"));
    populateSelect($dom.category, "All Categories", uniqueValues("Category"));
    populateSelect($dom.type, "All Types", uniqueValues("Type"));
    buildDropdown($dom.sort);
  }

  // Set a dropdown only when the URL value exists in its available options.
  function setFilterFromUrl($select, value) {
    if (!value) return;

    const requestedValue = utils.normalizeText(value);
    const matchingOption = $select.find("option").filter(function () {
      return utils.normalizeText(this.value) === requestedValue;
    })[0];

    if (!matchingOption) return;
    $select.val(matchingOption.value);
    updateDropdown($select);
  }

  // Use URL values as the initial filter state after CSV options are loaded.
  function applyUrlFilterDefaults() {
    const params = new URLSearchParams(window.location.search);

    setFilterFromUrl($dom.oem, params.get("oem"));
    setFilterFromUrl($dom.category, params.get("category"));
    setFilterFromUrl($dom.type, params.get("type"));
    setFilterFromUrl($dom.sort, params.get("sort"));
  }

  function setControlsDisabled(disabled) {
    $dom.filters.toggleClass("is-disabled", disabled);
    $dom.filters.find("input, select, button").prop("disabled", disabled);
  }

  /* --------------------------------------------------------------------------
     Load the published Google Sheet once; all later interactions stay local.
     -------------------------------------------------------------------------- */

  function loadPromotions() {
    if (!config.csvUrl) {
      renderLoadFailure(
        "Promotions unavailable",
        "The Google Sheets URL is not configured.",
      );
      return;
    }

    if (typeof Papa === "undefined") {
      renderLoadFailure(
        "Promotions unavailable",
        "The CSV parser could not be loaded.",
      );
      return;
    }

    Papa.parse(config.csvUrl, {
      download: true,
      header: false,
      dynamicTyping: false,
      skipEmptyLines: false,
      complete: function (results) {
        try {
          const rows = Array.isArray(results.data) ? results.data : [];
          if (!rows.length)
            throw new Error("The published spreadsheet is empty.");

          const customers = readCustomers(rows);
          const currentDomain = utils.currentDomain();
          state.customer =
            customers.find(function (customer) {
              return customer.domain === currentDomain;
            }) || null;

          if (!state.customer) {
            renderLoadFailure(
              "Promotions are not configured",
              `No manufacturer promotion profile was found for ${currentDomain || "this website"}.`,
            );
            return;
          }

          state.promotions = readPromotions(rows, state.customer.oems);
          state.filteredPromotions = state.promotions.slice();
          state.currentPage = 1;
          state.isLoading = false;

          populateFilters();
          applyUrlFilterDefaults();
          setControlsDisabled(!state.promotions.length);
          renderFeatured();

          if (!state.promotions.length) {
            $dom.promotionsGrid.html(
              stateMarkup(
                "No active promotions",
                "There are currently no active promotions for this website.",
                false,
              ),
            );
            $dom.promotions.attr("aria-busy", "false");
            $dom.pagination.prop("hidden", true);
            $dom.resultsStatus.text("No active promotions found.");
            return;
          }

          applyFilters(true);
        } catch (error) {
          console.error("Manufacturer promotions processing error:", error);
          renderLoadFailure(
            "Unable to prepare promotions",
            "The promotion data could not be processed. Please try again later.",
          );
        }
      },
      error: function (error) {
        console.error("Manufacturer promotions CSV error:", error);
        renderLoadFailure(
          "Unable to load promotions",
          "The promotion feed could not be reached. Please try again later.",
        );
      },
    });
  }

  /* --------------------------------------------------------------------------
     Page events
     -------------------------------------------------------------------------- */

  $page.on("click", ".oem-mp__select-trigger", function () {
    const $dropdown = $(this).closest(".oem-mp__select-control");
    if ($dropdown.hasClass("is-open")) closeDropdown($dropdown, false);
    else openDropdown($dropdown);
  });

  $page.on("keydown", ".oem-mp__select-trigger", function (event) {
    if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
    event.preventDefault();
    openDropdown($(this).closest(".oem-mp__select-control"));
  });

  $page.on("click", ".oem-mp__select-option", function () {
    const $option = $(this);
    const $dropdown = $option.closest(".oem-mp__select-control");
    const $select = $dropdown.find(".oem-mp__select");
    $select
      .prop("selectedIndex", Number($option.attr("data-option-index")))
      .trigger("change");
    closeDropdown($dropdown, true);
  });

  $page.on("keydown", ".oem-mp__select-option", function (event) {
    const $option = $(this);
    const $dropdown = $option.closest(".oem-mp__select-control");
    const $options = $dropdown.find(".oem-mp__select-option");

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      $option.trigger("click");
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeDropdown($dropdown, true);
      return;
    }
    if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;

    event.preventDefault();
    const direction = event.key === "ArrowDown" ? 1 : -1;
    const current = $options.index(this);
    const next = (current + direction + $options.length) % $options.length;
    $options.eq(next).trigger("focus");
  });

  $page.on("change", ".oem-mp__select", function () {
    updateDropdown($(this));
  });

  $page.on("focusout", ".oem-mp__select-control", function () {
    const $dropdown = $(this);
    setTimeout(function () {
      if (!$.contains($dropdown[0], document.activeElement))
        closeDropdown($dropdown, false);
    }, 0);
  });

  $dom.filtersForm.on("submit", function (event) {
    event.preventDefault();
    applyFilters(true);
  });

  $dom.search.on(
    "input",
    utils.debounce(function () {
      applyFilters(true);
    }, 200),
  );

  $page.on(
    "change",
    "#promotion-oem, #promotion-category, #promotion-type, #promotion-sort",
    function () {
      applyFilters(true);
    },
  );

  $page.on("click", ".oem-mp__pagination-button", function () {
    if ($(this).prop("disabled")) return;
    const action = $(this).attr("data-page-action");
    state.currentPage += action === "previous" ? -1 : 1;
    renderResults();
    $dom.promotions[0].scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $page.on("click", ".oem-mp__terms-button", function () {
    if ($(this).prop("disabled")) return;
    openPopover($(this));
  });

  $page.on("click", ".oem-mp__terms-close", function () {
    closePopover(true);
  });

  $page.on("click", ".oem-mp__terms-more", function () {
    $popover.addClass("is-expanded");
    $more.attr("aria-expanded", "true").prop("hidden", true);
    requestAnimationFrame(positionPopover);
  });

  $page.on("click", ".oem-mp__coupon-button", function () {
    openCouponModal($(this));
  });

  $page.on("click", "[data-coupon-close]", function () {
    closeCouponModal(true);
  });

  $(document).on("click.oemPromotions", function (event) {
    const $target = $(event.target);
    if (!$target.closest(".oem-mp__select-control").length) closeDropdowns();
    if (!$activeTermsButton) return;
    if ($target.closest(".oem-mp__terms-popover").length) return;
    if ($target.closest(".oem-mp__terms-button").is($activeTermsButton)) return;
    closePopover(false);
  });

  $(document).on("keydown.oemPromotions", function (event) {
    if (event.key !== "Escape") return;
    if ($couponModal.hasClass("is-open")) {
      closeCouponModal(true);
      return;
    }
    const $openDropdown = $page.find(".oem-mp__select-control.is-open");
    if ($openDropdown.length) closeDropdown($openDropdown, true);
    if ($activeTermsButton) closePopover(true);
  });

  $(window).on("resize.oemPromotions scroll.oemPromotions", positionPopover);
  $dom.featuredGrid.on("scroll.oemPromotions", positionPopover);

  /* Initial page setup */
  renderSkeletons();
  initializeDropdowns();
  loadPromotions();
});
