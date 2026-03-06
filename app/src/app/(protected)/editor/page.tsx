"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, ShoppingBag, Mic, Check, Loader2, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import * as api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Template = {
  id: string;
  name: string;
  subject?: string;
  html?: string;
  status?: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const fallbackEmailHtml = `
<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px 30px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <div style="display: inline-block; background: linear-gradient(135deg, #2dd4bf, #14b8a6); color: #0f172a; font-weight: bold; padding: 8px 16px; border-radius: 8px; font-size: 20px;">Lumiere</div>
  </div>
  <h1 style="font-size: 28px; text-align: center; margin-bottom: 10px;">Welcome to Lumiere</h1>
  <p style="color: #94a3b8; text-align: center; margin-bottom: 30px;">Thank you for joining our community of skincare enthusiasts.</p>
  <div style="background: #1e293b; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h3 style="margin-bottom: 12px;">Your Personalized Routine</h3>
    <p style="color: #94a3b8; font-size: 14px;">Based on your preferences, we've curated the perfect starter routine:</p>
    <ul style="color: #94a3b8; font-size: 14px; padding-left: 20px;">
      <li>Morning: Vitamin C Serum + SPF Moisturizer</li>
      <li>Evening: Gentle Cleanser + Retinol Night Cream</li>
    </ul>
  </div>
  <div style="text-align: center;">
    <a href="#" style="display: inline-block; background: linear-gradient(135deg, #2dd4bf, #14b8a6); color: #0f172a; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Shop Your Routine</a>
  </div>
  <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 30px;">Lumiere Skincare - Unsubscribe</p>
</div>`;

export default function EmailEditor() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "I've analyzed your brand and product catalog. Ready to create a campaign email. What would you like to promote?" },
  ]);
  const [input, setInput] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [pushing, setPushing] = useState(false);
  const { toast } = useToast();

  // Load templates on mount
  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getTemplates();
        const list = Array.isArray(data) ? data as Template[] : [];
        setTemplates(list);
        if (list.length > 0) setSelectedTemplate(list[0]);
      } catch (err) {
        console.error("Failed to load templates:", err);
      } finally {
        setLoadingTemplates(false);
      }
    };
    load();
  }, []);

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I've updated the email based on your feedback. The changes are reflected in the live preview." },
      ]);
    }, 1000);
  };

  const handlePushToKlaviyo = async () => {
    if (!selectedTemplate) return;
    setPushing(true);
    try {
      await api.pushToKlaviyo(selectedTemplate.id);
      toast({ title: "Pushed to Klaviyo", description: `"${selectedTemplate.name}" has been pushed to Klaviyo.` });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setPushing(false);
    }
  };

  const emailHtml = selectedTemplate?.html || fallbackEmailHtml;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Top bar */}
      <div className="border-b border-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-foreground">Campaign Studio</h2>
          {templates.length > 1 && (
            <select
              className="text-xs bg-secondary/50 border border-border rounded px-2 py-1 text-foreground"
              value={selectedTemplate?.id || ""}
              onChange={(e) => {
                const t = templates.find((t) => t.id === e.target.value);
                if (t) setSelectedTemplate(t);
              }}
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs h-7">Save Draft</Button>
          <Button
            size="sm"
            className="gradient-teal text-primary-foreground text-xs h-7"
            onClick={handlePushToKlaviyo}
            disabled={pushing || !selectedTemplate}
          >
            {pushing ? <Loader2 size={12} className="animate-spin mr-1" /> : <ExternalLink size={12} className="mr-1" />}
            Push to Klaviyo
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left -- AI Chat */}
        <div className="w-1/2 border-r border-border flex flex-col">
          <div className="px-4 py-2 border-b border-border/50">
            <span className="text-xs font-medium text-muted-foreground">AI Chat</span>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full gradient-teal flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-primary-foreground" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-primary/20 text-foreground"
                    : "glass-card text-foreground"
                }`}>
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-border/50">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Describe what you want..."
                className="bg-secondary/30 border-border/50 text-sm"
              />
              <Button size="icon" className="gradient-teal text-primary-foreground h-9 w-9" onClick={send}>
                <Send size={14} />
              </Button>
            </div>
          </div>
        </div>

        {/* Right -- Live Email Preview */}
        <div className="w-1/2 flex flex-col">
          <div className="px-4 py-2 border-b border-border/50 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {loadingTemplates ? "Loading..." : selectedTemplate ? selectedTemplate.name : "Live Email Preview"}
            </span>
          </div>
          <div className="flex-1 overflow-auto bg-muted/10 p-6">
            {loadingTemplates ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : (
              <div className="max-w-[600px] mx-auto bg-background rounded-xl overflow-hidden shadow-lg border border-border/30">
                <div dangerouslySetInnerHTML={{ __html: emailHtml }} />
              </div>
            )}
          </div>

          {/* Bottom status bar */}
          <div className="border-t border-border/50 px-4 py-2 flex items-center gap-4">
            <Badge variant="outline" className="border-green-500/30 text-green-400 text-[10px]">
              <Check size={10} className="mr-1" /> Brand Voice: Matched
            </Badge>
            <Badge variant="outline" className="border-green-500/30 text-green-400 text-[10px]">
              <ShoppingBag size={10} className="mr-1" /> Shopify Products: Synced
            </Badge>
            <Badge variant="outline" className="border-primary/30 text-primary text-[10px]">
              <Mic size={10} className="mr-1" /> Tone: Friendly
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
