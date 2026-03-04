import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { ConversationList } from "@/components/ConversationList";
import { SidebarUser } from "@/components/SidebarUser";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-[280px] bg-[#111] border-r border-[#222] flex flex-col h-screen fixed left-0 top-0">
        {/* New Chat Button */}
        <div className="p-4">
          <a
            href="/chat"
            className="block w-full bg-[#222] hover:bg-[#333] text-white text-center rounded-lg p-3 text-sm font-medium transition-colors"
          >
            + New Chat
          </a>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2">
          <ConversationList />
        </div>

        {/* User Info */}
        <div className="border-t border-[#222] p-4">
          <SidebarUser email={user.email || ""} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-[280px] flex-1 min-h-screen">{children}</main>
    </div>
  );
}
