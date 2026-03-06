import { X, Download, Share2, TrendingUp, Mail, Users, DollarSign, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const revenueProjection = [
  { month: "Month 1", current: 12000, projected: 14500 },
  { month: "Month 2", current: 13500, projected: 18200 },
  { month: "Month 3", current: 14000, projected: 23000 },
  { month: "Month 4", current: 14200, projected: 28500 },
  { month: "Month 5", current: 15000, projected: 34000 },
  { month: "Month 6", current: 15500, projected: 41000 },
];

const flowImpact = [
  { name: "Welcome Series", revenue: 8200, rate: 42 },
  { name: "Abandoned Cart", revenue: 12400, rate: 38 },
  { name: "Post-Purchase", revenue: 5600, rate: 55 },
  { name: "Win-Back", revenue: 3200, rate: 22 },
  { name: "VIP Rewards", revenue: 6800, rate: 48 },
];

const channelSplit = [
  { name: "Email", value: 62, color: "hsl(var(--primary))" },
  { name: "SMS", value: 24, color: "hsl(var(--accent))" },
  { name: "Push", value: 14, color: "hsl(var(--muted-foreground))" },
];

const auditFindings = [
  { area: "Deliverability", score: 72, recommendation: "Implement sunset policy for 90-day inactive subscribers" },
  { area: "List Hygiene", score: 58, recommendation: "Remove 2,340 hard bounces and role-based addresses" },
  { area: "Flow Coverage", score: 45, recommendation: "Missing post-purchase and win-back flows — add immediately" },
  { area: "Brand Consistency", score: 83, recommendation: "Email templates aligned with brand kit; minor CTA improvements" },
  { area: "Revenue Attribution", score: 67, recommendation: "Enable UTM tracking on all automated flows for accurate attribution" },
];

interface StrategyDocumentProps {
  open: boolean;
  onClose: () => void;
}

export default function StrategyDocument({ open, onClose }: StrategyDocumentProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-3xl h-full bg-card border-l border-border overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-primary/20 text-primary border-0 text-xs">Strategy Report</Badge>
              <Badge variant="outline" className="text-xs">Generated just now</Badge>
            </div>
            <h2 className="text-xl font-bold text-foreground">Lumière Skincare — Email Strategy</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Share2 size={14} /> Share
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download size={14} /> Export PDF
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>
        </div>

        {/* Document Body */}
        <div className="p-6 space-y-8">
          {/* Executive Summary */}
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-3">Executive Summary</h3>
            <div className="glass-card p-5 rounded-xl space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                After analyzing your Shopify store, Klaviyo account, and brand assets, we&apos;ve identified
                <span className="text-foreground font-medium"> $41,000 in potential monthly email revenue </span>
                — a <span className="text-primary font-semibold">164% increase</span> from your current $15,500/mo.
                This strategy focuses on 5 automated flows, list hygiene improvements, and multi-channel expansion.
              </p>
              <div className="grid grid-cols-3 gap-4 pt-2">
                {[
                  { icon: DollarSign, label: "Projected Revenue", value: "$41K/mo" },
                  { icon: Mail, label: "New Flows", value: "5 Automated" },
                  { icon: Users, label: "Recoverable Subs", value: "2,340" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-3 rounded-lg bg-secondary/50">
                    <stat.icon size={18} className="text-primary mx-auto mb-1" />
                    <div className="text-lg font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Revenue Projection Chart */}
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" /> Revenue Projection
            </h3>
            <Card className="bg-secondary/30 border-border">
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={revenueProjection}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${v / 1000}k`} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      formatter={(value) => [`$${(value as number).toLocaleString()}`, undefined]}
                    />
                    <Area type="monotone" dataKey="current" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground) / 0.1)" strokeDasharray="4 4" name="Current Pace" />
                    <Area type="monotone" dataKey="projected" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" name="With Animus" />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-6 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-muted-foreground inline-block" style={{ borderTop: "2px dashed" }} /> Current Pace</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary inline-block" /> With Animus</span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* 14-Point Audit */}
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Target size={18} className="text-primary" /> Technical Audit Findings
            </h3>
            <div className="space-y-3">
              {auditFindings.map((item) => (
                <div key={item.area} className="glass-card rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{item.area}</span>
                    <Badge variant={item.score >= 70 ? "default" : "destructive"} className="text-xs">
                      {item.score}/100
                    </Badge>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-secondary mb-2">
                    <div
                      className={`h-full rounded-full ${item.score >= 70 ? "bg-primary" : "bg-destructive"}`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{item.recommendation}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Flow Impact */}
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-3">Recommended Flows & Projected Impact</h3>
            <Card className="bg-secondary/30 border-border">
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={flowImpact} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${v / 1000}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={110} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      formatter={(value) => [`$${(value as number).toLocaleString()}/mo`, "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </section>

          {/* Channel Mix */}
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-3">Recommended Channel Mix</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-secondary/30 border-border">
                <CardContent className="pt-6 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={channelSplit} dataKey="value" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                        {channelSplit.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                        formatter={(value) => [`${value as number}%`, undefined]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <div className="space-y-3 flex flex-col justify-center">
                {channelSplit.map((ch) => (
                  <div key={ch.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ch.color }} />
                    <span className="text-sm text-foreground flex-1">{ch.name}</span>
                    <span className="text-sm font-semibold text-foreground">{ch.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Next Steps */}
          <section className="pb-8">
            <h3 className="text-lg font-semibold text-foreground mb-3">Next Steps</h3>
            <div className="glass-card rounded-xl p-5 space-y-3">
              {[
                "Clean subscriber list — remove 2,340 invalid addresses",
                "Activate Welcome Series flow (3 emails, brand-matched)",
                "Deploy Abandoned Cart recovery (3-touch sequence)",
                "Set up Post-Purchase flow with cross-sell recommendations",
                "Launch Win-Back campaign for 90-day inactive segment",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
