import { NextResponse } from "next/server";

import { createClient, createServiceClient } from "@/lib/supabase/server";

interface SaveBody {
  /** Partial or full CardHackerProfile JSON to merge into profiles.data. */
  profile: Record<string, unknown>;
  /** When true, also flip onboarded = true. Default false (mid-flow draft). */
  complete?: boolean;
}

/**
 * Manual profile-save endpoint. Two callers:
 *   1. The user clicking a "Save and continue later" button in the onboarding
 *      UI — saves the partial draft so they can resume in a later session.
 *   2. The agent itself (future) when we wire up tool calling — until then the
 *      onboarding chat route handles completion via JSON-block parsing.
 *
 * Uses the service client because RLS on profiles allows update but we want
 * to be defensive about field validation here. Auth is enforced via Supabase
 * session — the request must come from a logged-in user.
 */
export async function POST(req: Request) {
  // 1. Auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse body
  let body: SaveBody;
  try {
    body = (await req.json()) as SaveBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.profile || typeof body.profile !== "object" || Array.isArray(body.profile)) {
    return NextResponse.json(
      { error: "profile (object) required" },
      { status: 400 },
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const profileToSave: Record<string, unknown> = {
    ...body.profile,
    schema_version: 1,
    last_updated: today,
  };

  const service = createServiceClient();
  const { error } = await service
    .from("profiles")
    .update({
      data: profileToSave,
      ...(body.complete ? { onboarded: true } : {}),
    })
    .eq("id", user.id);

  if (error) {
    console.error("[onboarding/save] update failed", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    onboarded: body.complete === true,
  });
}
