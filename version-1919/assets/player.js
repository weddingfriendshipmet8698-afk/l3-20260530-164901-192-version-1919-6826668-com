function initMoviePlayer(streamUrl) {
    var video = document.getElementById('moviePlayer');
    var overlay = document.getElementById('playerOverlay');
    var button = document.getElementById('playerButton');
    if (!video || !overlay || !button || !streamUrl) {
        return;
    }

    var ready = false;
    var hlsInstance = null;

    function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    function start() {
        overlay.classList.add('is-hidden');
        video.controls = true;
        if (ready) {
            playVideo();
            return;
        }
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            playVideo();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                playVideo();
            });
            return;
        }
        video.src = streamUrl;
        playVideo();
    }

    overlay.addEventListener('click', start);
    button.addEventListener('click', function (event) {
        event.stopPropagation();
        start();
    });
    video.addEventListener('click', function () {
        if (!ready) {
            start();
        }
    });
    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
