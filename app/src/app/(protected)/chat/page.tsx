"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Mail, Shield, Loader2, Sparkles, Search, MailPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import StrategyDocument from "@/components/app/StrategyDocument";
import { createBrowserClient } from "@supabase/ssr";
import * as api from "@/lib/api";
import { Checkbox } from "@/components/ui/checkbox";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  message_type?: "text" | "audit_result" | "email_components";
  metadata?: Record<string, unknown>;
  created_at?: string;
};

// --- Typing Indicator ---
function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full gradient-teal flex items-center justify-center flex-shrink-0">
        <Bot size={16} className="text-primary-foreground" />
      </div>
      <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

// --- Audit Result Card ---
function AuditCard({ metadata, onConfirm }: { metadata: Record<string, unknown> | undefined; onConfirm?: (selected: string[]) => void }) {
  const healthScore = (metadata?.health_score as number) ?? 0;
  const opportunities = (metadata?.opportunities as Array<{ title?: string; description?: string }>) ?? [];
  const estimatedRevenue = (metadata?.estimated_revenue as string) ?? "$0";
  const [selected, setSelected] = useState<string[]>(opportunities.map((_: unknown, i: number) => String(i)));

  const toggleItem = (idx: string) => {
    setSelected((prev) => prev.includes(idx) ? prev.filter((s) => s !== idx) : [...prev, idx]);
  };

  // Health score ring
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (healthScore / 100) * circumference;

  return (
    <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-5">
      <div className="flex items-center gap-5">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
            <circle cx="40" cy="40" r={radius} fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
              strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
              className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-primary">{healthScore}</span>
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Shield size={16} className="text-primary" /> Email Health Score
          </div>
          <div className="text-xs text-muted-foreground mt-1">Based on 14-point audit</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Opportunities</div>
        {opportunities.map((opp, i: number) => (
          <label key={i} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-secondary/30 cursor-pointer transition-colors">
            <Checkbox
              checked={selected.includes(String(i))}
              onCheckedChange={() => toggleItem(String(i))}
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">{typeof opp === "string" ? opp : opp.title}</div>
              {typeof opp !== "string" && opp.description && <div className="text-xs text-muted-foreground mt-0.5">{opp.description}</div>}
            </div>
          </label>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div>
          <div className="text-xs text-muted-foreground">Estimated Additional Revenue</div>
          <div className="text-lg font-bold text-primary">{estimatedRevenue}</div>
        </div>
        <Button
          size="sm"
          className="gradient-teal text-primary-foreground hover:opacity-90"
          onClick={() => onConfirm?.(selected)}
        >
          Confirm Selected ({selected.length})
        </Button>
      </div>
    </div>
  );
}

// --- Email Components Card ---
function EmailComponentsCard({ metadata }: { metadata: Record<string, unknown> | undefined }) {
  const router = useRouter();
  const subject = (metadata?.subject as string) ?? "Email Preview";
  const previewText = (metadata?.preview_text as string) ?? "";
  const templateId = metadata?.template_id as string | undefined;

  return (
    <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Mail size={20} className="text-primary" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-foreground">{subject}</div>
          {previewText && <div className="text-xs text-muted-foreground">{previewText}</div>}
        </div>
      </div>
      {typeof metadata?.preview_html === "string" && (
        <div className="rounded-lg border border-border overflow-hidden bg-background max-h-48 overflow-y-auto">
          <div className="scale-75 origin-top-left w-[133%]" dangerouslySetInnerHTML={{ __html: metadata.preview_html as string }} />
        </div>
      )}
      <Button
        onClick={() => router.push(templateId ? `/editor?templateId=${templateId}` : "/editor")}
        size="sm"
        className="w-full gradient-teal text-primary-foreground hover:opacity-90"
      >
        Open in Editor
      </Button>
    </div>
  );
}

// --- Empty State ---
function EmptyState({ onSelect }: { onSelect: (text: string) => void }) {
  const suggestions = [
    { icon: Search, label: "Audit my Klaviyo account", desc: "Full 14-point email marketing audit" },
    { icon: MailPlus, label: "Create a welcome email", desc: "Generate a branded welcome series" },
    { icon: Sparkles, label: "Analyze my competitors", desc: "Competitive email strategy breakdown" },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
      <div className="w-16 h-16 rounded-2xl gradient-teal flex items-center justify-center">
        <Bot size={28} className="text-primary-foreground" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground">How can I help?</h3>
        <p className="text-sm text-muted-foreground mt-1">Ask me anything about your email marketing</p>
      </div>
      <div className="grid gap-3 w-full max-w-md">
        {suggestions.map((s) => (
          <button
            key={s.label}
            onClick={() => onSelect(s.label)}
            className="flex items-center gap-4 p-4 rounded-xl glass-card hover:bg-secondary/50 transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
              <s.icon size={18} className="text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">{s.label}</div>
              <div className="text-xs text-muted-foreground">{s.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// --- Main Chat ---
export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Load or create conversation
  useEffect(() => {
    const load = async () => {
      try {
        const convos = await api.getConversations();
        const list = Array.isArray(convos) ? convos : [];
        if (list.length > 0) {
          setActiveConversationId((list[0] as { id: string }).id);
        } else {
          const newConvo = await api.createConversation() as { id: string };
          setActiveConversationId(newConvo.id);
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeConversationId) return;
    const loadMessages = async () => {
      try {
        const msgs = await api.getMessages(activeConversationId);
        setMessages(Array.isArray(msgs) ? msgs as Message[] : []);
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };
    loadMessages();
  }, [activeConversationId]);

  // Supabase Realtime subscription
  useEffect(() => {
    if (!activeConversationId) return;

    const channel = supabase
      .channel(`messages:${activeConversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setIsTyping(false);
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId]);

  const send = async (text?: string) => {
    const msgText = text || input;
    if (!msgText.trim() || !activeConversationId || sending) return;
    setInput("");
    setSending(true);
    setIsTyping(true);

    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: msgText,
      message_type: "text",
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      await api.sendMessage(msgText, activeConversationId);
    } catch (err) {
      console.error("Failed to send message:", err);
      setIsTyping(false);
    } finally {
      setSending(false);
    }
  };

  const renderMessageContent = (msg: Message) => {
    switch (msg.message_type) {
      case "audit_result":
        return (
          <>
            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
            <AuditCard metadata={msg.metadata} />
          </>
        );
      case "email_components":
        return (
          <>
            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
            <EmailComponentsCard metadata={msg.metadata} />
          </>
        );
      default:
        return (
          <div className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isTyping ? (
          <EmptyState onSelect={(text) => send(text)} />
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full gradient-teal flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-primary-foreground" />
                  </div>
                )}
                <div className={`max-w-xl rounded-xl p-4 text-sm ${
                  msg.role === "user"
                    ? "bg-primary/20 text-foreground"
                    : "glass-card text-foreground"
                }`}>
                  {renderMessageContent(msg)}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && <TypingIndicator />}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Input
            placeholder="Ask Animus anything about your email marketing..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            className="bg-secondary/50 border-border"
            disabled={sending}
          />
          <Button onClick={() => send()} className="gradient-teal text-primary-foreground hover:opacity-90" size="icon" disabled={sending}>
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </Button>
        </div>
      </div>

      <StrategyDocument open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}
