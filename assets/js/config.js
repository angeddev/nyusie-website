/**
 * Nyusie website settings.
 *
 * The delete-account form stays OFF (and visitors see the "request by email" option)
 * until all of these are true:
 *   1. Resend is connected to Supabase (codes must actually reach people's inboxes),
 *   2. the request-account-deletion Edge Function is deployed,
 *   3. the values below are filled in and webDeletionEnabled is set to true.
 *
 * The anon (publishable) key is safe to put here: it is the same public key the app
 * ships with, and Row Level Security protects the data. NEVER put the service_role key here.
 */
window.NYUSIE_CONFIG = {
  supabaseUrl: "",        // e.g. "https://abcdefghijkl.supabase.co"
  supabaseAnonKey: "",    // Supabase → Project Settings → API Keys → anon / publishable key
  deletionFunction: "request-account-deletion",
  webDeletionEnabled: false
};
