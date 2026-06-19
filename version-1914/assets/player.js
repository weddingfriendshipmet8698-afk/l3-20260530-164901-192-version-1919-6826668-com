(function () {
    const players = Array.from(document.querySelectorAll('video[data-hls-src]'));

    players.forEach(function (video) {
        const source = video.dataset.hlsSrc;
        const frame = video.closest('.player-frame');
        const loading = frame ? frame.querySelector('[data-player-loading]') : null;
        const errorBox = frame ? frame.querySelector('[data-player-error]') : null;
        const toggle = frame ? frame.querySelector('[data-player-toggle]') : null;

        const hideLoading = function () {
            if (loading) {
                loading.hidden = true;
            }
        };

        const showError = function (message) {
            hideLoading();
            if (errorBox) {
                errorBox.hidden = false;
                errorBox.textContent = message;
            }
        };

        if (!source) {
            showError('未找到播放地址');
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(source);
            hls.attachMedia(video);

            hls.on(window.Hls.Events.MANIFEST_PARSED, hideLoading);
            hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                if (data && data.fatal) {
                    showError('视频加载失败，请刷新或稍后重试');
                    hls.destroy();
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', hideLoading, { once: true });
        } else {
            showError('当前浏览器不支持 HLS 播放');
        }

        if (toggle) {
            toggle.addEventListener('click', function () {
                video.play();
            });
        }

        video.addEventListener('play', function () {
            if (frame) {
                frame.classList.add('is-playing');
            }
        });

        video.addEventListener('pause', function () {
            if (frame) {
                frame.classList.remove('is-playing');
            }
        });
    });
}());
