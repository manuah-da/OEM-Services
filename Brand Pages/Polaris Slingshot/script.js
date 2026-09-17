/* POLARIS SLINGSHOT PAGE SCRIPT
 * Contains this page's own UI behavior and promotion automation.
 * External dependencies: jQuery, PapaParse and Swiper.
 */

/* ==========================================================================
   POLARIS SLINGSHOT: PAGE BEHAVIOR 1
   ========================================================================== */
jQuery(document).ready(function () {

        const tabsSwiper = new Swiper('.tabsSwiper', {
            spaceBetween: 0,
            freeMode: true,
            grabCursor: false,
            allowTouchMove: false,

            navigation: {
                nextEl: '.tabs-swiper-button-next',
                prevEl: '.tabs-swiper-button-prev',
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
                }
            }
        });

        var swiper = new Swiper('.polaris-row-next .swiper', {
            slidesPerView: 1,
            loop: true,
            allowTouchMove: false,
            navigation: {
                nextEl: '.polaris-row-next .swiper-button-next',
                prevEl: '.polaris-row-next .swiper-button-prev',
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
                renderBullet: function (index, className) {
                    return index < 4 ? `<span class="${className}"></span>` : '';
                }
            },
            breakpoints: {
                320: {
                    slidesPerView: 1
                }
            },
            on: {
                slideChange: function () {
                    let currentIndex = this.realIndex % 4;
                }
            }
        });

    });

/* ==========================================================================
   POLARIS SLINGSHOT: PAGE BEHAVIOR 2
   ========================================================================== */
