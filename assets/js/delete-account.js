/**
 * nyusie.com/delete-account — verifies the account owner with a 6-digit email code
 * (Supabase Auth email OTP, same principle as sign-up) and then asks the
 * request-account-deletion Edge Function to schedule deletion.
 *
 * Product rule: never show a technical error. Every failure ends in a friendly
 * message, and if the form can't work at all the email option is shown instead.
 */
(function () {
  "use strict";

  /** @type {{supabaseUrl:string, supabaseAnonKey:string, deletionFunction:string, webDeletionEnabled:boolean}} */
  var cfg = window.NYUSIE_CONFIG || {};
  var $ = function (id) { return document.getElementById(id); };

  var form = $("del-form"), emailRoute = $("email-route"), emailAlt = $("email-alt");
  var RESEND_SECONDS = 60;
  var state = { email: "", client: null, resendTimer: null };

  /** Shows the email-only route (used when the form is off or something fails). */
  function showEmailRoute(reason) {
    form.hidden = true;
    emailRoute.hidden = false;
    emailAlt.hidden = true;
    if (reason) {
      $("email-route-title").textContent = "Request by email instead";
    }
  }

  /** @returns {boolean} true when the web form can run. */
  function formAvailable() {
    return !!(cfg.webDeletionEnabled && cfg.supabaseUrl && cfg.supabaseAnonKey &&
      window.supabase && typeof window.supabase.createClient === "function");
  }

  if (!formAvailable()) { showEmailRoute(); return; }

  try {
    state.client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });
  } catch (e) { showEmailRoute(true); return; }

  form.hidden = false;
  emailRoute.hidden = true;
  emailAlt.hidden = false;

  /** Moves the visible step and stepper highlight. @param {1|2|3|4} n */
  function goTo(n) {
    $("step-email").hidden = n !== 1;
    $("step-code").hidden = n !== 2;
    $("step-confirm").hidden = n !== 3;
    $("step-done").hidden = n !== 4;
    ["st1", "st2", "st3"].forEach(function (id, i) {
      var el = $(id);
      el.className = (i + 1 < n) ? "done" : (i + 1 === n ? "active" : "");
    });
    var focusTarget = { 1: "email", 2: "code", 3: "delete-btn" }[n];
    if (focusTarget) { setTimeout(function () { $(focusTarget).focus(); }, 50); }
  }

  /** Sets a friendly status line. */
  function say(id, text, bad) {
    var el = $(id);
    el.textContent = text || "";
    el.className = "msg" + (bad ? " bad" : "");
  }

  /** Disables a button and swaps its label while work is in progress. */
  function busy(btn, on, label) {
    if (on) { btn.dataset.label = btn.textContent; btn.textContent = label; btn.disabled = true; }
    else { btn.textContent = btn.dataset.label || btn.textContent; btn.disabled = false; }
  }

  /** Starts the "Send a new code" countdown. */
  function startResendTimer() {
    var btn = $("resend-btn"), left = RESEND_SECONDS;
    clearInterval(state.resendTimer);
    btn.disabled = true;
    btn.textContent = "Send a new code in " + left + "s";
    state.resendTimer = setInterval(function () {
      left -= 1;
      if (left <= 0) { clearInterval(state.resendTimer); btn.disabled = false; btn.textContent = "Send a new code"; }
      else { btn.textContent = "Send a new code in " + left + "s"; }
    }, 1000);
  }

  /**
   * Asks Supabase to email a code. Never creates an account. For privacy we move on to
   * the code step whether or not an account exists, so this page can't be used to
   * check who has a Nyusie account. Only rate limits get their own message.
   * @returns {Promise<"sent"|"slow"|"failed">}
   */
  function sendCode(email) {
    return state.client.auth.signInWithOtp({ email: email, options: { shouldCreateUser: false } })
      .then(function (res) {
        var err = res && res.error;
        if (!err) return "sent";
        if (err.status === 429) return "slow";
        if (err.status === 400 || err.status === 422 || err.status === 404) return "sent"; // no account: don't reveal it
        return "failed";
      })
      .catch(function () { return "failed"; });
  }

  // Step 1: email
  $("step-email").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var email = $("email").value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { say("msg-email", "Please enter the email address on your Nyusie account.", true); return; }
    if (!$("ack").checked) { say("msg-email", "Please tick the box to confirm you understand.", true); return; }
    var btn = $("send-btn");
    busy(btn, true, "Sending…");
    say("msg-email", "");
    sendCode(email).then(function (result) {
      busy(btn, false);
      if (result === "slow") { say("msg-email", "We've sent a few codes already. Please wait a minute, then try again.", true); return; }
      if (result === "failed") { say("msg-email", "We couldn't send a code just now. Please try again in a moment, or use the email option below.", true); return; }
      state.email = email;
      $("sent-to").textContent = email;
      $("code").value = "";
      say("msg-code", "");
      goTo(2);
      startResendTimer();
    });
  });

  // Step 2: code
  $("code").addEventListener("input", function () { this.value = this.value.replace(/\D/g, "").slice(0, 6); });
  $("step-code").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var token = $("code").value.trim();
    if (!/^\d{6}$/.test(token)) { say("msg-code", "Enter the 6 digits from the email.", true); return; }
    var btn = $("verify-btn");
    busy(btn, true, "Checking…");
    state.client.auth.verifyOtp({ email: state.email, token: token, type: "email" })
      .then(function (res) {
        busy(btn, false);
        if (res && !res.error && res.data && res.data.session) {
          $("confirm-email").textContent = state.email;
          say("msg-confirm", "");
          goTo(3);
        } else {
          say("msg-code", "That code didn't match or has expired. Check the latest email, or send a new code.", true);
        }
      })
      .catch(function () { busy(btn, false); say("msg-code", "We couldn't check the code just now. Please try again in a moment.", true); });
  });

  $("resend-btn").addEventListener("click", function () {
    var btn = this;
    btn.disabled = true;
    sendCode(state.email).then(function (result) {
      if (result === "sent") { say("msg-code", "A new code is on its way."); startResendTimer(); }
      else { say("msg-code", "Please wait a minute before asking for another code.", true); startResendTimer(); }
    });
  });

  $("change-email").addEventListener("click", function () { clearInterval(state.resendTimer); goTo(1); });

  /** Formats the deletion date for people, in their own locale. */
  function formatDate(iso) {
    var d = iso ? new Date(iso) : null;
    if (!d || isNaN(d.getTime())) { d = new Date(Date.now() + 8 * 24 * 3600 * 1000); }
    try { return d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" }); }
    catch (e) { return d.toDateString(); }
  }

  // Step 3: confirm
  $("delete-btn").addEventListener("click", function () {
    var btn = this;
    busy(btn, true, "Deleting…");
    state.client.functions.invoke(cfg.deletionFunction, { body: { source: "web" } })
      .then(function (res) {
        if (res && !res.error && res.data && res.data.ok) {
          $("done-date").textContent = formatDate(res.data.deletion_date);
          goTo(4);
          state.client.auth.signOut({ scope: "local" }).catch(function () {});
        } else {
          busy(btn, false);
          say("msg-confirm", "We couldn't complete this just now. Please try again in a moment, or email privacy@nyusie.com from your account address.", true);
        }
      })
      .catch(function () {
        busy(btn, false);
        say("msg-confirm", "We couldn't complete this just now. Please try again in a moment, or email privacy@nyusie.com from your account address.", true);
      });
  });
})();
