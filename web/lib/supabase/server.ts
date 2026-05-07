import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

/**
 * Server-side Supabase client (uses anon key + user's session cookie).
 * Use in server components, Server Actions, and API routes for normal CRUD.
 * RLS is enforced — operations run as the logged-in user.
 */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: CookieToSet[]) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components cannot write cookies. Ignored — middleware refreshes session.
          }
        },
      },
    },
  );
}

/**
 * Service-role Supabase client. Bypasses RLS. Use ONLY for:
 * - Stripe webhook handlers (subscriptions table writes)
 * - Background jobs / cron
 * - Admin operations
 *
 * NEVER expose service role key to the browser.
 */
import { createClient as createSbClient } from "@supabase/supabase-js";

export function createServiceClient() {
  return createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
