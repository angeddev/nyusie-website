/**
 * nyusie.com/waitlist: adds an email to the Supabase "waitlist" table.
 * The website can only add rows; nobody can read the list from the website.
 * Never shows a technical error: every failure ends in a friendly message,
 * and if Supabase isn't configured the form falls back to "email us".
 */
(function () {
  "use strict";

  var cfg = window.NYUSIE_CONFIG || {};
  var $ = function (id) { return document.getElementById(id); };
  var form = $("wl-form"), msg = $("wl-msg"), btn = $("wl-btn");
  if (!form) return;
  var defaultMsg = msg.innerHTML;

  /** @returns {object|null} a Supabase client, or null if the site isn't configured. */
  function client() {
    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey || !window.supabase) return null;
    try {
      return window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
      });
    } catch (e) { return null; }
  }

  /** Shows a short message under the button. */
  function say(text, bad) {
    msg.innerHTML = text;
    msg.style.color = bad ? "#B0264F" : "";
  }

  /** Swaps the form for the "You're on the list" message. */
  function done() {
    form.hidden = true;
    $("wl-done").hidden = false;
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var email = $("wl-email").value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      say("Please enter a valid email address.", true); $("wl-email").focus(); return;
    }
    if (!$("wl-consent").checked) { say("Please tick the box so we can email you.", true); return; }
    if ($("wl-company").value) { done(); return; } // filled by bots only

    var sb = client();
    if (!sb) {
      say('The waitlist isn\'t open online yet. Email <a href="mailto:support@nyusie.com?subject=Add%20me%20to%20the%20Nyusie%20waitlist">support@nyusie.com</a> and we\'ll add you.', true);
      return;
    }

    btn.disabled = true; btn.textContent = "Joining…"; say(defaultMsg);
    sb.from("waitlist").insert({ email: email, consent: true, source: "website" })
      .then(function (res) {
        var err = res && res.error;
        if (!err || err.code === "23505") { done(); return; } // 23505 = already on the list
        throw err;
      })
      .catch(function () {
        btn.disabled = false; btn.textContent = "Join the waitlist";
        say("We couldn't add you just now. Please try again in a moment.", true);
      });
  });
})();
