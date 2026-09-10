/* POLARIS POWERSPORTS PAGE SCRIPT
 * Contains this page's own UI behavior and promotion automation.
 * External dependencies: jQuery, PapaParse and Swiper.
 */

/* ==========================================================================
   POLARIS POWERSPORTS: PAGE BEHAVIOR 1
   ========================================================================== */
jQuery(document).ready(function () {
  // ==========================================
  // CUSTOM SEARCH DROPDOWNS & AJAX FORM
  // ==========================================
  jQuery(".select-item__cont-selected").on("click", function (e) {
    e.stopPropagation();
    var currentContainer = jQuery(this).closest(".select-item__cont");
    jQuery(".select-item__cont").not(currentContainer).removeClass("expanded");
    currentContainer.toggleClass("expanded");
  });

  jQuery(document).on("click", function () {
    jQuery(".select-item__cont").removeClass("expanded");
  });

  jQuery(".select-item__cont-options").on("click", function (e) {
    e.stopPropagation();
  });

  jQuery(".form-row").on("change", 'input[type="radio"]', function () {
    var selectedText = jQuery(this).parent().text().trim();
    var container = jQuery(this).closest(".select-item__cont");
    container.find(".select-item__cont-selected span").text(selectedText);
    container.removeClass("expanded");
  });

  jQuery(".form-row").submit(function (e) {
    e.preventDefault();

    var searchText = jQuery('input[name="sortSearch"]').val().trim();
    var selectedModel = jQuery('input[name="sortModels"]:checked').val();
    var selectedUsage = jQuery('input[name="sortUsage"]:checked').val();
    var defaultVal = "All Inventory";

    var searchurl = "/inventory/?";

    if (searchText) {
      searchurl +=
        "post_type=wpp_manage_inventory&s=" +
        encodeURIComponent(searchText) +
        "&";
    }

    if (selectedModel && selectedModel !== defaultVal) {
      searchurl += "category=" + encodeURIComponent(selectedModel) + "&";
    }

    searchurl += "make=Polaris&";

    if (selectedUsage && selectedUsage !== defaultVal) {
      searchurl += "condition=" + encodeURIComponent(selectedUsage) + "&";
    }

    if (searchurl.endsWith("&") || searchurl.endsWith("?")) {
      searchurl = searchurl.slice(0, -1);
    }

    window.location.href = searchurl;
  });

  jQuery.ajax({
    url: "/inventory",
    type: "GET",
    success: function (data) {
      var response = jQuery(data);

      response.find(".inventory-search-title").each(function () {
        var categoryText = jQuery(this).text().trim().toLowerCase();
        var targetID = "";
        var inputName = "";

        if (categoryText === "category") {
          targetID = "#select-models";
          inputName = "sortModels";
        } else if (categoryText === "make") {
          targetID = "#select-make";
          inputName = "sortMake";
        }

        if (targetID) {
          jQuery(targetID + " .select-item__cont-options label")
            .not(":first")
            .remove();

          jQuery(this)
            .parent()
            .parent()
            .find("ul.inventory-filter-box .filter-checkbox-content label")
            .each(function () {
              var itemText = jQuery(this).text().trim();
              if (itemText) {
                var newInput = jQuery("<input>", {
                  type: "radio",
                  name: inputName,
                  value: itemText,
                });
                var newLabel = jQuery("<label>")
                  .append(newInput)
                  .append(" " + itemText);
                jQuery(targetID + " .select-item__cont-options").append(
                  newLabel,
                );
              }
            });
        }
      });
    },
    error: function (error) {
      console.log("Error loading dynamic filters:", error.statusText);
    },
  });

  if (window.innerWidth > 768) {
    jQuery(".form-row").addClass("displayed-menu");
  }

  jQuery("p.title.search-inventory-dropdown").on("click", function () {
    if (window.innerWidth < 768) {
      jQuery(".form-row").toggleClass("displayed-menu");
    }
  });

  jQuery(window).on("load resize", function () {
    var windowWidth = jQuery(window).width();
    var targetList = jQuery("ol.flex-control-nav.flex-control-paging");
    if (windowWidth > 1100) {
      if (!targetList.parent().hasClass("custom-nav-container")) {
        targetList.wrap(
          '<div class="custom-nav-container" style="display: flex; align-items: center; justify-content: center; gap: 15px;"></div>',
        );
        targetList.before('<span class="promo-text">CURRENT PROMOTIONS</span>');
        targetList.after(
          '<a href="/inventory" class="cta-inventory">EXPLORE</a>',
        );
      }
    } else {
      if (targetList.parent().hasClass("custom-nav-container")) {
        targetList.siblings(".promo-text, .cta-inventory").remove();
        targetList.unwrap();
      }
    }
  });

  jQuery(".hamburguer-menu").on("click", function () {
    jQuery(this).find("i").toggleClass("active");
    jQuery(".mobile-dropdown").toggleClass("visible");
  });
});

