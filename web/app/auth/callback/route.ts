import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth + magic-link callback. Supabase redirects users here with `?code=...`
 * after they click the email link or complete OAuth. We exchange the code for
 * a session, then route based on whether the user has finished onboarding.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const errorDescription = url.searchParams.get("error_description");
  const next = url.searchParams.get("next");

  if (errorDescription) {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("error", errorDescription);
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("error", exchangeError.message);
    return NextResponse.redirect(loginUrl);
  }

  // Honour explicit `next` param if Supabase forwarded one.
  if (next && next.startsWith("/")) {
    return NextResponse.redirect(new URL(next, url.origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  // Check onboarding status. profiles row is auto-created by the
  // handle_new_user trigger (see supabase/migrations/0001_initial_schema.sql).
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("id", user.id)
    .maybeSingle();

  const onboarded = profile?.onboarded === true;
  const destination = onboarded ? "/chat" : "/onboarding";
  return NextResponse.redirect(new URL(destination, url.origin));
}
