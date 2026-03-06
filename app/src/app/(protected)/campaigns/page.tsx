"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, AlertTriangle, UserPlus, ShoppingCart, RotateCcw, Sparkles, Loader2 } from "lucide-react";

const segments = [
  { title: "VIP Customers", pct: 15, count: "3,675", color: "bg-purple-500/20 border-purple-500/30 text-purple-400", icon: Crown, desc: "High-value repeat purchasers" },
  { title: "At-Risk Churners", pct: 8, count: "1,960", color: "bg-red-500/20 border-red-500/30 text-red-400", icon: AlertTriangle, desc: "No purchase in 60+ days" },
  { title: "New Subscribers", pct: 22, count: "5,390", color: "bg-blue-500/20 border-blue-500/30 text-blue-400", icon: UserPlus, desc: "Joined in the last 30 days" },
  { title: "Repeat Buyers", pct: 35, count: "8,575", color: "bg-green-500/20 border-green-500/30 text-green-400", icon: ShoppingCart, desc: "2+ orders lifetime" },
  { title: "Win-Back Targets", pct: 20, count: "4,900", color: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400", icon: RotateCcw, desc: "Previously active, now lapsed" },
];

const rules = [
  { rule: "Purchase frequency > 3x/month -> VIP", status: "active" },
  { rule: "Last order > 60 days -> At-Risk", status: "active" },
  { rule: "Signup within 30 days -> New Subscriber", status: "active" },
  { rule: "Cart abandoned 2x -> Win-Back", status: "generating" },
];

export default function Campaigns() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Smart Segmentation</h1>
          <p className="text-sm text-muted-foreground">AI-powered audience segments based on behavior</p>
        </div>
        <Badge variant="outline" className="border-primary/30 text-primary">
          <Sparkles size={12} className="mr-1" /> Auto-updating
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {segments.map((seg) => (
          <Card key={seg.title} className={`${seg.color} border cursor-pointer hover:scale-[1.02] transition-transform`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-background/20 flex items-center justify-center">
                  <seg.icon size={20} />
                </div>
                <span className="text-2xl font-bold">{seg.pct}%</span>
              </div>
              <h3 className="font-semibold text-foreground mb-1">{seg.title}</h3>
              <p className="text-xs text-muted-foreground mb-2">{seg.desc}</p>
              <div className="flex items-center gap-2">
                <Users size={12} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{seg.count} profiles</span>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-1.5 bg-background/20 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-current opacity-60" style={{ width: `${seg.pct}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Auto-generating rules card */}
        <Card className="border-dashed border-primary/20 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-primary" />
              <h3 className="font-semibold text-foreground">Auto-Generating Rules</h3>
            </div>
            <div className="space-y-2.5">
              {rules.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  {r.status === "generating" ? (
                    <Loader2 size={12} className="text-primary mt-0.5 animate-spin" />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500/50 mt-0.5 flex-shrink-0" />
                  )}
                  <span className="text-muted-foreground">{r.rule}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom stats bar */}
      <div className="glass-card rounded-lg px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-primary" />
            <span className="text-sm text-muted-foreground">Profiles analyzed:</span>
            <span className="text-sm font-bold text-foreground">24,500</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-primary" />
            <span className="text-sm text-muted-foreground">Revenue segments identified:</span>
            <span className="text-sm font-bold text-foreground">8</span>
          </div>
        </div>
        <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">Live</Badge>
      </div>
    </div>
  );
}
