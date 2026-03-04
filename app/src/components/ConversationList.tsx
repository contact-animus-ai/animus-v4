"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Conversation {
  id: string;
  title: string | null;
  updated_at: string;
}

export function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeId = searchParams.get("id");

  useEffect(() => {
    fetch("/api/conversations")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setConversations(data);
      })
      .catch(() => {});
  }, []);

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div className="space-y-1">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => router.push(`/chat?id=${conv.id}`)}
          className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors truncate ${
            activeId === conv.id
              ? "bg-[#222] text-white"
              : "text-gray-400 hover:bg-[#1a1a1a] hover:text-white"
          }`}
        >
          <div className="truncate">{conv.title || "New conversation"}</div>
          <div className="text-xs text-gray-500 mt-0.5">
            {timeAgo(conv.updated_at)}
          </div>
        </button>
      ))}
      {conversations.length === 0 && (
        <p className="text-xs text-gray-500 text-center py-4">
          No conversations yet
        </p>
      )}
    </div>
  );
}
