/* CFMOTO PAGE SCRIPT
 * Contains this page's own UI behavior and promotion automation.
 * External dependencies: jQuery, PapaParse and Swiper.
 */

/* ==========================================================================
   CFMOTO: PAGE BEHAVIOR 1
   ========================================================================== */
jQuery(function ($) {
        /* ==========================================================================
           HEADER: STICKY STATE
           ========================================================================== */
        var $header = $('.cfmoto-header').first();
        var $headerInner = $header.find('.cfmoto-header__inner');
        var $searchToggle = $header.find('.cfmoto-header__search-toggle');
        var $searchPanel = $header.find('.cfmoto-header__search-panel');
        var $searchInput = $header.find('.cfmoto-header__search-input');
        var $searchBackdrop = $('.cfmoto-search-backdrop');
        var headerHeight = $headerInner.outerHeight() || 0;
        var headerScrollFrame = null;

        // Fix the header only after scrolling beyond its own height.
        function updateHeaderPosition() {
            var shouldFixHeader = $(window).scrollTop() > headerHeight;

            $header.toggleClass('is-fixed', shouldFixHeader);
            headerScrollFrame = null;
        }

        // Limit header updates to one calculation per animation frame.
        $(window).on('scroll.cfmotoHeader', function () {
            if (headerScrollFrame !== null) {
                return;
            }

            headerScrollFrame = window.requestAnimationFrame(updateHeaderPosition);
        });

        // Recalculate the threshold when the responsive header changes size.
        $(window).on('resize.cfmotoHeader', function () {
            headerHeight = $headerInner.outerHeight() || 0;
            updateHeaderPosition();
        });

        updateHeaderPosition();

        /* ==========================================================================
           HEADER: SEARCH PANEL
           ========================================================================== */

        // Close the search panel and restore the page.
        function closeHeaderSearch(restoreFocus) {
            $searchPanel.stop(true, true).slideUp(240, function () {
                $(this).prop('hidden', true);
            });

            $searchBackdrop.stop(true, true).fadeOut(200, function () {
                $(this).prop('hidden', true);
            });

            $header.removeClass('is-search-open');
            $searchToggle.attr('aria-expanded', 'false');

            if (restoreFocus) {
                $searchToggle.trigger('focus');
            }
        }

        // Toggle the search panel from the header icon.
        $searchToggle.on('click', function () {
            var isOpen = $searchToggle.attr('aria-expanded') === 'true';

            if (isOpen) {
                closeHeaderSearch(false);
                return;
            }

            $header.addClass('is-search-open');
            $searchToggle.attr('aria-expanded', 'true');

            $searchBackdrop
                .prop('hidden', false)
                .hide()
                .fadeIn(200);

            $searchPanel
                .prop('hidden', false)
                .hide()
                .slideDown(280, function () {
                    $searchInput.trigger('focus');
                });
        });

        // Close search from the backdrop or Escape key.
        $searchBackdrop.on('click', function () {
            closeHeaderSearch(true);
        });

        $(document).on('keydown.cfmotoSearch', function (event) {
            if (event.key === 'Escape' && $searchToggle.attr('aria-expanded') === 'true') {
                closeHeaderSearch(true);
            }
        });

        /* ==========================================================================
           NAVIGATION: SMOOTH SCROLL
           ========================================================================== */

        // Smoothly move navbar links to their sections without hiding them under the fixed header.
        $('.cfmoto-header__nav-link').on('click', function (event) {
            var targetSelector = $(this).attr('href');
            var $target = $(targetSelector);

            if (!$target.length) {
                return;
            }

            event.preventDefault();

            if ($searchToggle.attr('aria-expanded') === 'true') {
                closeHeaderSearch(false);
            }

            var headerOffset = $headerInner.outerHeight() || 0;
            var targetPosition = Math.max(0, $target.offset().top - headerOffset);

            $('html, body')
                .stop(true)
                .animate({
                    scrollTop: targetPosition
                }, 650);
        });

        /* ==========================================================================
           INVENTORY: CATEGORY TABS
           ========================================================================== */

        var $inventoryTabs = $('.cfmoto-current-inv__type-link');
        var $inventoryPanels = $('.cfmoto-current-inv__units');
        var inventoryFadeDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 260;

        function showInventory($selectedTab) {
            var targetSelector = $selectedTab.data('inventory-target');
            var $selectedPanel = $inventoryPanels.filter(targetSelector);
            var isAlreadyActive = $selectedTab.hasClass('is-active');

            if (!$selectedPanel.length) {
                return;
            }

            $inventoryTabs
                .removeClass('is-active')
                .attr('aria-selected', 'false');

            $selectedTab
                .addClass('is-active')
                .attr('aria-selected', 'true');

            $inventoryPanels
                .stop(true, true)
                .removeClass('is-active')
                .prop('hidden', true)
                .hide();

            $selectedPanel
                .addClass('is-active')
                .prop('hidden', false);

            if (isAlreadyActive) {
                $selectedPanel.show();
                return;
            }

            $selectedPanel
                .hide()
                .fadeIn(inventoryFadeDuration, function () {
                    $(this).css('display', '');
                });
        }

        // Change inventory categories using local jQuery state.
        $inventoryTabs.on('click', function (event) {
            event.preventDefault();
            showInventory($(this));
        });

        // Synchronize the initial card and inventory panel.
        showInventory($inventoryTabs.filter('.is-active').first());

        /* Promotion automation is maintained in ./script.js. */

        /* ==========================================================================
           MODEL LINEUP: CATEGORY SWIPERS
           ========================================================================== */

        // Cache the lineup elements used by every category.
        var $lineup = $('.cfmoto-model-lineup');
        if (!$lineup.length) {
            return;
        }

        var $groups = $lineup.find('.cfmoto-model-lineup__group');
        var swipers = {};

        // Keep the model controls synchronized with the active slide.
        function updateControls($controls, activeIndex) {
            $controls.each(function (index) {
                $(this)
                    .toggleClass('is-active', index === activeIndex)
                    .attr('aria-current', index === activeIndex ? 'true' : 'false');
            });
        }

        // Create one independent Swiper for each model category.
        $groups.each(function () {
            var $group = $(this);
            var groupName = this.id.replace('-slides', '');
            var $swiper = $group.find('.cfmoto-model-lineup__wrapper');
            var $controls = $group.find('.cfmoto-model-lineup__controls li');
            var $previousButton = $group.find('.cfmoto-model-lineup__arrow--prev');
            var $nextButton = $group.find('.cfmoto-model-lineup__arrow--next');
            var initialSlide = $controls.filter('.is-active').first().index();

            if (!$swiper.length || !$controls.length) {
                return;
            }

            initialSlide = initialSlide < 0 ? 0 : initialSlide;
            $controls.attr({
                role: 'button',
                tabindex: '0'
            });

            var swiper = new Swiper($swiper[0], {
                slidesPerView: 1,
                initialSlide: initialSlide,
                observer: true,
                observeParents: true,
                navigation: {
                    prevEl: $previousButton[0],
                    nextEl: $nextButton[0]
                }
            });

            $controls.on('click keydown', function (event) {
                var isKeyboardAction = event.type === 'keydown';
                var validKey = event.key === 'Enter' || event.key === ' ';

                if (isKeyboardAction) {
                    if (!validKey) {
                        return;
                    }
                }

                event.preventDefault();
                swiper.slideTo($(this).index());
            });

            swiper.on('slideChange', function () {
                updateControls($controls, swiper.activeIndex);
            });

            updateControls($controls, swiper.activeIndex);
            swipers[groupName] = swiper;
        });

        // Show the requested category and update both navigation controls.
        function showModelGroup(groupName) {
            var $selectedGroup = $lineup.find('#' + groupName + '-slides');
            if (!$selectedGroup.length) {
                return;
            }

            $groups.prop('hidden', true);
            $selectedGroup.prop('hidden', false);

            $lineup.find('.cfmoto-model-lineup__category-button').each(function () {
                var isActive = $(this).data('category') === groupName;

                $(this)
                    .attr('aria-pressed', isActive ? 'true' : 'false')
                    .closest('.cfmoto-model-lineup__category')
                    .toggleClass('is-active', isActive);
            });

            $lineup.find('.cfmoto-model-lineup__select').val(groupName);

            if (swipers[groupName]) {
                swipers[groupName].update();
            }
        }

        // Change categories from the image buttons.
        $lineup.find('.cfmoto-model-lineup__category-button').on('click', function () {
            showModelGroup($(this).data('category'));
        });

        // Change categories from the select.
        $lineup.find('.cfmoto-model-lineup__select').on('change', function () {
            showModelGroup(this.value);
        });

        // Display CFORCE when the lineup first loads.
        showModelGroup('cforce');
    });

