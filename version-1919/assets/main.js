(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMobileMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', carousel);
        var dots = selectAll('[data-hero-dot]', carousel);
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function next() {
            show(active + 1);
        }

        function start() {
            stop();
            timer = window.setInterval(next, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var panels = selectAll('[data-filter-panel]');
        panels.forEach(function (panel) {
            var scopeSelector = panel.getAttribute('data-filter-panel');
            var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
            var cards = selectAll('.movie-card', scope || document);
            var noResults = document.querySelector('[data-no-results]');
            var inputs = selectAll('input, select', panel);

            function filterCards() {
                var q = normalize(panel.querySelector('[name="q"]') && panel.querySelector('[name="q"]').value);
                var region = normalize(panel.querySelector('[name="region"]') && panel.querySelector('[name="region"]').value);
                var type = normalize(panel.querySelector('[name="type"]') && panel.querySelector('[name="type"]').value);
                var year = normalize(panel.querySelector('[name="year"]') && panel.querySelector('[name="year"]').value);
                var category = normalize(panel.querySelector('[name="category"]') && panel.querySelector('[name="category"]').value);
                var shown = 0;

                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-category'),
                        card.getAttribute('data-text')
                    ].join(' '));
                    var visible = true;
                    if (q && text.indexOf(q) === -1) {
                        visible = false;
                    }
                    if (region && normalize(card.getAttribute('data-region')).indexOf(region) === -1) {
                        visible = false;
                    }
                    if (type && normalize(card.getAttribute('data-type')).indexOf(type) === -1) {
                        visible = false;
                    }
                    if (year && normalize(card.getAttribute('data-year')).indexOf(year) === -1) {
                        visible = false;
                    }
                    if (category && normalize(card.getAttribute('data-category')) !== category) {
                        visible = false;
                    }
                    card.style.display = visible ? '' : 'none';
                    if (visible) {
                        shown += 1;
                    }
                });

                if (noResults) {
                    noResults.classList.toggle('is-visible', shown === 0);
                }
            }

            inputs.forEach(function (input) {
                input.addEventListener('input', filterCards);
                input.addEventListener('change', filterCards);
            });

            var params = new URLSearchParams(window.location.search);
            var queryValue = params.get('q');
            var queryInput = panel.querySelector('[name="q"]');
            if (queryValue && queryInput) {
                queryInput.value = queryValue;
            }
            filterCards();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initFilters();
    });
}());
