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
  supabaseUrl: "https://ncrzeisyrzelhuwmnwxc.supabase.co",        // e.g. "https://abcdefghijkl.supabase.co"
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jcnplaXN5cnplbGh1d21ud3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzOTQ1MzAsImV4cCI6MjEwMzk3MDUzMH0.Hav7qhKkHxejiKvbeiTWOUs0i-WFRt1r5h68jKwfCVk",
  deletionFunction: "request-account-deletion",
  webDeletionEnabled: false,

  launchAt: "2026-11-06T08:00:00-05:00",
  appStoreUrl: "",        // e.g. "https://apps.apple.com/app/nyusie/id1234567890"
  playStoreUrl: "https://play.google.com/store/apps/details?id=com.nyusie.app"
};
