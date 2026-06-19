(function () {
    const data = window.MOVIE_SEARCH_DATA || [];
    const params = new URLSearchParams(window.location.search);
    const form = document.querySelector('[data-search-form]');
    const input = form ? form.querySelector('input[name="q"]') : null;
    const results = document.querySelector('[data-search-results]');
    const count = document.querySelector('[data-search-count]');
    const empty = document.querySelector('[data-search-empty]');
    const regionSelect = document.querySelector('[data-search-region]');
    const yearSelect = document.querySelector('[data-search-year]');
    const categorySelect = document.querySelector('[data-search-category]');
    const resetButton = document.querySelector('[data-search-reset]');

    if (!results) {
        return;
    }

    if (input && params.get('q')) {
        input.value = params.get('q');
    }

    const escapeHtml = function (value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    const cardTemplate = function (movie) {
        const text = [movie.title, movie.genre, movie.region].concat(movie.tags || []).join(' ');
        const tags = (movie.tags || []).slice(0, 6).join(' ');

        return `
                <a class="movie-card" href="${escapeHtml(movie.url)}" data-movie-card data-title="${escapeHtml(movie.title)}" data-region="${escapeHtml(movie.region)}" data-year="${escapeHtml(movie.year)}" data-text="${escapeHtml(text)}">
                    <span class="poster-wrap">
                        <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" class="poster-image" loading="lazy" onerror="this.closest('.poster-wrap').classList.add('image-missing'); this.remove();">
                        <span class="poster-fallback">${escapeHtml(movie.title)}</span>
                        <span class="movie-badge">${escapeHtml(movie.category)}</span>
                        <span class="movie-duration">${escapeHtml(movie.duration)}</span>
                        <span class="play-float">▶</span>
                    </span>
                    <span class="movie-card-body">
                        <strong>${escapeHtml(movie.title)}</strong>
                        <span class="movie-meta">
                            <span>★ ${escapeHtml(movie.rating)}</span>
                            <span>${escapeHtml(movie.year)}</span>
                            <span>${escapeHtml(movie.region)}</span>
                        </span>
                        <span class="movie-desc">${escapeHtml(movie.description)}</span>
                        <span class="movie-tags">${escapeHtml(tags)}</span>
                    </span>
                </a>`;
    };

    const applySearch = function () {
        const keyword = input ? input.value.trim().toLowerCase() : '';
        const region = regionSelect ? regionSelect.value : '';
        const year = yearSelect ? yearSelect.value : '';
        const category = categorySelect ? categorySelect.value : '';

        const matched = data.filter(function (movie) {
            const text = [
                movie.title,
                movie.description,
                movie.category,
                movie.region,
                movie.year,
                movie.genre,
                (movie.tags || []).join(' ')
            ].join(' ').toLowerCase();

            return (!keyword || text.includes(keyword)) &&
                (!region || movie.region === region) &&
                (!year || movie.year === year) &&
                (!category || movie.category === category);
        }).slice(0, 240);

        results.innerHTML = matched.map(cardTemplate).join('');

        if (count) {
            count.textContent = matched.length + ' 个结果';
        }
        if (empty) {
            empty.hidden = matched.length !== 0;
        }
    };

    [input, regionSelect, yearSelect, categorySelect].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applySearch);
            control.addEventListener('change', applySearch);
        }
    });

    if (resetButton) {
        resetButton.addEventListener('click', function () {
            if (input) {
                input.value = '';
            }
            if (regionSelect) {
                regionSelect.value = '';
            }
            if (yearSelect) {
                yearSelect.value = '';
            }
            if (categorySelect) {
                categorySelect.value = '';
            }
            applySearch();
        });
    }

    if (params.get('q')) {
        applySearch();
    }
}());