/* ==========================================================================
   POLARIS POWERSPORTS: PAGE BEHAVIOR 2
   ========================================================================== */
jQuery(document).ready(function () {
  const tabsSwiper = new Swiper(".tabsSwiper", {
    spaceBetween: 0,
    freeMode: true,
    grabCursor: true,

    navigation: {
      nextEl: ".tabs-swiper-button-next",
      prevEl: ".tabs-swiper-button-prev",
    },

    breakpoints: {
      320: {
        slidesPerView: 2,
      },
      576: {
        slidesPerView: 3,
      },
      992: {
        slidesPerView: 8,
      },
      1200: {
        slidesPerView: 8,
      },
    },
  });

  var swiper = new Swiper(".polaris-row-next .swiper", {
    slidesPerView: 1,
    loop: true,
    navigation: {
      nextEl: ".polaris-row-next .swiper-button-next",
      prevEl: ".polaris-row-next .swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
      renderBullet: function (index, className) {
        return index < 4 ? `<span class="${className}"></span>` : "";
      },
    },
    breakpoints: {
      320: {
        slidesPerView: 1,
      },
    },
    on: {
      slideChange: function () {
        let currentIndex = this.realIndex % 4;
      },
    },
  });
  var swiper = new Swiper(".polaris-row-xpedition .swiper", {
    slidesPerView: 1,
    loop: true,
    navigation: {
      nextEl: ".polaris-row-xpedition .swiper-button-next",
      prevEl: ".polaris-row-xpedition .swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
      renderBullet: function (index, className) {
        return index < 4 ? `<span class="${className}"></span>` : "";
      },
    },
    breakpoints: {
      320: {
        slidesPerView: 1,
      },
    },
    on: {
      slideChange: function () {
        let currentIndex = this.realIndex % 4;
      },
    },
  });
  var swiper = new Swiper(".polaris-row-rzr .swiper", {
    slidesPerView: 1,
    loop: true,
    navigation: {
      nextEl: ".polaris-row-rzr .swiper-button-next",
      prevEl: ".polaris-row-rzr .swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
      renderBullet: function (index, className) {
        return index < 4 ? `<span class="${className}"></span>` : "";
      },
    },
    breakpoints: {
      320: {
        slidesPerView: 1,
      },
    },
    on: {
      slideChange: function () {
        let currentIndex = this.realIndex % 4;
      },
    },
  });
  var swiper = new Swiper(".polaris-row-ranger .swiper", {
    slidesPerView: 1,
    loop: true,
    navigation: {
      nextEl: ".polaris-row-ranger .swiper-button-next",
      prevEl: ".polaris-row-ranger .swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
      renderBullet: function (index, className) {
        return index < 4 ? `<span class="${className}"></span>` : "";
      },
    },
    breakpoints: {
      320: {
        slidesPerView: 1,
      },
    },
    on: {
      slideChange: function () {
        let currentIndex = this.realIndex % 4;
      },
    },
  });
  var swiper = new Swiper(".polaris-row-sportsman .swiper", {
    slidesPerView: 1,
    loop: true,
    navigation: {
      nextEl: ".polaris-row-sportsman .swiper-button-next",
      prevEl: ".polaris-row-sportsman .swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
      renderBullet: function (index, className) {
        return index < 4 ? `<span class="${className}"></span>` : "";
      },
    },
    breakpoints: {
      320: {
        slidesPerView: 1,
      },
    },
    on: {
      slideChange: function () {
        let currentIndex = this.realIndex % 4;
      },
    },
  });
  var swiper = new Swiper(".polaris-row-youth .swiper", {
    slidesPerView: 1,
    loop: true,
    navigation: {
      nextEl: ".polaris-row-youth .swiper-button-next",
      prevEl: ".polaris-row-youth .swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
      renderBullet: function (index, className) {
        return index < 4 ? `<span class="${className}"></span>` : "";
      },
    },
    breakpoints: {
      320: {
        slidesPerView: 1,
      },
    },
    on: {
      slideChange: function () {
        let currentIndex = this.realIndex % 4;
      },
    },
  });
});

