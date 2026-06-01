// Trustwall live widget — < 50KB, no framework, async
// Full implementation in M4.
(function () {
  var scripts = document.querySelectorAll('script[data-wall]');
  scripts.forEach(function (script) {
    var wallId = script.getAttribute('data-wall');
    if (!wallId) return;
    var host = script.src.replace(/\/widget\.js.*$/, '');
    var container = document.createElement('div');
    container.setAttribute('data-trustwall', wallId);
    script.parentNode.insertBefore(container, script.nextSibling);
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        fetch(host + '/api/embed/' + wallId)
          .then(function (r) { return r.text(); })
          .then(function (html) { container.innerHTML = html; });
      });
    }, { rootMargin: '200px' });
    observer.observe(container);
  });
})();