document.addEventListener("DOMContentLoaded", function () {
        const tabs = document.querySelectorAll(".tabs-row__card");
        const slides = document.querySelectorAll(".slider-cont");

        tabs.forEach(tab => {
            tab.addEventListener("click", function (e) {
                e.preventDefault();

                tabs.forEach(t => t.classList.remove("active"));
                this.classList.add("active");

                const targetId = this.id + "-slide";

                slides.forEach(slide => {
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
   POLARIS SLINGSHOT: PAGE BEHAVIOR 3
   ========================================================================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            const headerHeight = 40;

            const offsetTop = target.offsetTop - headerHeight;

            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        });
    });

/* ==========================================================================
   POLARIS SLINGSHOT: PAGE BEHAVIOR 4
   ========================================================================== */
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
            var selectedUsage = jQuery('input[name="sortUsage"]:checked').val();
            var defaultVal = "All Inventory";

            var searchurl = "/inventory/?";

            if (searchText) {
                searchurl += "s=" + encodeURIComponent(searchText) + "&";
            }

            if (selectedModel && selectedModel !== defaultVal) {
                searchurl += "category=" + encodeURIComponent(selectedModel) + "&";
            }

            searchurl += "make=Polaris&";

            if (selectedUsage && selectedUsage !== defaultVal) {
                searchurl += "condition=" + encodeURIComponent(selectedUsage) + "&";
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
                    } else if (categoryText === "make") {
                        targetID = "#select-make"
                        inputName = "sortMake";
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

        if (window.innerWidth > 768) {
            jQuery('.form-row').addClass('displayed-menu');
        }

        jQuery('p.title.search-inventory-dropdown').on('click', function () {
            if (window.innerWidth < 768) {
                jQuery('.form-row').toggleClass('displayed-menu');
            }
        });

        jQuery(window).on('load resize', function () {
            var windowWidth = jQuery(window).width();
            var targetList = jQuery('ol.flex-control-nav.flex-control-paging');
            if (windowWidth > 1100) {
                if (!targetList.parent().hasClass('custom-nav-container')) {
                    targetList.wrap('<div class="custom-nav-container" style="display: flex; align-items: center; justify-content: center; gap: 15px;"></div>');
                    targetList.before('<span class="promo-text">CURRENT PROMOTIONS</span>');
                    targetList.after('<a href="/inventory" class="cta-inventory">EXPLORE</a>');
                }
            }
            else {
                if (targetList.parent().hasClass('custom-nav-container')) {
                    targetList.siblings('.promo-text, .cta-inventory').remove();
                    targetList.unwrap();
                }
            }
        });

        jQuery('.hamburguer-menu').on('click', function () {
            jQuery(this).find('i').toggleClass('active');
            jQuery('.mobile-dropdown').toggleClass('visible');
        });
    });

/* ==========================================================================
   POLARIS SLINGSHOT: PAGE BEHAVIOR 5
   ========================================================================== */
jQuery(document).ready(function () {

        const productsData = {
            "slingshot-s": {
                "red": {
                    title: "Slingshot S",
                    desc: "Everything you need to make your ride truly yours.",
                    price: "STARTING AT $24,999 MSRP",
                    info: "Trim & Color Options: Slingshot Red (Manual)",
                    image: "/wp-content/uploads/2026/06/SLINGSHOT-S_RED.webp"
                },
                "black": {
                    title: "Slingshot S",
                    desc: "Everything you need to make your ride truly yours.",
                    price: "STARTING AT $24,999 MSRP",
                    info: "Trim & Color Options: Jet Black (Manual)",
                    image: "/wp-content/uploads/2026/06/SLINGSHOT-S_BLACK.webp"
                },
                "red-auto": {
                    title: "Slingshot S",
                    desc: "Everything you need to make your ride truly yours.",
                    price: "STARTING AT $26,849 MSRP",
                    info: "Trim & Color Options: Slingshot Red (AutoDrive)",
                    image: "/wp-content/uploads/2026/06/SLINGSHOT-S_RED.webp"
                },
                "black-auto": {
                    title: "Slingshot S",
                    desc: "Everything you need to make your ride truly yours.",
                    price: "STARTING AT $26,849 MSRP",
                    info: "Trim & Color Options: Jet Black (AutoDrive)",
                    image: "/wp-content/uploads/2026/06/SLINGSHOT-S_BLACK.webp"
                }
            },
            "slingshot-sl": {
                "white": {
                    title: "Slingshot SL",
                    desc: "Enhanced style with the tech to keep you connected.",
                    price: "STARTING AT $28,299 MSRP",
                    info: "Trim & Color Options: White Lightning (Manual)",
                    image: "/wp-content/uploads/2026/06/SLINGSHOT-SL_WHITE.webp"
                },
                "blue": {
                    title: "Slingshot SL",
                    desc: "Enhanced style with the tech to keep you connected.",
                    price: "STARTING AT $28,299 MSRP",
                    info: "Trim & Color Options: Blue Rush (Manual)",
                    image: "/wp-content/uploads/2026/06/SLINGSHOT-SL_BLUE.webp"
                },
                "orange": {
                    title: "Slingshot SL",
                    desc: "Enhanced style with the tech to keep you connected.",
                    price: "STARTING AT $28,798 MSRP",
                    info: "Trim & Color Options: Sunburst Orange (Manual)",
                    image: "/wp-content/uploads/2026/06/SLINGSHOT-SL_ORANGE.webp"
                },
                "white-auto": {
                    title: "Slingshot SL",
                    desc: "Enhanced style with the tech to keep you connected.",
                    price: "STARTING AT $30,149 MSRP",
                    info: "Trim & Color Options: White Lightning (AutoDrive)",
                    image: "/wp-content/uploads/2026/06/SLINGSHOT-SL_WHITE.webp"
                },
                "blue-auto": {
                    title: "Slingshot SL",
                    desc: "Enhanced style with the tech to keep you connected.",
                    price: "STARTING AT $30,149 MSRP",
                    info: "Trim & Color Options: Blue Rush (AutoDrive)",
                    image: "/wp-content/uploads/2026/06/SLINGSHOT-SL_BLUE.webp"
                },
                "orange-auto": {
                    title: "Slingshot SL",
                    desc: "Enhanced style with the tech to keep you connected.",
                    price: "STARTING AT $30,648 MSRP",
                    info: "Trim & Color Options: Sunburst Orange (AutoDrive)",
                    image: "/wp-content/uploads/2026/06/SLINGSHOT-SL_ORANGE.webp"
                }
            },
            "slingshot-slr": {
                "mirage-gray": {
                    title: "Slingshot SLR",
                    desc: "Upgraded performance and added style from the get-go.",
                    price: "STARTING AT $31,399 MSRP",
                    info: "Trim & Color Options: Mirage Gray (Manual)",
                    image: "/wp-content/uploads/2026/06/SLINGSHOT-SLR_MIRAGE-GRAY.webp"
                },
                "blue-rush": {
                    title: "Slingshot SLR",
                    desc: "Upgraded performance and added style from the get-go.",
                    price: "STARTING AT $31,399 MSRP",
                    info: "Trim & Color Options: Blue Rush (Manual)",
                    image: "/wp-content/uploads/2026/06/SLINGSHOT-SLR_BLUE-RUSH.webp"
                },
                "mirage-gray-auto": {
                    title: "Slingshot SLR",
                    desc: "Upgraded performance and added style from the get-go.",
                    price: "STARTING AT $33,249 MSRP",
                    info: "Trim & Color Options: Mirage Gray (AutoDrive)",
                    image: "/wp-content/uploads/2026/06/SLINGSHOT-SLR_MIRAGE-GRAY.webp"
                },
                "blue-rush-auto": {
                    title: "Slingshot SLR",
                    desc: "Upgraded performance and added style from the get-go.",
                    price: "STARTING AT $33,249 MSRP",
                    info: "Trim & Color Options: Blue Rush (AutoDrive)",
                    image: "/wp-content/uploads/2026/06/SLINGSHOT-SLR_BLUE-RUSH.webp"
                }
            },
            "slingshot-r": {
                "midnight-smoke": {
                    title: "Slingshot R",
                    desc: "Top-tier features built for amplified performance and aesthetics.",
                    price: "STARTING AT $34,999 MSRP",
                    info: "Trim & Color Options: Midnight Smoke (Manual)",
                    image: "/wp-content/uploads/2026/06/SLINGSHOT-R_MIDNIGHT-SMOKE.webp"
                },
                "white-crystal": {
                    title: "Slingshot R",
                    desc: "Top-tier features built for amplified performance and aesthetics.",
                    price: "STARTING AT $34,999 MSRP",
                    info: "Trim & Color Options: White Crystal with Mint Fade (Manual)",
                    image: "/wp-content/uploads/2026/06/SLINGSHOT-R_WHITE-CRYSTAL-WITH-MINT-FADE.webp"
                },
                "radiant-gray": {
                    title: "Slingshot R",
                    desc: "Top-tier features built for amplified performance and aesthetics.",
                    price: "STARTING AT $35,498 MSRP",
                    info: "Trim & Color Options: Radiant Gray with Indy Red Pearl (Manual)",
                    image: "/wp-content/uploads/2026/06/SLINGSHOT-R_RADIANT-GRAY-WITH-INDY-RED-PEARL.webp"
                },
                "midnight-smoke-auto": {
                    title: "Slingshot R",
                    desc: "Top-tier features built for amplified performance and aesthetics.",
                    price: "STARTING AT $37,149 MSRP",
                    info: "Trim & Color Options: Midnight Smoke (AutoDrive)",
                    image: "/wp-content/uploads/2026/06/SLINGSHOT-R_MIDNIGHT-SMOKE.webp"
                },
                "white-crystal-auto": {
                    title: "Slingshot R",
                    desc: "Top-tier features built for amplified performance and aesthetics.",
                    price: "STARTING AT $37,149 MSRP",
                    info: "Trim & Color Options: White Crystal with Mint Fade (AutoDrive)",
                    image: "/wp-content/uploads/2026/06/SLINGSHOT-R_WHITE-CRYSTAL-WITH-MINT-FADE.webp"
                },
                "radiant-gray-auto": {
                    title: "Slingshot R",
                    desc: "Top-tier features built for amplified performance and aesthetics.",
                    price: "STARTING AT $37,648 MSRP",
                    info: "Trim & Color Options: Radiant Gray with Indy Red Pearl (AutoDrive)",
                    image: "/wp-content/uploads/2026/06/SLINGSHOT-R_RADIANT-GRAY-WITH-INDY-RED-PEARL.webp"
                }
            },
            "slingshot-signature": {
                "golden-steel": {
                    title: "Slingshot Signature Edition",
                    desc: "Slingshot Signature Edition takes everything that defines the high-performance R model and elevates it to something truly rare. With its premium, color-shifting paint, Stage 3 Max Rockford Fosgate® audio with XKGlow® lighting, exclusive graphics, and Signature Edition branding, it’s built for those who expect more from every mile. With limited quantities made, this is more than a ride — it’s a moment in motion you won’t want to miss.",
                    price: "STARTING AT $36,999 MSRP",
                    info: "Trim & Color Options: Golden Steel with Black Crystal (Manual)",
                    image: "/wp-content/uploads/2026/06/SLINGSHOT-SIGNATURE-EDITION_GOLDEN-STEEL.webp"
                },
                "golden-steel-auto": {
                    title: "Slingshot Signature Edition",
                    desc: "Slingshot Signature Edition takes everything that defines the high-performance R model and elevates it to something truly rare. With its premium, color-shifting paint, Stage 3 Max Rockford Fosgate® audio with XKGlow® lighting, exclusive graphics, and Signature Edition branding, it’s built for those who expect more from every mile. With limited quantities made, this is more than a ride — it’s a moment in motion you won’t want to miss.",
                    price: "STARTING AT $39,149 MSRP",
                    info: "Trim & Color Options: Golden Steel with Black Crystal (AutoDrive)",
                    image: "/wp-content/uploads/2026/06/SLINGSHOT-SIGNATURE-EDITION_GOLDEN-STEEL.webp"
                },
            },
            "slingshot-grand": {
                "viper-black": {
                    title: "Slingshot Grand Touring",
                    desc: "Premium side-by-side touring that doesn’t compromise on comfort or style.",
                    price: "STARTING AT $41,999 MSRP",
                    info: "Trim & Color Options: Viper Black with Green Venom (Manual)",
                    image: "/wp-content/uploads/2026/06/SLINGSHOT-GRAND-TOURING_VIPER-BLACK.webp"
                },
                "viper-black-auto": {
                    title: "Slingshot Grand Touring",
                    desc: "Premium side-by-side touring that doesn’t compromise on comfort or style.",
                    price: "STARTING AT $44,149 MSRP",
                    info: "Trim & Color Options: Viper Black with Green Venom (AutoDrive)",
                    image: "/wp-content/uploads/2026/06/SLINGSHOT-GRAND-TOURING_VIPER-BLACK.webp"
                },
            }
        };

        jQuery('.js-product-card').each(function () {

            const card = jQuery(this);

            const productId = card.attr('data-product-id');

            const imageEl = card.find('.js-product-image');
            const loaderEl = card.find('.js-image-loader');
            const titleEl = card.find('.js-product-title');
            const descEl = card.find('.js-product-desc');
            const priceEl = card.find('.js-product-price');
            const infoEl = card.find('.js-product-info');
            const buttons = card.find('.js-version-selectors button');

            // Reuse the static image directory so each WordPress site's upload month stays correct.
            const staticImageSrc = imageEl.attr('src') || '';
            const lastDirectorySlash = staticImageSrc.lastIndexOf('/');
            const imageDirectory = lastDirectorySlash >= 0
                ? staticImageSrc.slice(0, lastDirectorySlash + 1)
                : '';

            function resolveProductImage(imagePath) {
                const imageFile = String(imagePath || '').split('/').pop();
                return imageDirectory && imageFile
                    ? imageDirectory + imageFile
                    : imagePath;
            }

            imageEl.on('load', function () {
                loaderEl.hide();
                imageEl.removeClass('is-loading');
            });

            buttons.on('click', function () {
                const button = jQuery(this);
                const variantKey = button.attr('data-variant');

                const productVariations = productsData[productId];
                if (!productVariations) return;

                const data = productVariations[variantKey];
                if (!data) return;

                const imageSrc = resolveProductImage(data.image);

                if (imageEl.attr('src') !== imageSrc) {
                    loaderEl.show();
                    imageEl.addClass('is-loading');
                }

                imageEl.attr({
                    'src': imageSrc,
                    'alt': data.title
                });

                titleEl.text(data.title);
                descEl.text(data.desc);
                priceEl.text(data.price);
                infoEl.text(data.info);

                buttons.removeClass('active');
                button.addClass('active');
            });
        });
    });

/* ==========================================================================\n   POLARIS SLINGSHOT: OEM PROMOTIONS AUTOMATION\n   ========================================================================== */
(function ($) {

        // Per-page settings — change `oem` and `inventoryLink` to reuse on another OEM page.
        const PROMO_CONFIG = {
            csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQxeKAIyWFGRAoXqXW9TG5KNkwkfTuQi2CJNFNVwtFMNyn5CVJjIfnC_2R0McOMEE-xZELk5WBSeEcQ/pub?gid=0&single=true&output=csv',
            oem: 'Polaris Slingshot', // must match the OEM column in the sheet
            inventoryLink: '/inventory/?make=Polaris%7CSLINGSHOT&condition=New',
            defaultRegion: 'USA'
        };

        // Added 10092026: Resolve Region from the customer catalog and filter this OEM's Active promotions.
        const PROMOTION_COLUMN_COUNT = 15;
        const CUSTOMER_START_ROW = 2;
        const CUSTOMER_DOMAIN_COLUMN = 32;
        const CUSTOMER_REGION_COLUMN = 34;

        const promoUtils = {
            // Split a cell that may hold several links (newline / comma / semicolon separated)
            splitImageLinks: function (value) {
                if (!value) return [];
                return value.toString().split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
            },
            // Convert a Google Drive share link into a direct image URL (same logic as the dashboard)
            getDrivePreviewUrl: function (url) {
                if (!url || !url.includes('drive.google.com')) return url;
                const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
                return match ? `https://lh3.googleusercontent.com/d/${match[1]}=w800` : url;
            },
            // Escape user/sheet text before injecting it into HTML
            escapeHtml: function (str) {
                return (str == null ? '' : String(str))
                    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;');
            },
            normalizeDomain: function (value) {
                const raw = (value == null ? '' : String(value)).trim().toLowerCase();
                if (!raw || raw === '*') return raw;
                try {
                    return new URL(raw.includes('://') ? raw : `https://${raw}`).hostname.replace(/^www\./, '');
                } catch (e) {
                    return raw.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].trim();
                }
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
                const currentDomain = promoUtils.normalizeDomain(window.location.hostname);
                const hrefs = promoUtils.parseHrefs(
                    promo.Hrefs || promo.hrefs || promo.HREFS || promo.Href || promo.href
                );
                const matched = hrefs.find(function (item) {
                    return item.domain === currentDomain;
                });
                const wildcard = hrefs.find(function (item) {
                    return item.domain === '*';
                });
                const selected = matched || wildcard;
                const selectedHref = selected ? selected.href : '';
                const rawHref = (selectedHref || PROMO_CONFIG.inventoryLink).trim();
                const result = { href: rawHref, external: false };

                if (!rawHref || !promoUtils.isAbsoluteUrl(rawHref)) return result;

                try {
                    const url = new URL(rawHref);
                    if (promoUtils.normalizeDomain(url.hostname) === currentDomain) {
                        result.href = `${url.pathname}${url.search}${url.hash}`;
                    } else {
                        result.external = true;
                    }
                } catch (e) {
                    result.href = rawHref;
                }

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

        // Build and inject one promotion banner per matching sheet row
        function renderPromotions(promos) {
            const $cont = $('#promotionsCont');
            if (!$cont.length) return;

            // One banner per promotion, using the primary image (falls back to Image 2)
            const banners = [];
            promos.forEach(function (promo) {
                const images = [
                    ...promoUtils.splitImageLinks(promo.Image),
                    ...promoUtils.splitImageLinks(promo['Image 2'])
                ];
                const rawUrl = images[0];                 // first non-empty image only
                if (!rawUrl) return;

                const url = promoUtils.getDrivePreviewUrl(rawUrl);
                if (!url) return;

                const title = (promo.Title || 'Polaris Slingshot Promotion').toString();
                const terms = (promo['Terms & Conditions'] || '').toString().trim();
                const promoHref = promoUtils.resolvePromoHref(promo);
                banners.push({
                    url: url,
                    title: title,
                    terms: terms,
                    href: promoHref.href,
                    external: promoHref.external
                });
            });

            if (!banners.length) return;

            // Render each banner; Terms & Conditions become the hover disclaimer overlay
            banners.forEach(function (b) {
                const safeTitle = promoUtils.escapeHtml(b.title);
                const disclaimer = b.terms
                    ? `<p class="promo-disclaimer">${promoUtils.escapeHtml(b.terms).replace(/\n/g, '<br>')}</p>`
                    : '';
                const targetAttrs = b.external ? ' target="_blank" rel="noopener noreferrer"' : '';
                $cont.append(
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


            /* Added code */
            // RENDER SWIPER CAROUSEL (.promoSwiper) ---
            const $swiperWrapper = $('.promoSwiper .swiper-wrapper');
            if ($swiperWrapper.length) {
                $swiperWrapper.empty(); // Clear out the placeholder HTML you pasted

                banners.forEach(function (b) {
                    const safeTitle = promoUtils.escapeHtml(b.title);
                    const disclaimer = b.terms
                        ? `<p class="promo-disclaimer">${promoUtils.escapeHtml(b.terms).replace(/\n/g, '<br>')}</p>`
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
                        </div>`
                    );
                });
            }

        }

        // On load: fetch the sheet, keep only this OEM's Active rows, then render
        $(function () {
            if (typeof Papa === 'undefined') {
                console.error('PapaParse not loaded — promotions cannot be rendered.');
                return;
            }
            Papa.parse(PROMO_CONFIG.csvUrl, {
                download: true,
                header: false,
                skipEmptyLines: true,
                complete: function (results) {
                    const matching = getMatchingPromotions(results.data || []);
                    matching.sort(function (a, b) {
                        const posA = parseInt(a['Carousel position'], 10) || 999;
                        const posB = parseInt(b['Carousel position'], 10) || 999;
                        return posA - posB;
                    });

                    renderPromotions(matching);
                    /* Added code */
                    initSwiper();
                },
                error: function (err) {
                    console.error('Error loading promotions from Google Sheets:', err);
                }
            });
        });

        
        /* Added code */
        // Initializes Swiper after the HTML is successfully generated
        function initSwiper() {
            if (typeof Swiper !== 'undefined' && $('.promoSwiper').length) {
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

    })(jQuery);
