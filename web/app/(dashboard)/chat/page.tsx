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

  // /onboarding now exists. Send un-onboarded users there to build their
  // profile via the conversational getting-started flow before they can chat.
  if (profileRow && profileRow.onboarded === false) {
    redirect("/onboarding");
  }

  return (
    <div className="flex h-full flex-col">
      <ChatWindow />
    </div>
  );
}
