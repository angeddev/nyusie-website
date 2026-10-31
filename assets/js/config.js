/**
 * Nyusie website settings. This is the only file you need to edit for the items below.
 *
 * supabaseUrl / supabaseAnonKey
 *   Needed for the waitlist (and later the delete-account form).
 *   Supabase > Project Settings > API Keys. Use the anon / publishable key, which is
 *   already public inside the app. NEVER put the service_role (secret) key here.
 *   While these are empty, the waitlist falls back to "email us".
 *
 * webDeletionEnabled
 *   Keep false until the delete-account Edge Function is deployed.
 *
 * launchAt
 *   When the site switches from "Join the waitlist" to "Get the app".
 *   -05:00 is Toronto time in November.
 *
 * appStoreUrl / playStoreUrl
 *   Store links used by the download buttons after launch.
 */
window.NYUSIE_CONFIG = {
  supabaseUrl: "",        // e.g. "https://abcdefghijkl.supabase.co"
  supabaseAnonKey: "",
  deletionFunction: "request-account-deletion",
  webDeletionEnabled: false,

  launchAt: "2026-11-06T08:00:00-05:00",
  appStoreUrl: "",        // e.g. "https://apps.apple.com/app/nyusie/id1234567890"
  playStoreUrl: "https://play.google.com/store/apps/details?id=com.nyusie.app"
};
