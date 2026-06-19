(function () {
  var box = document.querySelector('[data-player]');
  if (!box) {
    return;
  }
  var video = box.querySelector('video');
  var mask = box.querySelector('.player-mask');
  var button = box.querySelector('.play-btn');
  var stream = box.getAttribute('data-stream');
  var hlsInstance = null;
  var ready = false;

  var prepare = function () {
    if (!video || !stream || ready) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
    } else {
      video.src = stream;
    }
    ready = true;
  };

  var start = function () {
    prepare();
    if (mask) {
      mask.classList.add('is-hidden');
    }
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  };

  if (button) {
    button.addEventListener('click', start);
  }
  if (mask) {
    mask.addEventListener('click', start);
  }
  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  }
  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
})();
