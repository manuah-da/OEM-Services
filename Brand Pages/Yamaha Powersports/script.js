/* YAMAHA POWERSPORTS PAGE SCRIPT
 * Contains this page's own UI behavior and promotion automation.
 * External dependencies: jQuery, PapaParse and Swiper.
 */

/* ==========================================================================
   YAMAHA POWERSPORTS: PAGE BEHAVIOR 1
   ========================================================================== */
/* SWIPER CONFIGURATION */
    jQuery(document).ready(function () {
        const heroSwiper = new Swiper('.hero-swiper', {
            loop: true,
            effect: 'fade',
            fadeEffect: {
                crossFade: true
            },
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
            },
            pagination: false,
        });
        /* 
        const secondHero = new Swiper('.second-hero-swiper', {
            loop: true,
            effect: 'fade',
            fadeEffect: {
                crossFade: true
            },
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
        }); */
    });

/* ==========================================================================
   YAMAHA POWERSPORTS: PAGE BEHAVIOR 2
   ========================================================================== */
/* Changes to featured inventory swiper */
    jQuery(function () {
        setTimeout(function () {
            jQuery('.view-button').text('Explore');
            jQuery("#manage-inventory-featured-slider button:nth-of-type(1)")
                .empty()
                .append('<i class="fas fa-chevron-right"></i>');
            jQuery("#manage-inventory-featured-slider button:nth-of-type(2)")
                .empty()
                .append('<i class="fas fa-chevron-right"></i>');

        }, 100);
        jQuery(".price-container .price").each(function () {
            var el = jQuery(this);
            var text = el.text();

            text = text.replace(/our price\s*/i, "").trim();

            var match = text.match(/\$[\d,]+(\.\d+)?/);

            if (match) {
                var amount = match[0];

                if (!amount.includes(".")) {
                    var updatedAmount = amount + ".00";
                    text = text.replace(amount, updatedAmount);
                }
            }

            el.text(text);
        });
    });

/* ==========================================================================
   YAMAHA POWERSPORTS: PAGE BEHAVIOR 3
   ========================================================================== */
/* CUSTOM SEARCH BAR */
    jQuery(document).ready(function () {

        // ==========================================
        // CUSTOM SEARCH DROPDOWNS & AJAX FORM 
        // ==========================================
        jQuery('.select-item__cont-selected').on('click', function (e) {
            e.stopPropagation();
            var currentContainer = jQuery(this).closest('.select-item__cont');
            jQuery('.select-item__cont').not(currentContainer).removeClass('expanded');
            currentContainer.toggleClass('expanded');
        });

        jQuery(document).on('click', function () {
            jQuery('.select-item__cont').removeClass('expanded');
        });

        jQuery('.select-item__cont-options').on('click', function (e) {
            e.stopPropagation();
        });

        jQuery('.form-row').on('change', 'input[type="radio"]', function () {
            var selectedText = jQuery(this).parent().text().trim();
            var container = jQuery(this).closest('.select-item__cont');
            container.find('.select-item__cont-selected span').text(selectedText);
            container.removeClass('expanded');
        });

        jQuery(".form-row").submit(function (e) {
            e.preventDefault();

            var searchText = jQuery('input[name="sortSearch"]').val().trim();
            var selectedModel = jQuery('input[name="sortModels"]:checked').val();
            var selectedMake = jQuery('input[name="sortMake"]:checked').val();
            var defaultVal = "All Inventory";

            var makeMap = { "TRITON BOATS": "Triton+Boats" };

            var searchurl = "/inventory/?";

            if (searchText) {
                searchurl += "post_type=wpp_manage_inventory&s=" + encodeURIComponent(searchText) + "&";
            }

            if (selectedModel && selectedModel !== defaultVal) {
                searchurl += "category=" + encodeURIComponent(selectedModel) + "&";
            }

            if (selectedMake && selectedMake !== defaultVal) {
                var formatBrand = makeMap[selectedMake] || encodeURIComponent(selectedMake);
                searchurl += "make=" + formatBrand + "&";
            }

            if (searchurl.endsWith('&') || searchurl.endsWith('?')) {
                searchurl = searchurl.slice(0, -1);
            }

            window.location.href = searchurl;
        });

        jQuery.ajax({
            url: '/inventory',
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
                    }

                    if (targetID) {
                        jQuery(targetID + ' .select-item__cont-options label').not(':first').remove();

                        jQuery(this).parent().parent().find("ul.inventory-filter-box .filter-checkbox-content label").each(function () {
                            var itemText = jQuery(this).text().trim();
                            if (itemText) {
                                var newInput = jQuery('<input>', {
                                    type: "radio",
                                    name: inputName,
                                    value: itemText
                                });
                                var newLabel = jQuery('<label>').append(newInput).append(" " + itemText);
                                jQuery(targetID + ' .select-item__cont-options').append(newLabel);
                            }
                        });
                    }
                });
            },
            error: function (error) {
                console.log("Error loading dynamic filters:", error.statusText);
            }
        });

    });