/* ==========================================================================\n   CFMOTO: OEM PROMOTIONS AUTOMATION\n   ========================================================================== */
jQuery(function ($) {
        /* ==========================================================================
           PROMOTIONS: SPREADSHEET DATA AND SWIPER
           ========================================================================== */

        var promotionConfig = {
            csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQxeKAIyWFGRAoXqXW9TG5KNkwkfTuQi2CJNFNVwtFMNyn5CVJjIfnC_2R0McOMEE-xZELk5WBSeEcQ/pub?gid=0&single=true&output=csv',
            oem: 'CFMoto',
            inventoryLink: '/inventory'
        };
        var $promotionSection = $('.cfmoto-current-promotions');
        var $promotionSlider = $('.cfmoto-current-promotions__slider');
        var $promotionWrapper = $promotionSlider.find('.swiper-wrapper');
        var promotionSwiper = null;

        // Escape spreadsheet text before inserting it into the page.
        function escapePromoHtml(value) {
            return String(value == null ? '' : value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        // Match OEM labels even if their spacing or capitalization differs.
        function normalizePromoOem(value) {
            return String(value == null ? '' : value)
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '');
        }

        // Normalize domains so exact website overrides can be compared safely.
        function normalizePromoDomain(value) {
            var raw = String(value == null ? '' : value).trim().toLowerCase();

            if (!raw || raw === '*') {
                return raw;
            }

            try {
                return new URL(raw.indexOf('://') > -1 ? raw : 'https://' + raw)
                    .hostname
                    .replace(/^www\./, '');
            } catch (error) {
                return raw
                    .replace(/^https?:\/\//, '')
                    .replace(/^www\./, '')
                    .split('/')[0]
                    .trim();
            }
        }

        // Read the domain-specific and wildcard links saved by the dashboard.
        function parsePromoHrefs(value) {
            var parsed;

            if (!value) {
                return [];
            }

            if (Array.isArray(value)) {
                parsed = value;
            } else {
                try {
                    parsed = JSON.parse(value);
                } catch (error) {
                    return [];
                }
            }

            if (!Array.isArray(parsed)) {
                return [];
            }

            return parsed.map(function (item) {
                if (!item) {
                    return {
                        domain: '',
                        href: ''
                    };
                }

                if (typeof item === 'string') {
                    return {
                        domain: '*',
                        href: item.trim()
                    };
                }

                return {
                    domain: normalizePromoDomain(item.domain || item.Domain || '*'),
                    href: String(item.href || item.Href || '').trim()
                };
            }).filter(function (item) {
                return Boolean(item.href);
            });
        }

        // Use an exact domain override first, then the wildcard, then inventory.
        function resolvePromoHref(promo) {
            var currentDomain = normalizePromoDomain(window.location.hostname);
            var hrefs = parsePromoHrefs(
                promo.Hrefs || promo.hrefs || promo.HREFS || promo.Href || promo.href
            );
            var exactMatch = hrefs.filter(function (item) {
                return item.domain === currentDomain;
            })[0];
            var wildcardMatch = hrefs.filter(function (item) {
                return item.domain === '*';
            })[0];
            var selected = exactMatch || wildcardMatch;
            var href = selected ? selected.href : promotionConfig.inventoryLink;
            var isExternal = false;

            if (/^[a-z][a-z0-9+.-]*:\/\//i.test(href)) {
                try {
                    var url = new URL(href);

                    if (normalizePromoDomain(url.hostname) === currentDomain) {
                        href = url.pathname + url.search + url.hash;
                    } else {
                        isExternal = true;
                    }
                } catch (error) {
                    isExternal = false;
                }
            }

            return {
                href: href,
                external: isExternal
            };
        }

        // Convert shared Google Drive URLs into image-ready URLs.
        function getPromoImageUrl(value) {
            var url = String(value || '').split(/[\n,;]+/)[0].trim();
            var driveMatch;

            if (!url || url.indexOf('drive.google.com') === -1) {
                return url;
            }

            driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
            return driveMatch
                ? 'https://lh3.googleusercontent.com/d/' + driveMatch[1] + '=w1600'
                : url;
        }

        // Build the overlay only with fields that contain spreadsheet content.
        function createPromoOverlay(content, terms) {
            var sections = [];

            if (content) {
                sections.push(
                    '<div class="cfmoto-current-promotions__content">' +
                    '<h3>Content</h3>' +
                    '<p>' + escapePromoHtml(content).replace(/\r?\n/g, '<br>') + '</p>' +
                    '</div>'
                );
            }

            if (terms) {
                sections.push(
                    '<div class="cfmoto-current-promotions__terms">' +
                    '<h3>Terms and Conditions</h3>' +
                    '<p>' + escapePromoHtml(terms).replace(/\r?\n/g, '<br>') + '</p>' +
                    '</div>'
                );
            }

            if (!sections.length) {
                return '';
            }

            return '<div class="cfmoto-current-promotions__overlay">' +
                '<div class="cfmoto-current-promotions__overlay-inner">' +
                sections.join('') +
                '</div>' +
                '</div>';
        }

        // Create the promotions carousel after its dynamic slides are ready.
        function initializePromotionSwiper() {
            if (!$promotionSlider.length || typeof Swiper === 'undefined') {
                return;
            }

            if (promotionSwiper) {
                promotionSwiper.destroy(true, true);
            }

            var promotionSlideCount = $promotionSlider.find('.swiper-slide').length;

            promotionSwiper = new Swiper($promotionSlider[0], {
                slidesPerView: 1,
                spaceBetween: 0,
                speed: 650,
                loop: promotionSlideCount > 1,
                autoplay: promotionSlideCount > 1 ? {
                    delay: 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true
                } : false,
                pagination: {
                    el: $promotionSlider.find('.cfmoto-current-promotions__pagination')[0],
                    clickable: true
                }
            });
        }

        // Render active promotions and reveal the section only when data exists.
        function renderPromotions(promotions) {
            var slideMarkup = [];

            promotions.forEach(function (promo) {
                // Image 2 is the dashboard's banner; Image is its fallback.
                var imageUrl = getPromoImageUrl(promo['Image 2']) || getPromoImageUrl(promo.Image);
                var title = String(promo.Title || 'CFMOTO Promotion').trim();
                var content = String(promo.Content || '').trim();
                var terms = String(promo['Terms & Conditions'] || '').trim();
                var resolvedHref;
                var targetAttributes;

                if (!imageUrl) {
                    return;
                }

                resolvedHref = resolvePromoHref(promo);
                targetAttributes = resolvedHref.external
                    ? ' target="_blank" rel="noopener noreferrer"'
                    : '';

                slideMarkup.push(
                    '<div class="cfmoto-current-promotions__slide swiper-slide">' +
                    '<a class="cfmoto-current-promotions__link" href="' +
                    escapePromoHtml(resolvedHref.href) + '" title="' +
                    escapePromoHtml(title) + '"' + targetAttributes + '>' +
                    '<img class="cfmoto-current-promotions__image" src="' +
                    escapePromoHtml(imageUrl) + '" alt="' +
                    escapePromoHtml(title) + '" loading="lazy">' +
                    '</a>' +
                    createPromoOverlay(content, terms) +
                    '</div>'
                );
            });

            $promotionWrapper.empty().append(slideMarkup.join(''));

            if (!slideMarkup.length) {
                $promotionSection.stop(true, true).hide().prop('hidden', true);
                return;
            }

            $promotionSection
                .prop('hidden', false)
                .stop(true, true)
                .fadeIn(240);

            initializePromotionSwiper();
        }

        // Load, filter and order the CFMOTO promotions from the public sheet.
        function loadPromotions() {
            if (!$promotionSlider.length) {
                return;
            }

            if (typeof Papa === 'undefined') {
                console.error('PapaParse is required to load CFMOTO promotions.');
                $promotionSection.hide().prop('hidden', true);
                return;
            }

            Papa.parse(promotionConfig.csvUrl, {
                download: true,
                header: true,
                skipEmptyLines: true,
                complete: function (results) {
                    var targetOem = normalizePromoOem(promotionConfig.oem);
                    var promotions = (results.data || []).filter(function (row) {
                        var status = String(row.Status || '').trim().toLowerCase();

                        return normalizePromoOem(row.OEM) === targetOem && status === 'active';
                    });

                    promotions.sort(function (firstPromo, secondPromo) {
                        var firstPosition = parseInt(firstPromo['Carousel position'], 10);
                        var secondPosition = parseInt(secondPromo['Carousel position'], 10);

                        firstPosition = isNaN(firstPosition) ? 999 : firstPosition;
                        secondPosition = isNaN(secondPosition) ? 999 : secondPosition;

                        return firstPosition - secondPosition;
                    });

                    renderPromotions(promotions);
                },
                error: function (error) {
                    console.error('Unable to load CFMOTO promotions:', error);
                    $promotionSection.hide().prop('hidden', true);
                }
            });
        }

        loadPromotions();
});
