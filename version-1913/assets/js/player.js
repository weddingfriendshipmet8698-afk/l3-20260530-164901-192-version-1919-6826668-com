(function () {
    var hlsConstructorPromise = null;

    function setStatus(box, message) {
        var status = box.querySelector('[data-player-status]');
        if (status) {
            status.textContent = message || '';
        }
    }

    function getHlsConstructor() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (window.MovieSiteHls) {
            return Promise.resolve(window.MovieSiteHls);
        }

        if (!hlsConstructorPromise) {
            hlsConstructorPromise = import('./hls-dru42stk.js').then(function (module) {
                window.MovieSiteHls = module.H;
                return module.H;
            });
        }

        return hlsConstructorPromise;
    }

    function attachNative(video, src) {
        video.src = src;
        return Promise.resolve();
    }

    function attachHls(video, src, Hls) {
        return new Promise(function (resolve, reject) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(src);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                resolve();
            });

            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    reject(new Error('视频加载失败'));
                    hls.destroy();
                }
            });

            video._movieSiteHls = hls;
        });
    }

    function playBox(box) {
        var video = box.querySelector('video');
        var src = box.getAttribute('data-src');

        if (!video || !src) {
            setStatus(box, '视频源暂不可用');
            return;
        }

        setStatus(box, '正在加载视频');

        var ready;

        if (box.getAttribute('data-ready') === '1') {
            ready = Promise.resolve();
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            ready = attachNative(video, src);
        } else {
            ready = getHlsConstructor().then(function (Hls) {
                if (Hls && Hls.isSupported && Hls.isSupported()) {
                    return attachHls(video, src, Hls);
                }
                throw new Error('浏览器不支持当前视频格式');
            });
        }

        ready.then(function () {
            box.setAttribute('data-ready', '1');
            box.classList.add('is-ready');
            setStatus(box, '');
            return video.play();
        }).catch(function (error) {
            box.classList.remove('is-ready');
            setStatus(box, error && error.message ? error.message : '视频播放失败');
        });
    }

    document.querySelectorAll('[data-player]').forEach(function (box) {
        var trigger = box.querySelector('[data-player-trigger]');
        var video = box.querySelector('video');

        if (trigger) {
            trigger.addEventListener('click', function () {
                playBox(box);
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (box.getAttribute('data-ready') !== '1' || video.paused) {
                    playBox(box);
                }
            });
        }
    });
})();