/* ==========================================================================
   YAMAHA POWERSPORTS: PAGE BEHAVIOR 4
   ========================================================================== */
jQuery(document).ready(function () {
        jQuery(".more-info").on("click", function () {
            var message = jQuery(".content-message");

            if (message.css("opacity") == 1) {
                message.css("opacity", 0);
            } else {
                message.css("opacity", 1);
            }
        });

        jQuery(".cta-reset").on("click", function () {

            jQuery("#input-search input[name='sortSearch']").val("");
            jQuery("#select-models input[type='radio']").prop("checked", false);
            jQuery("#select-models input[type='radio']").first().prop("checked", true);
            jQuery("#select-models .select-item__cont-selected span").text("Select Category");

        });
        let flag = true;

        jQuery(".hamburger-menu").on("click", function () {
            var menu = jQuery(".foldable-menu");
            console.log(flag)
            if (flag) {
                flag = !flag;
                menu.css("max-height", "100vh");
                menu.css("padding-top", "40px");
                console.log("100vh")
            } else {
                flag = !flag;
                menu.css("max-height", "0vh");
                menu.css("padding-top", "0px");
                console.log("0vh");
            }
        });

        function checkWidthAndTogglePhotos() {
            var screenWidth = jQuery(window).width();

            if (screenWidth < 992) {
                jQuery('.big-photo').hide();
                jQuery('.small-photo').show();
            } else {
                jQuery('.big-photo').show();
                jQuery('.small-photo').hide();
            }
        }

        checkWidthAndTogglePhotos();

        jQuery(window).resize(function () {
            checkWidthAndTogglePhotos();
        });
    });

