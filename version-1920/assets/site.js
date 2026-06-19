(function () {
  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.from((parent || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMobileMenu() {
    const button = qs('[data-mobile-menu-button]');
    const menu = qs('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      const isHidden = menu.hasAttribute('hidden');
      if (isHidden) {
        menu.removeAttribute('hidden');
        button.textContent = '×';
      } else {
        menu.setAttribute('hidden', '');
        button.textContent = '☰';
      }
    });
  }

  function initCategoryFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      const keyword = qs('[data-filter-keyword]', scope);
      const type = qs('[data-filter-type]', scope);
      const year = qs('[data-filter-year]', scope);
      const reset = qs('[data-filter-reset]', scope);
      const list = qs('[data-filter-list]', scope.parentElement);
      const note = qs('[data-result-note]', scope.parentElement);
      const cards = qsa('.movie-card', list);

      function applyFilter() {
        const query = normalize(keyword && keyword.value);
        const typeValue = normalize(type && type.value);
        const yearValue = normalize(year && year.value);
        let visibleCount = 0;

        cards.forEach(function (card) {
          const haystack = normalize([
            card.dataset.title,
            card.dataset.type,
            card.dataset.year,
            card.dataset.region,
            card.dataset.genre,
            card.dataset.tags
          ].join(' '));

          const matchedKeyword = !query || haystack.includes(query);
          const matchedType = !typeValue || normalize(card.dataset.type) === typeValue;
          const matchedYear = !yearValue || normalize(card.dataset.year) === yearValue;
          const visible = matchedKeyword && matchedType && matchedYear;

          card.classList.toggle('is-filter-hidden', !visible);
          if (visible) {
            visibleCount += 1;
          }
        });

        if (note) {
          note.textContent = '当前显示 ' + visibleCount + ' 部内容';
        }
      }

      [keyword, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });

      if (reset) {
        reset.addEventListener('click', function () {
          if (keyword) keyword.value = '';
          if (type) type.value = '';
          if (year) year.value = '';
          applyFilter();
        });
      }
    });
  }

  function initPlayers() {
    qsa('[data-play-button]').forEach(function (button) {
      button.addEventListener('click', function () {
        const card = button.closest('.player-card');
        const video = qs('[data-video-player]', card);
        const message = qs('[data-player-message]', card);

        if (!video) {
          return;
        }

        const source = video.dataset.src;
        if (!source) {
          if (message) {
            message.textContent = '当前影片未配置播放源。';
          }
          return;
        }

        button.classList.add('is-hidden');

        if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);

          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {
              if (message) {
                message.textContent = '播放源已加载，请再次点击播放器开始播放。';
              }
            });
          });

          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (message) {
              message.textContent = '播放器提示：' + (data && data.details ? data.details : '播放源加载异常');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {});
          }, { once: true });
        } else {
          video.src = source;
          if (message) {
            message.textContent = '当前浏览器需要加载 HLS 播放库后才能播放 m3u8。';
          }
        }
      });
    });
  }

  function buildMovieCard(movie) {
    const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a href="' + escapeHtml(movie.url) + '" class="poster-link" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <span class="poster-wrap">',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <span class="poster-mask"></span>',
      '      <span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
      '    </span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + '</p>',
      '    <p class="movie-line">' + escapeHtml(movie.oneLine || '') + '</p>',
      '    <div class="tag-list">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    const page = qs('[data-search-page]');
    const movies = window.MOVIES || [];

    if (!page || !movies.length) {
      return;
    }

    const input = qs('[data-search-input]', page);
    const type = qs('[data-search-type]', page);
    const year = qs('[data-search-year]', page);
    const clear = qs('[data-search-clear]', page);
    const note = qs('[data-search-note]', page);
    const results = qs('[data-search-results]', page);
    const params = new URLSearchParams(window.location.search);

    const typeValues = Array.from(new Set(movies.map(function (movie) { return movie.type; }))).sort();
    const yearValues = Array.from(new Set(movies.map(function (movie) { return movie.year; }))).sort().reverse();

    typeValues.forEach(function (value) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      type.appendChild(option);
    });

    yearValues.forEach(function (value) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      year.appendChild(option);
    });

    if (params.get('q')) {
      input.value = params.get('q');
    }

    function render() {
      const query = normalize(input.value);
      const selectedType = normalize(type.value);
      const selectedYear = normalize(year.value);

      const matched = movies.filter(function (movie) {
        const haystack = normalize([
          movie.title,
          movie.type,
          movie.region,
          movie.year,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' '));

        return (!query || haystack.includes(query)) &&
          (!selectedType || normalize(movie.type) === selectedType) &&
          (!selectedYear || normalize(movie.year) === selectedYear);
      }).slice(0, 120);

      results.innerHTML = matched.map(buildMovieCard).join('');
      note.textContent = matched.length ? '当前显示前 ' + matched.length + ' 条匹配结果。' : '没有找到匹配内容，请尝试更换关键词。';
    }

    [input, type, year].forEach(function (control) {
      control.addEventListener('input', render);
      control.addEventListener('change', render);
    });

    clear.addEventListener('click', function () {
      input.value = '';
      type.value = '';
      year.value = '';
      render();
    });

    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initCategoryFilters();
    initPlayers();
    initSearchPage();
  });
})();
