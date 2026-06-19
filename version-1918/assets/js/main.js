(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function play() {
      stop();
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        play();
      });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function createResult(item) {
    var link = document.createElement("a");
    link.className = "search-result-item";
    link.href = item.url;

    var image = document.createElement("img");
    image.src = item.cover;
    image.alt = item.title;
    image.loading = "lazy";

    var copy = document.createElement("span");
    var title = document.createElement("strong");
    var meta = document.createElement("em");
    title.textContent = item.title;
    meta.textContent = item.meta;
    copy.appendChild(title);
    copy.appendChild(meta);

    link.appendChild(image);
    link.appendChild(copy);
    return link;
  }

  function setupSearch() {
    if (!Array.isArray(siteSearchItems)) {
      return;
    }
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    inputs.forEach(function (input) {
      var box = input.closest(".search-box");
      var panel = box ? box.querySelector("[data-search-results]") : null;
      if (!panel) {
        return;
      }

      function update() {
        var query = input.value.trim().toLowerCase();
        panel.innerHTML = "";
        if (!query) {
          panel.classList.remove("is-open");
          return;
        }
        var results = siteSearchItems.filter(function (item) {
          return item.text.toLowerCase().indexOf(query) !== -1;
        }).slice(0, 10);
        results.forEach(function (item) {
          panel.appendChild(createResult(item));
        });
        panel.classList.toggle("is-open", results.length > 0);
      }

      input.addEventListener("input", update);
      input.addEventListener("focus", update);
      document.addEventListener("click", function (event) {
        if (box && !box.contains(event.target)) {
          panel.classList.remove("is-open");
        }
      });
    });
  }

  function setupLocalFilter() {
    var input = document.querySelector("[data-local-filter]");
    var year = document.querySelector("[data-year-filter]");
    var type = document.querySelector("[data-type-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    var empty = document.querySelector("[data-empty-message]");
    if (!input || cards.length === 0) {
      return;
    }

    function apply() {
      var query = input.value.trim().toLowerCase();
      var yearValue = year ? year.value : "";
      var typeValue = type ? type.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchYear = !yearValue || card.getAttribute("data-year") === yearValue;
        var matchType = !typeValue || card.getAttribute("data-type") === typeValue;
        var match = matchQuery && matchYear && matchType;
        card.hidden = !match;
        if (match) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    input.addEventListener("input", apply);
    if (year) {
      year.addEventListener("change", apply);
    }
    if (type) {
      type.addEventListener("change", apply);
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupLocalFilter();
  });
}());
