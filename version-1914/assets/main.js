(function () {
    const menuButton = document.querySelector('[data-menu-button]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let current = 0;
        let timer = null;

        const showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        const start = function () {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        };

        const stop = function () {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                stop();
                showSlide(Number(dot.dataset.heroDot || 0));
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);

        if (slides.length > 1) {
            start();
        }
    }

    const filterPanel = document.querySelector('[data-filter-panel]');

    if (filterPanel) {
        const searchInput = filterPanel.querySelector('[data-filter-search]');
        const regionSelect = filterPanel.querySelector('[data-filter-region]');
        const yearSelect = filterPanel.querySelector('[data-filter-year]');
        const resetButton = filterPanel.querySelector('[data-filter-reset]');
        const countNode = filterPanel.querySelector('[data-filter-count]');
        const list = document.querySelector('[data-filter-list]');
        const empty = document.querySelector('[data-filter-empty]');
        const cards = list ? Array.from(list.querySelectorAll('[data-movie-card]')) : [];

        const applyFilter = function () {
            const keyword = (searchInput ? searchInput.value : '').trim().toLowerCase();
            const region = regionSelect ? regionSelect.value : '';
            const year = yearSelect ? yearSelect.value : '';
            let visible = 0;

            cards.forEach(function (card) {
                const text = (card.dataset.text || '').toLowerCase();
                const title = (card.dataset.title || '').toLowerCase();
                const matchKeyword = !keyword || text.includes(keyword) || title.includes(keyword);
                const matchRegion = !region || card.dataset.region === region;
                const matchYear = !year || card.dataset.year === year;
                const matched = matchKeyword && matchRegion && matchYear;

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (countNode) {
                countNode.textContent = visible + ' 部影片';
            }
            if (empty) {
                empty.hidden = visible !== 0;
            }
        };

        [searchInput, regionSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        if (resetButton) {
            resetButton.addEventListener('click', function () {
                if (searchInput) {
                    searchInput.value = '';
                }
                if (regionSelect) {
                    regionSelect.value = '';
                }
                if (yearSelect) {
                    yearSelect.value = '';
                }
                applyFilter();
            });
        }
    }

    const shareButton = document.querySelector('[data-share-button]');

    if (shareButton) {
        shareButton.addEventListener('click', function () {
            const url = window.location.href;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(function () {
                    shareButton.textContent = '链接已复制';
                });
            } else {
                window.prompt('复制链接', url);
            }
        });
    }
}());