/* ==========================================================================\n   YAMAHA POWERSPORTS: OEM PROMOTIONS AUTOMATION\n   ========================================================================== */
(function ($) {

        // Per-page settings — change `oem` and `inventoryLink` to reuse on another OEM page.
        const PROMO_CONFIG = {
            csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQxeKAIyWFGRAoXqXW9TG5KNkwkfTuQi2CJNFNVwtFMNyn5CVJjIfnC_2R0McOMEE-xZELk5WBSeEcQ/pub?gid=0&single=true&output=csv',
            oem: 'Yamaha Powersports', // must match the OEM column in the sheet
            inventoryLink: '/inventory/?make=Polaris&category=Powersports&condition=New',
            defaultRegion: 'USA'
        };

        // Added 10092026: Resolve Region from the customer catalog and filter this OEM's Active promotions.
        const PROMOTION_COLUMN_COUNT = 15;
        const CUSTOMER_START_ROW = 2;
        const CUSTOMER_DOMAIN_COLUMN = 32;
        const CUSTOMER_REGION_COLUMN = 34;

        const promoUtils = {
            splitImageLinks: function (value) {
                if (!value) return [];
                return value.toString().split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
            },
            getDrivePreviewUrl: function (url) {
                if (!url || !url.includes('drive.google.com')) return url;
                const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
                return match ? `https://lh3.googleusercontent.com/d/${match[1]}=w800` : url;
            },
            escapeHtml: function (str) {
                return (str == null ? '' : String(str))
                    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;');
            },
            normalizeDomain: function (value) {
                const raw = (value == null ? '' : String(value)).trim().toLowerCase();
                if (!raw || raw === '*') return raw;
                try { return new URL(raw.includes('://') ? raw : `https://${raw}`).hostname.replace(/^www\./, ''); }
                catch (e) { return raw.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].trim(); }
            },
            parseHrefs: function (value) {
                if (!value) return [];
                if (Array.isArray(value)) {
                    return value.map(function (item) {
                        if (typeof item === 'string') {
                            const href = item.trim();
                            return href ? { domain: '*', href: href } : null;
                        }
                        const href = (item.href || item.Href || '').toString().trim();
                        const domain = promoUtils.normalizeDomain(item.domain || item.Domain || '*');
                        return href ? { domain: domain, href: href } : null;
                    }).filter(Boolean);
                }
                try { return promoUtils.parseHrefs(JSON.parse(value)); } catch (e) { return []; }
            },
            isAbsoluteUrl: function (href) { return /^[a-z][a-z0-9+.-]*:\/\//i.test(href); },
            resolvePromoHref: function (promo) {
                const currentDomain = promoUtils.normalizeDomain(window.location.hostname);
                const hrefs = promoUtils.parseHrefs(promo.Hrefs || promo.hrefs || promo.HREFS || promo.Href || promo.href);
                const matched = hrefs.find(function (item) { return item.domain === currentDomain; });
                const wildcard = hrefs.find(function (item) { return item.domain === '*'; });
                const selected = matched || wildcard;
                const selectedHref = selected ? selected.href : '';
                const rawHref = (selectedHref || PROMO_CONFIG.inventoryLink).trim();
                const result = { href: rawHref, external: false };
                if (!rawHref || !promoUtils.isAbsoluteUrl(rawHref)) return result;
                try {
                    const url = new URL(rawHref);
                    if (promoUtils.normalizeDomain(url.hostname) === currentDomain) result.href = `${url.pathname}${url.search}${url.hash}`;
                    else result.external = true;
                } catch (e) { result.href = rawHref; }
                return result;
            }
        };

        function getMatchingPromotions(rows) {
            const headers = (rows[0] || []).slice(0, PROMOTION_COLUMN_COUNT);
            const currentDomain = promoUtils.normalizeDomain(window.location.hostname);
            const customerRow = rows.slice(CUSTOMER_START_ROW).find(function (row) {
                return promoUtils.normalizeDomain(row[CUSTOMER_DOMAIN_COLUMN]) === currentDomain;
            });
            const customerRegion = String(
                customerRow ? customerRow[CUSTOMER_REGION_COLUMN] : ''
            ).trim().toUpperCase() || PROMO_CONFIG.defaultRegion;
            const targetOem = PROMO_CONFIG.oem.trim().toLowerCase();

            return rows.slice(1).map(function (row) {
                return headers.reduce(function (promotion, header, index) {
                    const key = String(header || '').trim();
                    if (key) promotion[key] = row[index] == null ? '' : row[index];
                    return promotion;
                }, {});
            }).filter(function (promotion) {
                const oem = String(promotion.OEM || '').trim().toLowerCase();
                const status = String(promotion.Status || '').trim().toLowerCase();
                const region = String(promotion.Region || '').trim().toUpperCase();
                return oem === targetOem && status === 'active' &&
                    (region === customerRegion || region === 'ALL');
            });
        }

        // Builds the actual HTML for BOTH the original banners and the new swiper
        function renderPromotions(promos) {
            const banners = [];
            promos.forEach(function (promo) {
                const images = [
                    ...promoUtils.splitImageLinks(promo.Image),
                    ...promoUtils.splitImageLinks(promo['Image 2'])
                ];
                const rawUrl = images[0];
                if (!rawUrl) return;

                const url = promoUtils.getDrivePreviewUrl(rawUrl);
                if (!url) return;

                const title = (promo.Title || 'Polaris Snowmobile Promotion').toString();
                const terms = (promo['Terms & Conditions'] || '').toString().trim();
                const promoHref = promoUtils.resolvePromoHref(promo);
                banners.push({ url: url, title: title, terms: terms, href: promoHref.href, external: promoHref.external });
            });

            if (!banners.length) return;

            //  RENDER PROMOTIONS (#promotionsCont) ---
            const $standardCont = $('#promotionsCont');
            if ($standardCont.length) {
                $standardCont.find('.promo-fallback').remove();

                // Only inject if this container IS NOT the wrapper for the swiper itself
                if ($standardCont.find('.swiper-wrapper').length === 0) {
                    banners.forEach(function (b) {
                        const safeTitle = promoUtils.escapeHtml(b.title);
                        const disclaimer = b.terms
                            ? `<p class="promo-disclaimer">${promoUtils.escapeHtml(b.terms).replace(/\n/g, '<br>')}</p>`
                            : '';
                        const targetAttrs = b.external ? ' target="_blank" rel="noopener noreferrer"' : '';

                        $standardCont.append(
                            `<a href="${promoUtils.escapeHtml(b.href)}" title="${safeTitle}"${targetAttrs}>
                                <picture>
                                    <source media="(max-width: 768px)" srcset="${b.url}">
                                    <source media="(min-width: 768px)" srcset="${b.url}">
                                    <img src="${b.url}" alt="${safeTitle}" loading="lazy">
                                </picture>
                                ${disclaimer}
                            </a>`
                        );
                    });
                }
            }

            // RENDER SWIPER CAROUSEL (.promoSwiper) ---
            const $swiperWrapper = $('.promoSwiper .swiper-wrapper');
            if ($swiperWrapper.length) {
                $swiperWrapper.empty(); // Clear out the placeholder HTML you pasted

                banners.forEach(function (b) {
                    const safeTitle = promoUtils.escapeHtml(b.title);
                    const disclaimer = b.terms
                        ? `${promoUtils.escapeHtml(b.terms).replace(/\n/g, '<br>')}`
                        : '';
                    const targetAttrs = b.external ? ' target="_blank" rel="noopener noreferrer"' : '';

                    $swiperWrapper.append(
                        `<div class="swiper-slide">
                            <a href="${promoUtils.escapeHtml(b.href)}" title="${safeTitle}"${targetAttrs}>
                                <picture>
                                    <source media="(max-width: 768px)" srcset="${b.url}">
                                    <source media="(min-width: 768px)" srcset="${b.url}">
                                    <img src="${b.url}" alt="${safeTitle}" loading="lazy">
                                </picture>
                            </a>
                            <div class="content-message">
                                <p>
                                    ${disclaimer}
                                </p>
                            </div>
                        </div>`
                    );
                });
            }
        }

        // Initializes Swiper after the HTML is successfully generated
        function initSwiper() {
            if (typeof Swiper !== 'undefined' && $('.promoSwiper').length) {
                new Swiper(".promoSwiper", {
                    loop: true,
                    effect: 'fade',
                    fadeEffect: {
                        crossFade: true
                    },
                    autoplay: {
                        delay: 8000,
                        disableOnInteraction: false,
                    },
                    pagination: {
                        el: '.swiper-pagination',
                        clickable: true,
                    },
                });
            }
        }

        // On load: fetch the sheet, process rows, inject HTML to both areas, then start Swiper
        $(function () {
            if (typeof Papa === 'undefined') {
                console.error('PapaParse not loaded — falling back to static promotion.');
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
                        const posA = parseInt(a['Carousel position'], 10) || 999;
                        const posB = parseInt(b['Carousel position'], 10) || 999;
                        return posA - posB;
                    });

                    renderPromotions(matching);

                    initSwiper();
                },
                error: function (err) {
                    console.error('Error loading promotions from Google Sheets:', err);
                    initSwiper();
                }
            });
        });
    })(jQuery);
