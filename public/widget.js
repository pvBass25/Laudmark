// Trustwall live widget — async, lazy-loaded, no framework, < 50KB
// Usage: <script async src="https://yourdomain.com/widget.js" data-wall="WALL_ID"></script>
(function () {
  'use strict';

  function injectJsonLd(jsonLd) {
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(s);
  }

  function loadWall(scriptEl) {
    var wallId = scriptEl.getAttribute('data-wall');
    if (!wallId) return;

    // Derive host from this script's src (works even if async)
    var src = scriptEl.src || '';
    var host = src.indexOf('/widget.js') !== -1
      ? src.split('/widget.js')[0]
      : window.location.origin;

    // Create a placeholder that reserves space → prevents layout shift
    var container = document.createElement('div');
    container.setAttribute('data-trustwall-wall', wallId);
    container.style.cssText = 'min-height:200px;box-sizing:border-box;';
    scriptEl.parentNode.insertBefore(container, scriptEl.nextSibling);

    function fetch_and_render() {
      fetch(host + '/api/embed/' + wallId)
        .then(function (r) {
          if (!r.ok) throw new Error('embed ' + r.status);
          return r.json();
        })
        .then(function (data) {
          container.style.minHeight = '';
          container.innerHTML = data.html || '';
          if (data.jsonLd) injectJsonLd(data.jsonLd);
        })
        .catch(function () {
          container.style.minHeight = '';
        });
    }

    // Lazy-load: only fetch when container is near the viewport
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          obs.disconnect();
          fetch_and_render();
        }
      }, { rootMargin: '200px' });
      obs.observe(container);
    } else {
      // Fallback for old browsers
      fetch_and_render();
    }
  }

  function init() {
    var scripts = document.querySelectorAll('script[data-wall]');
    for (var i = 0; i < scripts.length; i++) {
      loadWall(scripts[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
