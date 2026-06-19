function initializeMoviePlayer(source) {
  var video = document.getElementById("moviePlayer");
  var cover = document.getElementById("playerCover");
  var button = document.getElementById("playerStart");
  var loaded = false;
  var hlsInstance = null;

  if (!video || !cover || !button || !source) {
    return;
  }

  function load() {
    if (loaded) {
      return;
    }
    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function start() {
    load();
    cover.classList.add("is-hidden");
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  button.addEventListener("click", start);
  cover.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (!loaded) {
      start();
    }
  });
  video.addEventListener("play", function () {
    cover.classList.add("is-hidden");
  });
  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
