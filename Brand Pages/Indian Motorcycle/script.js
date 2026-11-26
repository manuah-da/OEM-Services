(function () {
    'use strict';

    function start() {
        if (!window.jQuery) {
            console.error('Indian Motorcycle page: WordPress jQuery is required.');
            return;
        }
        window.jQuery(function () { initIndianPage(window.jQuery); });
    }

    if (window.jQuery) start();
    else if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });

    function initIndianPage(jQuery) {
        var page = jQuery('#indian-brand-page');
        if (!page.length || page.data('indian-initialized')) return;
        page.data('indian-initialized', true);

        var dealer = window.indianDealer;
        if (!dealer || !dealer.links || !dealer.images || !dealer.search) {
            page.removeData('indian-initialized');
            console.error('Indian Motorcycle page: define window.indianDealer before loading the bundle.');
            return;
        }
        var heroSwiper = null;
        var familySwiper = null;
        var modelSwipers = {};
        var activeFamily = 'scout';
        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var swiperReady = false;

        function safeUrl(value) {
            if (typeof value !== 'string' || !value.trim()) return '';
            try {
                var parsed = new URL(value, window.location.href);
                return /^(https?:)$/.test(parsed.protocol) ? value.trim() : '';
            } catch (error) { return ''; }
        }

        function setLink(element, url) {
            if (url) element.attr('href', url).removeAttr('aria-disabled tabindex');
            else element.removeAttr('href').attr({ 'aria-disabled': 'true', tabindex: '-1' });
        }

        function applyDealerSettings() {
            var mapQuery = [dealer.street, dealer.cityLine, dealer.country].filter(Boolean).join(', ');
            var directions = safeUrl(dealer.links.directions) || 'https://www.google.com/maps/dir/?api=1\x26destination=' + encodeURIComponent(mapQuery);
            var links = jQuery.extend({}, dealer.links, {
                directions: directions,
                hours: safeUrl(dealer.links.hours) || directions,
                phone: 'tel:' + String(dealer.phoneHref || dealer.phone).replace(/[^0-9+]/g, '')
            });
            var text = jQuery.extend({}, dealer, { year: new Date().getFullYear() });
            var images = jQuery.extend({}, dealer.images, { footerLogo: dealer.images.footerLogo || dealer.images.logo });

            page.find('[data-dealer]').each(function () {
                var el = jQuery(this);
                var key = el.attr('data-dealer');
                el.text(text[key] == null ? '' : text[key]);
                if (key === 'credit') el.prop('hidden', !text[key]);
            });
            page.find('[data-link]').each(function () {
                var el = jQuery(this);
                var key = el.attr('data-link');
                setLink(el, key === 'phone' ? links.phone : safeUrl(links[key]));
            });
            page.find('[data-image]').each(function () {
                var el = jQuery(this);
                var url = safeUrl(images[el.attr('data-image')]);
                if (url) el.attr('src', url).prop('hidden', false);
                else el.removeAttr('src').prop('hidden', true);
            });
            page.find('.imc-model-link').each(function () {
                var el = jQuery(this);
                var slug = el.attr('data-model-slug');
                var name = el.attr('data-model');
                var url = safeUrl(dealer.modelLinks[slug]);
                if (!url ? safeUrl(dealer.modelBase) : false) {
                    url = dealer.modelBase.replace(/\/$/, '') + '/' + encodeURIComponent(slug);
                }
                if (!url ? safeUrl(dealer.links.inventory) : false) {
                    var destination = new URL(dealer.links.inventory, window.location.href);
                    destination.searchParams.set(dealer.modelSearchKey, name);
                    url = destination.href;
                }
                setLink(el, url);
            });
            page.find('.imc-search-button').text(dealer.search.buttonText || 'View Results');
        }
        applyDealerSettings();

        function setMenu(open) {
            page.find('.imc-menu-button').attr({ 'aria-expanded': String(open), 'aria-label': open ? 'Close navigation' : 'Open navigation' });
            page.find('.imc-mobile-nav').toggleClass('is-open', open).prop('hidden', !open);
            page.find('.imc-menu-open-icon').toggle(!open);
            page.find('.imc-menu-close-icon').toggle(open);
        }
        page.on('click', '.imc-menu-button', function () { setMenu(jQuery(this).attr('aria-expanded') !== 'true'); });
        page.on('click', '.imc-mobile-nav a', function () { setMenu(false); });
        page.on('keydown', function (event) {
            if (event.key === 'Escape' ? page.find('.imc-menu-button').attr('aria-expanded') === 'true' : false) {
                setMenu(false);
                page.find('.imc-menu-button').trigger('focus');
            }
        });
        window.addEventListener('resize', function () { if (Math.max(window.innerWidth, 992) === window.innerWidth) setMenu(false); });
        page.on('click', '.imc-search-toggle', function () {
            var open = jQuery(this).attr('aria-expanded') !== 'true';
            jQuery(this).attr('aria-expanded', String(open));
            page.find('.imc-search-fields').toggleClass('is-open', open);
        });
        var searchForm = page.find('#imc-search-fields');
        var searchStatus = searchForm.find('.imc-search-status');
        var filterRequest = null;
        var filtersLoaded = false;
        var filterNames = ['make', 'category', 'condition'];
        var filterLabels = {
            make: 'All Makes',
            category: 'All Categories',
            condition: 'All Conditions'
        };

        function normalizedFilter(value) {
            return String(value || '').trim().toLowerCase();
        }

        function getSearchValues() {
            var values = {};
            searchForm.find('select[name], input[name]').each(function () {
                values[this.name] = this.disabled ? '' : this.value;
            });
            return values;
        }

        function readInventoryFilters(html) {
            // Parse into a detached document. Never insert remote HTML or run its scripts.
            var inventory = new DOMParser().parseFromString(html, 'text/html');
            var blocks = inventory.querySelectorAll('.inventory-search-units-block');
            var data = { make: [], category: [], condition: [], year: null };
            var seen = { make: new Set(), category: new Set(), condition: new Set() };

            blocks.forEach(function (block) {
                var heading = block.querySelector('.inventory-search-title');
                var name = normalizedFilter(heading ? heading.textContent : '');

                if (filterNames.indexOf(name) !== -1) {
                    block.querySelectorAll('.inventory-filter-box .filter-checkbox-content input[type="checkbox"]').forEach(function (input) {
                        if (input.name !== name || !input.hasAttribute('value')) return;
                        var value = input.value; // Exact inventory query value, not the visible label.
                        if (!value.trim() || seen[name].has(value)) return;
                        seen[name].add(value);
                        var label = input.closest('.filter-checkbox-content').querySelector('label');
                        data[name].push({ value: value, label: (label ? label.textContent.trim() : '') || value });
                    });
                }

                if (name === 'year') {
                    var min = block.querySelector('input[name="min-year"]');
                    var max = block.querySelector('input[name="max-year"]');
                    if (!min || !max || !min.value.trim() || !max.value.trim()) return;
                    var lower = Number(min.value);
                    var upper = Number(max.value);
                    if ([lower, upper].every(Number.isInteger) ? Math.min(lower, upper) === lower : false) {
                        data.year = { min: lower, max: upper };
                    }
                }
            });
            return data;
        }

        function renderInventoryFilters(data, previous) {
            filterNames.forEach(function (name) {
                var select = searchForm.find('select[name="' + name + '"]');
                select.empty().append(jQuery('\x3coption\x3e').val('').text(filterLabels[name]));
                data[name].forEach(function (option) {
                    select.append(jQuery('\x3coption\x3e').val(option.value).text(option.label));
                });
                var chosen = previous[name];
                if (!filtersLoaded ? (name === 'make' ? (!chosen ? dealer.search.defaultMake : false) : false) : false) {
                    var aliases = [dealer.search.defaultMake].concat(dealer.search.makeAliases || []);
                    aliases.some(function (alias) {
                        var match = data.make.find(function (option) {
                            return normalizedFilter(option.value) === normalizedFilter(alias);
                        });
                        if (!match) return false;
                        chosen = match.value;
                        return true;
                    });
                }
                select.val(data[name].some(function (option) { return option.value === chosen; }) ? chosen : '');
                select.prop('disabled', !data[name].length);
            });

            var years = searchForm.find('input[name="min-year"], input[name="max-year"]');
            years.each(function () {
                var input = jQuery(this);
                var value = previous[this.name];
                if (data.year) {
                    input.attr({ min: data.year.min, max: data.year.max });
                    input.val(value ? (Math.min(data.year.max, Math.max(data.year.min, Number(value))) === Number(value) ? value : '') : '');
                } else {
                    input.removeAttr('min max').val('');
                }
                input.prop('disabled', !data.year);
            });
            searchForm.find('input[name="max-year"]')[0].setCustomValidity('');
            filtersLoaded = true;
        }

        function finishInventoryFilters(message) {
            searchForm.attr('aria-busy', 'false');
            searchForm.find('.imc-search-button').prop('disabled', false);
            searchStatus.text(message || '');
        }

        function loadInventoryFilters() {
            if (!searchForm.length || filterRequest) return filterRequest;
            var previous = getSearchValues();
            var source;
            try {
                source = new URL(dealer.search.source || '/inventory/', window.location.href);
                if (source.origin !== window.location.origin) throw new Error('Inventory source must be same-origin.');
            } catch (error) {
                finishInventoryFilters('Inventory filters are unavailable. You can still browse inventory.');
                console.warn('Indian Motorcycle: inventory filter source is invalid.', error);
                return null;
            }
            searchForm.attr('aria-busy', 'true');
            searchForm.find('select, input, .imc-search-button').prop('disabled', true);
            searchStatus.text('Loading inventory filters…');

            filterRequest = jQuery.ajax({
                url: source.href,
                type: 'GET',
                dataType: 'text',
                timeout: 15000
            });
            filterRequest.done(function (html) {
                try {
                    var data = readInventoryFilters(html);
                    renderInventoryFilters(data, previous);
                    var any = filterNames.some(function (name) { return data[name].length; }) || data.year;
                    finishInventoryFilters(any ? '' : 'No inventory filters are available. You can still browse inventory.');
                } catch (error) {
                    finishInventoryFilters('Inventory filters are unavailable. You can still browse inventory.');
                    console.warn('Indian Motorcycle: could not parse inventory filters.', error);
                }
            }).fail(function (xhr, status) {
                finishInventoryFilters('Inventory filters are unavailable. You can still browse inventory.');
                console.warn('Indian Motorcycle: inventory filter request failed.', status);
            }).always(function () {
                filterRequest = null;
            });
            return filterRequest;
        }

        function buildInventoryUrl() {
            var url = new URL(safeUrl(dealer.links.inventory) || '/inventory/', window.location.href);
            var values = getSearchValues();
            ['make', 'category', 'condition', 'min-year', 'max-year'].forEach(function (name) {
                url.searchParams.delete(name);
                if (values[name]) url.searchParams.set(name, values[name]);
            });
            return url.href;
        }

        function validateYearRange() {
            var min = searchForm.find('input[name="min-year"]')[0];
            var max = searchForm.find('input[name="max-year"]')[0];
            if (!min || !max) return;
            max.setCustomValidity('');
            if (min.disabled || max.disabled || min.value === '' || max.value === '') return;
            if (Math.min(Number(min.value), Number(max.value)) !== Number(min.value)) {
                max.setCustomValidity('The maximum year must be greater than or equal to the minimum year.');
            }
        }

        searchForm.on('input change', 'input[type="number"]', validateYearRange);
        searchForm.on('submit', function (event) {
            event.preventDefault();
            if (searchForm.attr('aria-busy') === 'true') return;
            validateYearRange();
            if (!this.reportValidity()) return;
            window.location.assign(buildInventoryUrl());
        });

        var heroRoot = page.find('.imc-hero-swiper');
        var heroHovered = false;
        var heroFocused = false;
        var desktopHeroHover = window.matchMedia('(min-width: 992px) and (hover: hover) and (pointer: fine)');

        function syncHeroAutoplay() {
            if (!heroSwiper || !heroSwiper.autoplay) return;
            if (!heroSwiper.params.autoplay || !heroSwiper.params.autoplay.enabled) return;
            var blocked = heroHovered || heroFocused || heroRoot.find('.is-terms-open').length !== 0;
            if (blocked) {
                if (heroSwiper.autoplay.running) heroSwiper.autoplay.stop();
            } else if (!heroSwiper.autoplay.running) {
                heroSwiper.autoplay.start();
            }
        }

        function setHeroTerms(item, open, restoreFocus) {
            var trigger = item.find('.imc-hero-terms-toggle');
            var panel = item.find('.imc-hero-terms-panel');
            if (!panel.length) return;
            if (!open) {
                if (restoreFocus || panel[0].contains(document.activeElement)) {
                    item.removeClass('is-terms-open');
                    trigger[0].focus({ preventScroll: true });
                }
            }
            item.toggleClass('is-terms-open', open);
            trigger.attr('aria-expanded', String(open));
            panel.attr('aria-hidden', String(!open)).prop('inert', !open);
            syncHeroAutoplay();
        }

        function closeHeroTerms(except) {
            heroRoot.find('.imc-hero-slide-has-terms').each(function () {
                if (this === except) return;
                var item = jQuery(this);
                setHeroTerms(item, false, false);
            });
        }

        function updateHeroSlideState(swiper) {
            var active = swiper.slides[swiper.activeIndex];
            if (!active) return;
            var focused = document.activeElement;
            var moveFocus = false;
            Array.prototype.forEach.call(swiper.slides, function (slide) {
                if (slide === active) return;
                if (slide.contains(focused)) moveFocus = true;
            });
            jQuery(active).prop('inert', false).removeAttr('aria-hidden');
            if (moveFocus) {
                var nextFocus = active.querySelector('.imc-hero-terms-toggle, a[href]');
                if (nextFocus) nextFocus.focus({ preventScroll: true });
                else if (focused.blur) focused.blur();
            }
            closeHeroTerms(active);
            Array.prototype.forEach.call(swiper.slides, function (slide) {
                if (slide === active) return;
                jQuery(slide).prop('inert', true).attr('aria-hidden', 'true');
            });
        }

        function appendHeroTerms(item, slide, index) {
            if (!slide.promotion || !String(slide.terms || '').trim()) return;
            var id = 'imc-hero-terms-' + index;
            item.addClass('imc-hero-slide-has-terms');
            var trigger = jQuery('\x3cbutton\x3e', {
                type: 'button', class: 'imc-hero-terms-toggle swiper-no-swiping',
                'aria-controls': id, 'aria-expanded': 'false'
            }).text('Terms \x26 Conditions');
            var panel = jQuery('\x3cdiv\x3e', {
                id: id, class: 'imc-hero-terms-panel swiper-no-swiping',
                role: 'region', 'aria-labelledby': id + '-heading', 'aria-hidden': 'true'
            }).prop('inert', true);
            var heading = jQuery('\x3cdiv\x3e', { class: 'imc-hero-terms-header' });
            var title = jQuery('\x3cdiv\x3e', { class: 'imc-hero-terms-heading-group' });
            title.append(jQuery('\x3ch3\x3e', { id: id + '-heading' }).text('Terms \x26 Conditions'));
            title.append(jQuery('\x3cspan\x3e', { class: 'imc-hero-terms-title' }).text(slide.alt || 'Indian Motorcycle Promotion'));
            heading.append(title, jQuery('\x3cbutton\x3e', {
                type: 'button', class: 'imc-hero-terms-close', 'aria-label': 'Close terms and conditions'
            }).text('\u00d7'));
            var body = jQuery('\x3cdiv\x3e', {
                class: 'imc-hero-terms-body', tabindex: '0', role: 'group', 'aria-label': 'Promotion terms and conditions'
            }).append(jQuery('\x3cp\x3e').text(String(slide.terms)));
            panel.append(heading, body);
            item.append(trigger, panel);
        }

        heroRoot.on('pointerenter', function (event) {
            if (!desktopHeroHover.matches || event.pointerType !== 'mouse') return;
            heroHovered = true;
            syncHeroAutoplay();
        });
        heroRoot.on('pointerleave', function () {
            heroHovered = false;
            syncHeroAutoplay();
        });
        heroRoot.on('focusin', function () {
            heroFocused = true;
            syncHeroAutoplay();
        });
        heroRoot.on('focusout', function (event) {
            if (event.relatedTarget ? this.contains(event.relatedTarget) : false) return;
            heroFocused = false;
            syncHeroAutoplay();
        });
        heroRoot.on('click', '.imc-hero-terms-toggle', function (event) {
            event.preventDefault();
            var item = jQuery(this).closest('.swiper-slide');
            if (item.hasClass('is-terms-open')) {
                setHeroTerms(item, false, true);
                return;
            }
            closeHeroTerms(item[0]);
            setHeroTerms(item, true, false);
            item.find('.imc-hero-terms-close')[0].focus({ preventScroll: true });
        });
        heroRoot.on('click', '.imc-hero-terms-close', function (event) {
            event.preventDefault();
            var item = jQuery(this).closest('.swiper-slide');
            setHeroTerms(item, false, true);
        });
        heroRoot.on('keydown', function (event) {
            if (event.key !== 'Escape') return;
            var item = heroRoot.find('.is-terms-open').first();
            if (!item.length) return;
            event.preventDefault();
            event.stopPropagation();
            setHeroTerms(item, false, true);
        });
        jQuery(document).on('pointerdown.imcHeroTerms', function (event) {
            if (heroRoot[0].contains(event.target)) return;
            if (!heroRoot.find('.is-terms-open').length) return;
            closeHeroTerms(null);
        });
        function resetHeroTermsForViewport() {
            heroHovered = false;
            closeHeroTerms(null);
            syncHeroAutoplay();
        }
        if (desktopHeroHover.addEventListener) desktopHeroHover.addEventListener('change', resetHeroTermsForViewport);
        else if (desktopHeroHover.addListener) desktopHeroHover.addListener(resetHeroTermsForViewport);

        function createHeroSwiper() {
            var el = page.find('.imc-hero-swiper')[0];
            var count = jQuery(el).find('.swiper-slide').length;
            if (heroSwiper) heroSwiper.destroy(true, true);
            heroRoot.toggleClass('has-multiple-hero-slides', count !== 0 ? count !== 1 : false);
            heroSwiper = new window.Swiper(el, {
                slidesPerView: 1,
                effect: 'fade',
                fadeEffect: { crossFade: true },
                speed: reducedMotion ? 0 : 650,
                rewind: count !== 0 ? count !== 1 : false,
                watchOverflow: true,
                autoplay: (count !== 1 ? (Boolean(count) ? !reducedMotion : false) : false) ? { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: false } : false,
                pagination: { el: page.find('.imc-hero-dots')[0], clickable: true },
                a11y: { enabled: true },
                noSwiping: true,
                noSwipingClass: 'swiper-no-swiping',
                on: {
                    slideChange: function () { updateHeroSlideState(this); },
                    slideChangeTransitionEnd: function () { syncHeroAutoplay(); }
                }
            });
            updateHeroSlideState(heroSwiper);
            heroFocused = heroRoot[0].contains(document.activeElement);
            syncHeroAutoplay();
        }
        function createFamilySwiper() {
            familySwiper = new window.Swiper(page.find('.imc-family-swiper')[0], {
                slidesPerView: 'auto',
                spaceBetween: 0,
                speed: reducedMotion ? 0 : 350,
                watchOverflow: true,
                navigation: { prevEl: page.find('.imc-family-prev')[0], nextEl: page.find('.imc-family-next')[0] },
                a11y: { enabled: false } // preserve custom ARIA tab semantics
            });
        }
        function createModelSwiper(key) {
            var panel = page.find('#imc-panel-' + key);
            if (modelSwipers[key]) {
                modelSwipers[key].update();
                return;
            }
            modelSwipers[key] = new window.Swiper(panel.find('.imc-model-swiper')[0], {
                slidesPerView: 1,
                speed: reducedMotion ? 0 : 400,
                autoHeight: true,
                rewind: true,
                watchOverflow: true,
                navigation: { prevEl: panel.find('.imc-model-prev')[0], nextEl: panel.find('.imc-model-next')[0] },
                a11y: { enabled: true }
            });
            panel.find('img').on('load', function () { modelSwipers[key].updateAutoHeight(0); });
        }
        function selectFamily(key, focusTab) {
            var tab = page.find('.imc-family-tab').filter(function () { return jQuery(this).attr('data-family') === key; });
            if (!tab.length) return;
            activeFamily = key;
            page.find('.imc-family-tab').removeClass('is-active').attr({ 'aria-selected': 'false', tabindex: '-1' });
            tab.addClass('is-active').attr({ 'aria-selected': 'true', tabindex: '0' });
            page.find('.imc-model-panel').prop('hidden', true);
            page.find('#imc-panel-' + key).prop('hidden', false);
            if (swiperReady) {
                createModelSwiper(key);
                if (familySwiper) {
                    var index = tab.closest('.swiper-slide').index();
                    familySwiper.slideTo(index);
                }
            } else if (focusTab) {
                tab[0].scrollIntoView({ block: 'nearest', inline: 'nearest' });
            }
            if (focusTab) tab.trigger('focus');
        }
        page.on('click', '.imc-family-tab', function () { selectFamily(jQuery(this).attr('data-family'), false); });
        page.on('keydown', '.imc-family-tab', function (event) {
            var tabs = page.find('.imc-family-tab');
            var index = tabs.index(this);
            if (event.key === 'ArrowRight') index = (index + 1) % tabs.length;
            else if (event.key === 'ArrowLeft') index = (index - 1 + tabs.length) % tabs.length;
            else if (event.key === 'Home') index = 0;
            else if (event.key === 'End') index = tabs.length - 1;
            else return;
            event.preventDefault();
            selectFamily(tabs.eq(index).attr('data-family'), true);
        });

        function setHeroSlides(slides) {
            if (!Array.isArray(slides)) return false;
            var valid = slides.filter(function (slide) { return slide ? safeUrl(slide.desktop) : false; });
            if (!valid.length) return false; // preserve placeholders on empty/error responses
            if (heroSwiper) { heroSwiper.destroy(true, true); heroSwiper = null; }
            var wrapper = page.find('.imc-hero-slides').empty();
            jQuery.each(valid, function (index, slide) {
                var item = jQuery('\x3cdiv\x3e', { class: 'swiper-slide' });
                var url = safeUrl(slide.url);
                var media = jQuery(url ? '\x3ca\x3e' : '\x3cdiv\x3e', { class: 'imc-hero-media' });
                if (url) {
                    media.attr({ href: url, title: slide.alt || 'Indian Motorcycle banner' });
                    if (slide.external) media.attr({ target: '_blank', rel: 'noopener noreferrer' });
                }
                if (slide.promotion) media.addClass('imc-hero-promotion');
                var picture = jQuery('\x3cpicture\x3e');
                if (safeUrl(slide.mobile)) picture.append(jQuery('\x3csource\x3e').attr({ media: '(max-width: 767px)', srcset: slide.mobile }));
                picture.append(jQuery('\x3cimg\x3e').attr({ src: slide.desktop, alt: slide.alt || 'Indian Motorcycle banner', loading: index === 0 ? 'eager' : 'lazy', decoding: 'async' }));
                media.append(picture);
                item.append(media);
                appendHeroTerms(item, slide, index);
                wrapper.append(item);
            });
            heroRoot.toggleClass('has-multiple-hero-slides', swiperReady ? valid.length !== 1 : false);
            if (swiperReady) createHeroSwiper();
            return true;
        }
        var promoConfig = jQuery.extend({
            csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQxeKAIyWFGRAoXqXW9TG5KNkwkfTuQi2CJNFNVwtFMNyn5CVJjIfnC_2R0McOMEE-xZELk5WBSeEcQ/pub?gid=0\x26single=true\x26output=csv',
            oem: 'Indian Motorcycle',
            defaultRegion: '',
            defaultStates: [],
            inventoryLink: '',
            useInHero: true,
            dealerDomain: '',
            ignoreRegion: false,
            ignoreStates: false
        }, dealer.promotions || {});
        var PROMOTION_COLUMN_COUNT = 16;
        var CUSTOMER_START_ROW = 2;
        var CUSTOMER_DOMAIN_COLUMN = 32;
        var CUSTOMER_REGION_COLUMN = 34;
        var CUSTOMER_STATES_COLUMN = 36;
        var promoContainer = page.find('#imc-promotions-content');
        var promoStatus = page.find('.imc-promo-status');
        var promoRequest = 0;
        var heroFallback = page.find('.imc-hero-slides').children().clone();
        var usingPromoHero = false;

        function clean(value) {
            return String(value == null ? '' : value).trim();
        }
        function normalizeDomain(value) {
            var raw = clean(value).toLowerCase();
            if (!raw || raw === '*') return raw;
            try {
                return new URL(raw.includes('://') ? raw : 'https://' + raw).hostname.replace(/^www\./, '');
            } catch (error) { return ''; }
        }
        function normalizeRegion(value) {
            var region = clean(value).toUpperCase();
            if (['US', 'USA', 'UNITED STATES'].includes(region)) return 'USA';
            if (['CA', 'CAN', 'CANADA'].includes(region)) return 'CAN';
            return region;
        }
        function splitStates(value) {
            return clean(value).split(/[,;\n]+/).map(function (state) {
                return state.trim().toUpperCase();
            }).filter(Boolean);
        }
        function matchesStates(value, dealerStates) {
            var states = splitStates(value);
            return !states.length || states.includes('ALL') || states.some(function (state) {
                return dealerStates.includes(state);
            });
        }
        function normalizeImageHeader(value) {
            return clean(value).normalize('NFKC')
                .replace(/[\u200B-\u200D\uFEFF]/g, '')
                .toLowerCase().replace(/[^a-z0-9]/g, '');
        }
        function getImageColumns(headers) {
            var primary = [], secondary = [];
            headers.forEach(function (header, index) {
                var key = normalizeImageHeader(header);
                if (/^(image2|image02|imageurl2|image2url|secondimage|secondaryimage|secondaryimageurl|heroimage|heroimageurl|herobanner|herobannerurl)$/.test(key)) {
                    secondary.push(index);
                } else if (/^(image|image1|image01|imageurl|imageurl1|image1url|primaryimage|primaryimageurl|firstimage|images|imageurls)$/.test(key)) {
                    primary.push(index);
                }
            });
            return { primary: primary, secondary: secondary };
        }
        function getRowImages(row, columns) {
            function collect(indices) {
                var result = [];
                indices.forEach(function (index) {
                    splitImageLinks(row[index]).forEach(function (raw) {
                        var url = imageUrl(raw);
                        if (url) result.push({ url: url, column: index + 1 });
                    });
                });
                return result;
            }
            var primary = collect(columns.primary);
            var secondary = collect(columns.secondary);
            var first = primary[0] || null;
            var second = secondary[0] || primary.find(function (item) {
                return first ? item.url !== first.url : false;
            }) || null;
            return { first: first, second: second, primary: primary, secondary: secondary };
        }
        function findCarouselPositionColumn(headers) {
            var keys = headers.map(normalizeImageHeader);
            var index = keys.indexOf('carouselposition');
            if (index === -1) index = keys.indexOf('carouselorder');
            return index;
        }
        function parseCarouselPosition(value) {
            var raw = clean(value);
            if (!/^\d+$/.test(raw)) return null;
            var position = Number(raw);
            return Number.isSafeInteger(position) ? position : null;
        }
        function sortPromotionsByPosition(promos) {
            return promos.slice().sort(function (a, b) {
                var first = a.carouselPosition === null ? Infinity : a.carouselPosition;
                var second = b.carouselPosition === null ? Infinity : b.carouselPosition;
                if (first !== second) return first - second;
                return a.csvRow - b.csvRow;
            });
        }
        function getMatchingPromotions(rows) {
            var allHeaders = rows[0] || [];
            var imageColumns = getImageColumns(allHeaders);
            var positionColumn = findCarouselPositionColumn(allHeaders);
            var headers = allHeaders.slice(0, PROMOTION_COLUMN_COUNT).map(function (header) {
                return clean(header).replace(/^\uFEFF/, '').toLowerCase();
            });
            if (!['oem', 'status', 'region', 'banner states'].every(function (header) { return headers.includes(header); })) {
                throw new Error('OEM Manager CSV headers do not match the expected schema.');
            }
            var currentDomain = normalizeDomain(window.location.hostname);
            var lookupDomain = normalizeDomain(promoConfig.dealerDomain) || currentDomain;
            var customer = rows.slice(CUSTOMER_START_ROW).find(function (row) {
                return normalizeDomain(row[CUSTOMER_DOMAIN_COLUMN]) === lookupDomain;
            });
            var region = normalizeRegion(customer ? customer[CUSTOMER_REGION_COLUMN] : '') || normalizeRegion(promoConfig.defaultRegion);
            var states = splitStates(customer ? customer[CUSTOMER_STATES_COLUMN] : promoConfig.defaultStates);
            var targetOem = clean(promoConfig.oem).toLowerCase();
            var all = rows.slice(1).map(function (row, index) {
                var promo = headers.reduce(function (promo, header, index) {
                    if (header) promo[header] = clean(row[index]);
                    return promo;
                }, Object.create(null));
                promo.imageFields = getRowImages(row, imageColumns);
                promo.carouselPosition = positionColumn === -1 ? null : parseCarouselPosition(row[positionColumn]);
                promo.csvRow = index + 2;
                return promo;
            });
            var oem = all.filter(function (promo) { return clean(promo.oem).toLowerCase() === targetOem; });
            var active = oem.filter(function (promo) { return clean(promo.status).toLowerCase() === 'active'; });
            function regionMatches(promo) {
                var bannerRegion = normalizeRegion(promo.region);
                return bannerRegion === 'ALL' || (region ? bannerRegion === region : false);
            }
            function stateMatches(promo) { return matchesStates(promo['banner states'], states); }
            var strictRegional = active.filter(regionMatches);
            var ignoreRegion = promoConfig.ignoreRegion === true;
            var ignoreStates = promoConfig.ignoreStates === true;
            var regional = ignoreRegion ? active : strictRegional;
            var eligible = ignoreStates ? regional : regional.filter(stateMatches);
            return sortPromotionsByPosition(eligible);
        }
        function splitImageLinks(value) {
            var raw = clean(value);
            if (raw.charAt(0) === '[') {
                try {
                    var entries = JSON.parse(raw);
                    if (Array.isArray(entries)) return entries.filter(function (item) {
                        return typeof item === 'string';
                    }).map(clean).filter(Boolean);
                } catch (error) { /* use the original delimiter format */ }
            }
            return raw.split(/[\n,;]+/).map(function (url) { return url.trim(); }).filter(Boolean);
        }
        function imageUrl(value) {
            try {
                var url = new URL(value);
                if (!/^https?:$/.test(url.protocol)) return '';
                if (url.hostname === 'drive.google.com') {
                    var match = url.pathname.match(/\/d\/([\w-]+)/);
                    var id = match ? match[1] : url.searchParams.get('id');
                    if (id ? /^[\w-]+$/.test(id) : false) return 'https://lh3.googleusercontent.com/d/' + id + '=w1920';
                }
                return url.href;
            } catch (error) { return ''; }
        }
        function parseHrefs(value) {
            var entries;
            try { entries = JSON.parse(value || '[]'); } catch (error) { return []; }
            if (!Array.isArray(entries)) return [];
            return entries.map(function (entry) {
                if (typeof entry === 'string') return { domain: '*', href: clean(entry) };
                if (!entry || typeof entry !== 'object') return null;
                return { domain: normalizeDomain(entry.domain || entry.Domain || '*'), href: clean(entry.href || entry.Href) };
            }).filter(function (entry) { return entry ? (entry.href ? entry.domain : false) : false; });
        }
        function resolvePromoHref(promo) {
            var currentDomain = normalizeDomain(window.location.hostname);
            var hrefs = parseHrefs(promo.hrefs || promo.href);
            var matched = hrefs.find(function (item) { return item.domain === currentDomain ? safeUrl(item.href) : false; });
            var wildcard = hrefs.find(function (item) { return item.domain === '*' ? safeUrl(item.href) : false; });
            var href = (matched || wildcard || {}).href || safeUrl(promoConfig.inventoryLink) || safeUrl(dealer.links.inventory);
            if (!href) return { href: '', external: false };
            var url = new URL(href, window.location.href);
            var external = url.origin !== window.location.origin;
            if (normalizeDomain(url.hostname) === currentDomain) {
                return { href: url.pathname + url.search + url.hash, external: false };
            }
            return { href: url.href, external: external };
        }
        function buildBanners(promos) {
            return promos.map(function (promo) {
                var fields = promo.imageFields;
                var image1 = fields.first ? fields.first.url : '';
                var image2 = fields.second ? fields.second.url : '';
                var heroSource = image2 ? 'Image 2' : 'Image 1 fallback';
                var promoSource = image1 ? 'Image 1' : 'Image 2 fallback';
                if (!image1) image1 = image2;
                if (!image2) image2 = image1;
                if (!image1) return null;
                return {
                    desktop: image2, promoImage: image1, carouselPosition: promo.carouselPosition, heroSource: heroSource, promoSource: promoSource, alt: promo.title || 'Indian Motorcycle Promotion',
                    terms: promo['terms \x26 conditions'] || '', url: '#imc-current-inventory', external: false, promotion: true
                };
            }).filter(Boolean);
        }
        function resetPromoHero() {
            if (!usingPromoHero) return;
            usingPromoHero = false;
            if (dealer.heroSlides ? setHeroSlides(dealer.heroSlides) : false) return;
            if (heroSwiper) { heroSwiper.destroy(true, true); heroSwiper = null; }
            page.find('.imc-hero-slides').empty().append(heroFallback.clone());
            if (swiperReady) createHeroSwiper();
        }
        function renderPromotions(banners, message) {
            promoContainer.empty();
            promoStatus.text(
                message || (
                    banners.length
                        ? (
                            promoConfig.ignoreRegion === true ||
                                promoConfig.ignoreStates === true
                                ? 'Preview promotions — not approved for production.'
                                : ''
                        )
                        : 'No current promotions available. Please check back soon.'
                )
            );
            if (!banners.length) {
                resetPromoHero();
                return;
            }
            banners.forEach(function (banner) {
                var card = jQuery('\x3cdiv\x3e', { class: 'imc-promo-card' });
                var media = jQuery(banner.url ? '\x3ca\x3e' : '\x3cdiv\x3e', { class: 'imc-promo-media' });
                if (banner.url) {
                    media.attr({ href: banner.url, title: banner.alt });
                    if (banner.external) media.attr({ target: '_blank', rel: 'noopener noreferrer' });
                }
                var image = jQuery('\x3cimg\x3e').on('error', function () { console.warn('[Indian Motorcycle] Image failed:', banner.promoImage); }).attr({ src: banner.promoImage, alt: banner.alt, loading: 'lazy', decoding: 'async' });
                media.append(image);
                card.append(media);
                card.append(jQuery('\x3ch3\x3e', { class: 'imc-promo-title' }).text(banner.alt));
                if (banner.terms) {
                    card.append(jQuery('\x3cdetails\x3e', { class: 'imc-promo-terms' })
                        .append(jQuery('\x3csummary\x3e').text('Terms \x26 Conditions'))
                        .append(jQuery('\x3cp\x3e').text(banner.terms)));
                }
                promoContainer.append(card);
            });
            if (promoConfig.useInHero) usingPromoHero = setHeroSlides(banners);
        }
        function parseCSV(text) {
            var rows = [], row = [], value = '', quoted = false, closed = false;
            text = text.replace(/^\uFEFF/, '');
            for (var i = 0; i !== text.length; i += 1) {
                var c = text[i];
                if (quoted) {
                    if (c === '"') {
                        if (text[i + 1] === '"') { value += '"'; i += 1; }
                        else { quoted = false; closed = true; }
                    } else value += c;
                } else if (c === ',' || c === '\r' || c === '\n') {
                    row.push(value); value = ''; closed = false;
                    if (c !== ',') {
                        rows.push(row); row = [];
                        if (c === '\r') { if (text[i + 1] === '\n') i += 1; }
                    }
                } else if (c === '"') {
                    if (value || closed) throw new Error('Malformed CSV quote.');
                    quoted = true;
                } else {
                    if (closed) throw new Error('Unexpected content after quoted CSV cell.');
                    value += c;
                }
            }
            if (quoted) throw new Error('Unclosed CSV quote.');
            if (row.length || value || closed) { row.push(value); rows.push(row); }
            return rows;
        }
        function loadPromotions() {
            var request = ++promoRequest;
            promoContainer.attr('aria-busy', 'true');
            promoStatus.text('Loading current promotions...');
            function fail(error) {
                if (request !== promoRequest) return;
                console.error('[Indian Motorcycle] Failed:', error);
                promoContainer.attr('aria-busy', 'false');
                renderPromotions([], 'Current promotions are temporarily unavailable. Please check back soon.');
            }
            function complete(rows) {
                if (request !== promoRequest) return;
                try {
                    if (!Array.isArray(rows) || !rows.length) throw new Error('Empty promotion CSV response.');
                    var banners = buildBanners(getMatchingPromotions(rows));
                    renderPromotions(banners);
                    promoContainer.attr('aria-busy', 'false');
                } catch (error) { fail(error); }
            }
            if (window.Papa) {
                if (typeof window.Papa.parse === 'function') {
                    window.Papa.parse(promoConfig.csvUrl, {
                        download: true, header: false, skipEmptyLines: false,
                        complete: function (results) {
                            if (!results || (results.errors || []).some(function (error) { return error.type === 'Quotes' || error.type === 'Delimiter'; })) return fail('Invalid CSV response.');
                            complete(results.data || []);
                        }, error: fail
                    });
                    return;
                }
            }
            fetch(promoConfig.csvUrl, { credentials: 'omit', cache: 'no-store' }).then(function (response) {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.text();
            }).then(function (text) { complete(parseCSV(text)); }).catch(fail);
        }

        if (Array.isArray(dealer.heroSlides) ? dealer.heroSlides.length : false) setHeroSlides(dealer.heroSlides);

        window.indianBrandPage = {
            setHeroSlides: setHeroSlides,
            refreshPromotions: loadPromotions,
            selectFamily: selectFamily,
            getSearchValues: getSearchValues,
            refreshInventoryFilters: loadInventoryFilters,
            getInventoryUrl: buildInventoryUrl,
            promotionsElement: page.find('#imc-promotions-content')[0]
        };

        page.on('click', '.imc-hero-promotion, .imc-promo-media', function (event) {
            if (jQuery(this).attr('href') !== '#imc-current-inventory') return;
            var section = page.find('#imc-current-inventory')[0];
            if (section) {
                if (section.querySelector('.manage-inventory-featured-slider-slide')) {
                    if (section.getClientRects().length) return;
                }
            }
            event.preventDefault();
            window.location.assign(safeUrl(promoConfig.inventoryLink) || safeUrl(dealer.links.inventory) || '/inventory/');
        });

        page.on('click', 'a[href^="#"]', function (event) {
            var href = jQuery(this).attr('href');
            if (!href || href === '#' || event.isDefaultPrevented()) return;
            if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            if (this.target === '_blank') return;
            var target = document.getElementById(href.substring(1));
            if (!target || !target.getClientRects().length) return;
            event.preventDefault();
            closeHeroTerms(null);
            var headerHeight = page.find('.imc-header-inner').outerHeight() || 0;
            var targetPosition = Math.max(0, jQuery(target).offset().top - headerHeight - 24);
            var instant = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            jQuery('html, body').stop(true).animate({ scrollTop: targetPosition }, instant ? 0 : 1000, 'swing');
        });

        page.on('click', '.imc-arrow', function () {
            if (swiperReady) return;
            var control = jQuery(this);
            var target = control.parent().find('.swiper')[0];
            if (target) target.scrollBy({ left: (control.hasClass('imc-next') ? 1 : -1) * target.clientWidth, behavior: reducedMotion ? 'auto' : 'smooth' });
        });
        if (typeof window.Swiper === 'function') {
            swiperReady = true;
            createHeroSwiper();
            createFamilySwiper();
            createModelSwiper(activeFamily);
        } else {
            console.warn('Indian Motorcycle page: Swiper unavailable; native scrolling is enabled.');
        }
        loadInventoryFilters();
        loadPromotions();
    }
})();