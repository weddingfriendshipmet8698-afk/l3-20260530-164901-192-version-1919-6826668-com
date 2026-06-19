(function () {
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle('is-active', idx === current);
            });
            thumbs.forEach(function (thumb, idx) {
                thumb.classList.toggle('is-active', idx === current);
            });
        }

        function startHero() {
            stopHero();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5800);
        }

        function stopHero() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        thumbs.forEach(function (thumb) {
            thumb.addEventListener('click', function () {
                var index = Number(thumb.getAttribute('data-hero-thumb')) || 0;
                showSlide(index);
                startHero();
            });
        });

        hero.addEventListener('mouseenter', stopHero);
        hero.addEventListener('mouseleave', startHero);
        startHero();
    }

    var input = document.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var emptyState = document.querySelector('[data-empty-state]');
    var activeFilter = 'all';

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function textForCard(card) {
        return [
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.textContent
        ].join(' ').toLowerCase();
    }

    function applySearch() {
        if (!cards.length) {
            return;
        }

        var keyword = input ? normalize(input.value) : '';
        var visibleCount = 0;

        cards.forEach(function (card) {
            var haystack = textForCard(card);
            var filterMatch = activeFilter === 'all' || haystack.indexOf(normalize(activeFilter)) !== -1;
            var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
            var visible = filterMatch && keywordMatch;
            card.style.display = visible ? '' : 'none';
            if (visible) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visibleCount === 0);
        }
    }

    if (input) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query) {
            input.value = query;
        }

        input.addEventListener('input', applySearch);
    }

    buttons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilter = button.getAttribute('data-filter') || 'all';
            buttons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });
            applySearch();
        });
    });

    applySearch();
})();
