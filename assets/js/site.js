/**
 * Points the "Download on the App Store" / "Get it on Google Play" buttons at the links
 * in config.js. If a link isn't set yet, the button says "Coming soon" and isn't clickable.
 */
(function () {
  "use strict";
  var cfg = window.NYUSIE_CONFIG || {};
  var urls = { app: cfg.appStoreUrl, play: cfg.playStoreUrl };
  document.querySelectorAll("a[data-store]").forEach(function (a) {
    var url = urls[a.getAttribute("data-store")];
    if (url) {
      a.href = url;
      a.rel = "noopener";
    } else {
      a.removeAttribute("href");
      a.setAttribute("aria-disabled", "true");
      var small = a.querySelector("small");
      if (small) small.textContent = "Coming soon";
    }
  });
})();
