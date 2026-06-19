(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function initMobileMenu() {
    var toggle = document.querySelector(".mobile-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      menu.hidden = expanded;
    });
  }

  function initHeroCarousel() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    start();
  }

  function initFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".search-card"));
    var input = document.querySelector("[data-filter-input]");
    var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));
    if (!cards.length || (!input && !selects.length)) {
      return;
    }
    function getValue(name) {
      var select = document.querySelector('[data-filter-select="' + name + '"]');
      return select ? select.value.trim().toLowerCase() : "";
    }
    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var year = getValue("year");
      var region = getValue("region");
      var type = getValue("type");
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-year") || "",
          card.getAttribute("data-type") || "",
          card.getAttribute("data-tags") || ""
        ].join(" ").toLowerCase();
        var matched = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (year && (card.getAttribute("data-year") || "").toLowerCase() !== year) {
          matched = false;
        }
        if (region && (card.getAttribute("data-region") || "").toLowerCase() !== region) {
          matched = false;
        }
        if (type && (card.getAttribute("data-type") || "").toLowerCase() !== type) {
          matched = false;
        }
        card.classList.toggle("is-hidden", !matched);
      });
    }
    if (input) {
      input.addEventListener("input", applyFilter);
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        input.value = q;
        applyFilter();
      }
    }
    selects.forEach(function (select) {
      select.addEventListener("change", applyFilter);
    });
  }

  window.setupPlayer = function (options) {
    var video = document.querySelector(options.videoSelector || "#movie-player");
    var overlay = document.querySelector(options.overlaySelector || "#player-overlay");
    var playButton = document.querySelector(options.playButtonSelector || "#player-play");
    var loaded = false;
    var hlsInstance = null;
    if (!video || !options.url) {
      return;
    }
    function loadVideo() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(options.url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hlsInstance) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = options.url;
      }
    }
    function start() {
      loadVideo();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }
    if (overlay) {
      overlay.addEventListener("click", start);
    }
    if (playButton) {
      playButton.addEventListener("click", function (event) {
        event.stopPropagation();
        start();
      });
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    initMobileMenu();
    initHeroCarousel();
    initFilters();
  });
})();
