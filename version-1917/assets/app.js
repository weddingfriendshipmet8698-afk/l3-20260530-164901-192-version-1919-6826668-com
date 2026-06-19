(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  var searchInput = document.querySelector('[data-search-input]');
  var clearButton = document.querySelector('[data-clear-search]');
  var categoryFilter = document.querySelector('[data-category-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var apply = function () {
    if (!searchInput || !cards.length) {
      return;
    }
    var q = searchInput.value.trim().toLowerCase();
    var category = categoryFilter ? categoryFilter.value : '';
    cards.forEach(function (card) {
      var haystack = (card.getAttribute('data-search') || '').toLowerCase();
      var cardCategory = card.getAttribute('data-category') || '';
      var matched = (!q || haystack.indexOf(q) !== -1) && (!category || cardCategory === category);
      card.classList.toggle('hidden', !matched);
    });
  };
  if (searchInput) {
    if (searchInput.hasAttribute('data-url-query')) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        searchInput.value = q;
      }
    }
    searchInput.addEventListener('input', apply);
    apply();
  }
  if (categoryFilter) {
    categoryFilter.addEventListener('change', apply);
  }
  if (clearButton && searchInput) {
    clearButton.addEventListener('click', function () {
      searchInput.value = '';
      if (categoryFilter) {
        categoryFilter.value = '';
      }
      apply();
      searchInput.focus();
    });
  }
})();
