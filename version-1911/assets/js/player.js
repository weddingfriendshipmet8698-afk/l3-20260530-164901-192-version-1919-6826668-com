(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var player = document.querySelector('[data-player]');
    if (!player) {
      return;
    }

    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var message = player.querySelector('[data-player-message]');
    var source = player.getAttribute('data-src');
    var hlsInstance = null;

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function loadScript(src) {
      return new Promise(function (resolve, reject) {
        var existed = document.querySelector('script[src="' + src + '"]');
        if (existed) {
          existed.addEventListener('load', resolve, { once: true });
          existed.addEventListener('error', reject, { once: true });
          if (window.Hls) {
            resolve();
          }
          return;
        }

        var script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    function playVideo() {
      if (!source || !video) {
        setMessage('播放源缺失。');
        return;
      }

      if (button) {
        button.classList.add('is-hidden');
      }

      setMessage('正在初始化播放源...');

      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.play().then(function () {
          setMessage('正在播放');
        }).catch(function () {
          setMessage('请再次点击播放器开始播放。');
        });
        return;
      }

      function attachHls() {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().then(function () {
              setMessage('正在播放');
            }).catch(function () {
              setMessage('请再次点击播放器开始播放。');
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage('播放遇到错误，正在尝试恢复。');
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
              } else {
                hlsInstance.destroy();
              }
            }
          });
        } else {
          video.src = source;
          setMessage('当前浏览器可能不支持 HLS，请使用支持 m3u8 的浏览器。');
        }
      }

      if (window.Hls) {
        attachHls();
      } else {
        loadScript('https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js')
          .then(attachHls)
          .catch(function () {
            video.src = source;
            setMessage('HLS 组件加载失败，已尝试使用浏览器原生播放。');
          });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    player.addEventListener('dblclick', playVideo);
  });
})();
