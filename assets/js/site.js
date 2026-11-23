/**
 * Launch-day store badges. Each badge links to the store URL in config.js.
 * If a URL isn't set yet, that badge is hidden (official badges can't be relabelled),
 * and for the App Store a short "coming soon" line is shown instead.
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
      a.hidden = true;
      if (a.getAttribute("data-store") === "app") {
        var note = document.getElementById("ios-soon");
        if (note) note.hidden = false;
      }
    }
  });
})();

/**
 * "Download now" buttons: on a phone they go straight to the right store via /get/
 * (iPhone → App Store, Android → Google Play); on a laptop they scroll to the
 * download section with the badges and QR code. The data-download value labels
 * where the tap came from, for analytics later.
 */
(function () {
  "use strict";
  var ua = navigator.userAgent || "";
  var phone = /iPhone|iPad|iPod|Android/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (!phone) return;
  document.querySelectorAll("a[data-download]").forEach(function (a) {
    a.href = "/get/?src=" + encodeURIComponent(a.getAttribute("data-download"));
  });
})();
