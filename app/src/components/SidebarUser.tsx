"use client";

import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

export function SidebarUser({ email }: { email: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400 truncate max-w-[160px]">
        {email}
      </span>
      <button
        onClick={handleSignOut}
        className="text-xs text-gray-500 hover:text-white transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}
