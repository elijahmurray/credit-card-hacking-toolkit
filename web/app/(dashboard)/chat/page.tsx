import { redirect } from "next/navigation";

import { ChatWindow } from "@/components/chat/chat-window";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // The (dashboard) layout (auth-builder) is expected to gate this, but we
    // double-check here so this route never renders unauthenticated.
    redirect("/login");
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("id", user.id)
    .maybeSingle();

  // TODO: /onboarding route is owned by another agent and may not exist yet.
  // When it lands, this redirect will start working. For now an unboarded user
  // just lands in chat and the agent will guide them through getting-started.
  if (profileRow && profileRow.onboarded === false) {
    // Soft redirect — comment out if /onboarding is not yet implemented.
    // redirect("/onboarding");
  }

  return (
    <div className="flex h-full flex-col">
      <ChatWindow />
    </div>
  );
}
