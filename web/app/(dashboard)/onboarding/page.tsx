import { redirect } from "next/navigation";

import { OnboardingChat } from "@/components/onboarding/onboarding-chat";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface OnboardingPageProps {
  searchParams: Promise<{ force?: string }>;
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // The (dashboard) layout already gates this, but keep the safety net.
    redirect("/login");
  }

  const sp = await searchParams;
  const force = sp.force === "true" || sp.force === "1";

  // If the user is already onboarded and didn't explicitly request a redo,
  // bounce them to /chat. The "redo my profile" link from /profile sets
  // ?force=true to override.
  if (!force) {
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("onboarded")
      .eq("id", user.id)
      .maybeSingle();
    if (profileRow?.onboarded === true) {
      redirect("/chat");
    }
  }

  return (
    <div className="flex h-full min-h-[calc(100vh-8rem)] flex-col">
      <OnboardingChat />
    </div>
  );
}