/* ==========================================================================
   POLARIS POWERSPORTS: PAGE BEHAVIOR 3
   ========================================================================== */
document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".tabs-row__card");
  const slides = document.querySelectorAll(".slider-cont");

  tabs.forEach((tab) => {
    tab.addEventListener("click", function (e) {
      e.preventDefault();

      tabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      const targetId = this.id + "-slide";

      slides.forEach((slide) => {
        if (slide.id === targetId) {
          slide.classList.add("active");
          slide.classList.remove("inactive");
        } else {
          slide.classList.remove("active");
          slide.classList.add("inactive");
        }
      });
    });
  });
});

/* ==========================================================================
   POLARIS POWERSPORTS: PAGE BEHAVIOR 4
   ========================================================================== */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    const headerHeight = 40;

    const offsetTop = target.offsetTop - headerHeight;

    window.scrollTo({
      top: offsetTop,
      behavior: "smooth",
    });
  });
});

/* ==========================================================================\n   POLARIS POWERSPORTS: OEM PROMOTIONS AUTOMATION\n   ========================================================================== */
(function ($) {
  // Per-page settings — change `oem` and `inventoryLink` to reuse on another OEM page.
  const PROMO_CONFIG = {
    csvUrl:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vQxeKAIyWFGRAoXqXW9TG5KNkwkfTuQi2CJNFNVwtFMNyn5CVJjIfnC_2R0McOMEE-xZELk5WBSeEcQ/pub?gid=0&single=true&output=csv",
    oem: "test", // must match the OEM column in the sheet
    inventoryLink:
      "/inventory/?make=Polaris&category=Powersports&condition=New",
    defaultRegion: "USA",
  };

  // Added 10092026: Resolve Region from the customer catalog and filter this OEM's Active promotions.
  const PROMOTION_COLUMN_COUNT = 15;
  const CUSTOMER_START_ROW = 2;
  const CUSTOMER_DOMAIN_COLUMN = 32;
  const CUSTOMER_REGION_COLUMN = 34;

  const promoUtils = {
    splitImageLinks: function (value) {
      if (!value) return [];
      return value
        .toString()
        .split(/[\n,;]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    },
    getDrivePreviewUrl: function (url) {
      if (!url || !url.includes("drive.google.com")) return url;
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      return match
        ? `https://lh3.googleusercontent.com/d/${match[1]}=w800`
        : url;
    },
    escapeHtml: function (str) {
      return (str == null ? "" : String(str))
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    },
    normalizeDomain: function (value) {
      const raw = (value == null ? "" : String(value)).trim().toLowerCase();
      if (!raw || raw === "*") return raw;
      try {
        return new URL(
          raw.includes("://") ? raw : `https://${raw}`,
        ).hostname.replace(/^www\./, "");
      } catch (e) {
        return raw
          .replace(/^https?:\/\//, "")
          .replace(/^www\./, "")
          .split("/")[0]
          .trim();
      }
    },
    parseHrefs: function (value) {
      if (!value) return [];
      if (Array.isArray(value)) {
        return value
          .map(function (item) {
            if (typeof item === "string") {
              const href = item.trim();
              return href ? { domain: "*", href: href } : null;
            }
            const href = (item.href || item.Href || "").toString().trim();
            const domain = promoUtils.normalizeDomain(
              item.domain || item.Domain || "*",
            );
            return href ? { domain: domain, href: href } : null;
          })
          .filter(Boolean);
      }
      try {
        return promoUtils.parseHrefs(JSON.parse(value));
      } catch (e) {
        return [];
      }
    },
    isAbsoluteUrl: function (href) {
      return /^[a-z][a-z0-9+.-]*:\/\//i.test(href);
    },
    resolvePromoHref: function (promo) {
      const currentDomain = promoUtils.normalizeDomain(
        window.location.hostname,
      );
      const hrefs = promoUtils.parseHrefs(
        promo.Hrefs || promo.hrefs || promo.HREFS || promo.Href || promo.href,
      );
      const matched = hrefs.find(function (item) {
        return item.domain === currentDomain;
      });
      const wildcard = hrefs.find(function (item) {
        return item.domain === "*";
      });
      const selected = matched || wildcard;
      const selectedHref = selected ? selected.href : "";
      const rawHref = (selectedHref || PROMO_CONFIG.inventoryLink).trim();
      const result = { href: rawHref, external: false };
      if (!rawHref || !promoUtils.isAbsoluteUrl(rawHref)) return result;
      try {
        const url = new URL(rawHref);
        if (promoUtils.normalizeDomain(url.hostname) === currentDomain)
          result.href = `${url.pathname}${url.search}${url.hash}`;
        else result.external = true;
      } catch (e) {
        result.href = rawHref;
      }
      return result;
    },
  };

  function getMatchingPromotions(rows) {
    const headers = (rows[0] || []).slice(0, PROMOTION_COLUMN_COUNT);
    const currentDomain = promoUtils.normalizeDomain(window.location.hostname);
    const customerRow = rows.slice(CUSTOMER_START_ROW).find(function (row) {
      return (
        promoUtils.normalizeDomain(row[CUSTOMER_DOMAIN_COLUMN]) ===
        currentDomain
      );
    });
    const customerRegion =
      String(customerRow ? customerRow[CUSTOMER_REGION_COLUMN] : "")
        .trim()
        .toUpperCase() || PROMO_CONFIG.defaultRegion;
    const targetOem = PROMO_CONFIG.oem.trim().toLowerCase();

    return rows
      .slice(1)
      .map(function (row) {
        return headers.reduce(function (promotion, header, index) {
          const key = String(header || "").trim();
          if (key) promotion[key] = row[index] == null ? "" : row[index];
          return promotion;
        }, {});
      })
      .filter(function (promotion) {
        const oem = String(promotion.OEM || "")
          .trim()
          .toLowerCase();
        const status = String(promotion.Status || "")
          .trim()
          .toLowerCase();
        const region = String(promotion.Region || "")
          .trim()
          .toUpperCase();
        return (
          oem === targetOem &&
          status === "active" &&
          (region === customerRegion || region === "ALL")
        );
      });
  }

  // Builds the actual HTML for BOTH the original banners and the new swiper
  function renderPromotions(promos) {
    const banners = [];
    promos.forEach(function (promo) {
      const images = [
        ...promoUtils.splitImageLinks(promo.Image),
        ...promoUtils.splitImageLinks(promo["Image 2"]),
      ];
      const rawUrl = images[0];
      if (!rawUrl) return;

      const url = promoUtils.getDrivePreviewUrl(rawUrl);
      if (!url) return;

      const title = (promo.Title || "Polaris Snowmobile Promotion").toString();
      const terms = (promo["Terms & Conditions"] || "").toString().trim();
      const promoHref = promoUtils.resolvePromoHref(promo);
      banners.push({
        url: url,
        title: title,
        terms: terms,
        href: promoHref.href,
        external: promoHref.external,
      });
    });

    if (!banners.length) return;

    //  RENDER PROMOTIONS (#promotionsCont) ---
    const $standardCont = $("#promotionsCont");
    if ($standardCont.length) {
      $standardCont.find(".promo-fallback").remove();

      // Only inject if this container IS NOT the wrapper for the swiper itself
      if ($standardCont.find(".swiper-wrapper").length === 0) {
        banners.forEach(function (b) {
          const safeTitle = promoUtils.escapeHtml(b.title);
          const disclaimer = b.terms
            ? `<p class="promo-disclaimer">${promoUtils.escapeHtml(b.terms).replace(/\n/g, "<br>")}</p>`
            : "";
          const targetAttrs = b.external
            ? ' target="_blank" rel="noopener noreferrer"'
            : "";

          $standardCont.append(
            `<a href="${promoUtils.escapeHtml(b.href)}" title="${safeTitle}"${targetAttrs}>
                                <picture>
                                    <source media="(max-width: 768px)" srcset="${b.url}">
                                    <source media="(min-width: 768px)" srcset="${b.url}">
                                    <img src="${b.url}" alt="${safeTitle}" loading="lazy">
                                </picture>
                                ${disclaimer}
                            </a>`,
          );
        });
      }
    }

    // RENDER SWIPER CAROUSEL (.promoSwiper) ---
    const $swiperWrapper = $(".promoSwiper .swiper-wrapper");
    if ($swiperWrapper.length) {
      $swiperWrapper.empty(); // Clear out the placeholder HTML you pasted

      banners.forEach(function (b) {
        const safeTitle = promoUtils.escapeHtml(b.title);
        const disclaimer = b.terms
          ? `<p class="promo-disclaimer">${promoUtils.escapeHtml(b.terms).replace(/\n/g, "<br>")}</p>`
          : "";
        const targetAttrs = b.external
          ? ' target="_blank" rel="noopener noreferrer"'
          : "";

        $swiperWrapper.append(
          `<div class="swiper-slide">
                            <a href="${promoUtils.escapeHtml(b.href)}" title="${safeTitle}"${targetAttrs}>
                                <picture>
                                    <source media="(max-width: 768px)" srcset="${b.url}">
                                    <source media="(min-width: 768px)" srcset="${b.url}">
                                    <img src="${b.url}" alt="${safeTitle}" loading="lazy">
                                </picture>
                            </a>
                        </div>`,
        );
      });
    }
  }

  // Initializes Swiper after the HTML is successfully generated
  function initSwiper() {
    if (typeof Swiper !== "undefined" && $(".promoSwiper").length) {
      new Swiper(".promoSwiper", {
        loop: true,
        pagination: {
          el: ".swiper-pagination",
          dynamicBullets: true,
        },
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
      });
    }
  }

  // On load: fetch the sheet, process rows, inject HTML to both areas, then start Swiper
  $(function () {
    if (typeof Papa === "undefined") {
      console.error("PapaParse not loaded — falling back to static promotion.");
      initSwiper();
      return;
    }

    Papa.parse(PROMO_CONFIG.csvUrl, {
      download: true,
      header: false,
      skipEmptyLines: true,
      complete: function (results) {
        let matching = getMatchingPromotions(results.data || []);

        // Sort ascending by Carousel position
        matching.sort(function (a, b) {
          const posA = parseInt(a["Carousel position"], 10) || 999;
          const posB = parseInt(b["Carousel position"], 10) || 999;
          return posA - posB;
        });

        renderPromotions(matching);

        initSwiper();
      },
      error: function (err) {
        console.error("Error loading promotions from Google Sheets:", err);
        initSwiper();
      },
    });
  });
})(jQuery);
